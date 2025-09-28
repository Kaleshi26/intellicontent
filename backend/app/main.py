# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import uvicorn

from . import models, schemas, auth, database, ai_service
from .config import settings
from .database import engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize AI models
ai_service.init_local_models()

app = FastAPI(title="IntelliContent API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to IntelliContent API"}

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email or username already registered"
        )
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/generate", response_model=schemas.Content)
async def generate_content(
    request: schemas.GenerateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        # Generate content using AI service
        generated_content, model_used = await ai_service.AIService.generate_content(
            prompt=request.prompt,
            content_type=request.content_type,
            model=request.model,
            max_tokens=request.max_tokens
        )
        
        # Save to database
        db_content = models.Content(
            title=request.prompt[:50] + "..." if len(request.prompt) > 50 else request.prompt,
            content_type=request.content_type,
            input_text=request.prompt,
            generated_content=generated_content,
            model_used=model_used,
            user_id=current_user.id
        )
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
        
        return db_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contents", response_model=List[schemas.Content])
def get_user_contents(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    contents = db.query(models.Content).filter(
        models.Content.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return contents

@app.get("/contents/{content_id}", response_model=schemas.Content)
def get_content(
    content_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@app.delete("/contents/{content_id}")
def delete_content(
    content_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)