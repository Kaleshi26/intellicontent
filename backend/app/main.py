# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, status, Request, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import uvicorn
import logging
import os
import json
import io
import zipfile
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import asyncio

from . import models, schemas, auth, database, ai_service
from .config import settings
from .database import engine

# Configure logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize AI models
ai_service.init_local_models()

# Create upload directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="IntelliContent API",
    version="1.0.0",
    description="AI-powered content generation platform",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Health check endpoint
@app.get("/health", response_model=schemas.HealthCheck)
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check database
        db = next(database.get_db())
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    try:
        # Check Redis
        import redis
        redis_client = redis.from_url(settings.REDIS_URL)
        redis_client.ping()
        redis_status = "healthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"
    
    try:
        # Check AI service
        ai_service.init_local_models()
        ai_status = "healthy"
    except Exception as e:
        ai_status = f"unhealthy: {str(e)}"
    
    overall_status = "healthy" if all(
        status == "healthy" for status in [db_status, redis_status, ai_status]
    ) else "degraded"
    
    return schemas.HealthCheck(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version="1.0.0",
        database=db_status,
        redis=redis_status,
        ai_service=ai_status
    )

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to IntelliContent API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "Documentation not available in production"
    }

# Authentication endpoints
@app.post("/register", response_model=schemas.User)
async def register(
    user: schemas.UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """Register a new user with email verification"""
    # Check if user already exists
    db_user = db.query(models.User).filter(
        or_(models.User.email == user.email, models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email or username already registered"
        )
    
    # Create user
    hashed_password = auth.get_password_hash(user.password)
    verification_token = auth.create_verification_token()
    
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        bio=user.bio,
        is_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create user analytics
    user_analytics = models.UserAnalytics(user_id=db_user.id)
    db.add(user_analytics)
    db.commit()
    
    # Send verification email
    if settings.SMTP_USERNAME:
        background_tasks.add_task(
            auth.send_verification_email,
            user.email,
            verification_token
        )
    
    return db_user

@app.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(database.get_db)
):
    """Verify user email address"""
    if not auth.verify_email_token(db, token):
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    # In a real implementation, you'd look up the token in the database
    # and update the user's verification status
    return {"message": "Email verified successfully"}

@app.post("/resend-verification")
async def resend_verification(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """Resend email verification"""
    user = auth.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    verification_token = auth.create_verification_token()
    
    if settings.SMTP_USERNAME:
        background_tasks.add_task(
            auth.send_verification_email,
            email,
            verification_token
        )
    
    return {"message": "Verification email sent"}

@app.post("/forgot-password")
async def forgot_password(
    request: schemas.PasswordReset,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """Send password reset email"""
    user = auth.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reset_token = auth.create_password_reset_token()
    
    if settings.SMTP_USERNAME:
        background_tasks.add_task(
            auth.send_password_reset_email,
            request.email,
            reset_token
        )
    
    return {"message": "Password reset email sent"}

@app.post("/reset-password")
async def reset_password(
    request: schemas.PasswordResetConfirm,
    db: Session = Depends(database.get_db)
):
    """Reset user password"""
    if not auth.verify_password_reset_token(db, request.token):
        raise HTTPException(status_code=400, detail="Invalid reset token")
    
    # In a real implementation, you'd look up the token in the database
    # and update the user's password
    return {"message": "Password reset successfully"}

@app.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: Session = Depends(database.get_db)
):
    """Login user and create session"""
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check rate limiting
    if not auth.check_rate_limit(db, user.id, "login", 5, 15):  # 5 attempts per 15 minutes
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(data={"sub": user.username})
    
    # Create session
    session_token = auth.create_verification_token()
    auth.create_user_session(db, user.id, request, session_token)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.post("/refresh-token", response_model=schemas.Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(database.get_db)
):
    """Refresh access token using refresh token"""
    try:
        payload = auth.verify_token(refresh_token, "refresh")
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        user = auth.get_user(db, username)
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@app.post("/logout")
async def logout(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Logout user and revoke all sessions"""
    revoked_count = auth.revoke_all_sessions(db, current_user.id)
    return {"message": f"Logged out successfully. {revoked_count} sessions revoked."}

# User management endpoints
@app.get("/users/me", response_model=schemas.UserProfile)
async def get_current_user_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get current user profile with analytics"""
    analytics = db.query(models.UserAnalytics).filter(
        models.UserAnalytics.user_id == current_user.id
    ).first()
    
    user_data = current_user.__dict__.copy()
    if analytics:
        user_data["analytics"] = analytics.__dict__
    
    return user_data

@app.put("/users/me", response_model=schemas.User)
async def update_user_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Update user profile"""
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/users/me/sessions")
async def get_user_sessions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get user's active sessions"""
    sessions = auth.get_user_sessions(db, current_user.id)
    return sessions

@app.delete("/users/me/sessions/{session_token}")
async def revoke_session(
    session_token: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Revoke a specific session"""
    success = auth.revoke_session(db, session_token, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session revoked successfully"}

# Content generation endpoints
@app.post("/generate", response_model=schemas.Content)
async def generate_content(
    request: schemas.GenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Generate AI content with enhanced features"""
    # Check rate limiting
    if not auth.check_rate_limit(db, current_user.id, "generate", 50, 60):  # 50 requests per hour
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )
    
    try:
        # Generate content using AI service
        generated_content, model_used, metadata = await ai_service.AIService.generate_content(
            prompt=request.prompt,
            content_type=request.content_type,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            language=request.language,
            style=request.style,
            **request.metadata
        )
        
        # Create title from prompt
        title = request.prompt[:50] + "..." if len(request.prompt) > 50 else request.prompt
        
        # Save to database
        db_content = models.Content(
            title=title,
            content_type=request.content_type,
            input_text=request.prompt,
            generated_content=generated_content,
            model_used=model_used,
            status=models.ContentStatus.GENERATED,
            tags=request.tags,
            metadata={**request.metadata, **metadata},
            generation_time=metadata.get("generation_time"),
            tokens_used=metadata.get("tokens_used"),
            temperature=request.temperature,
            language=request.language,
            style=request.style,
            user_id=current_user.id
        )
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
        
        # Update user analytics
        analytics = db.query(models.UserAnalytics).filter(
            models.UserAnalytics.user_id == current_user.id
        ).first()
        if analytics:
            analytics.total_generations += 1
            analytics.total_tokens_used += metadata.get("tokens_used", 0)
            analytics.last_generation_date = datetime.utcnow()
            
            # Calculate average generation time
            if analytics.average_generation_time:
                analytics.average_generation_time = (
                    analytics.average_generation_time + metadata.get("generation_time", 0)
                ) / 2
            else:
                analytics.average_generation_time = metadata.get("generation_time", 0)
            
            db.commit()
        
        return db_content
        
    except Exception as e:
        logger.error(f"Content generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/batch", response_model=List[Dict[str, Any]])
async def generate_batch_content(
    request: schemas.BatchGenerateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Generate multiple content pieces in batch"""
    # Check rate limiting
    if not auth.check_rate_limit(db, current_user.id, "batch_generate", 10, 60):  # 10 batches per hour
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )
    
    # Convert requests to dict format
    requests = [req.dict() for req in request.requests]
    
    # Generate content
    results = await ai_service.AIService.generate_batch_content(requests)
    
    # Save successful generations to database
    for i, result in enumerate(results):
        if result["success"]:
            req = request.requests[i]
            title = req.prompt[:50] + "..." if len(req.prompt) > 50 else req.prompt
            
            db_content = models.Content(
                title=title,
                content_type=req.content_type,
                input_text=req.prompt,
                generated_content=result["content"],
                model_used=result["model"],
                status=models.ContentStatus.GENERATED,
                tags=req.tags,
                metadata=result["metadata"],
                generation_time=result["metadata"].get("generation_time"),
                tokens_used=result["metadata"].get("tokens_used"),
                temperature=req.temperature,
                language=req.language,
                style=req.style,
                user_id=current_user.id
            )
            db.add(db_content)
    
    db.commit()
    return results

@app.post("/optimize-prompt", response_model=schemas.PromptOptimizationResponse)
async def optimize_prompt(
    request: schemas.PromptOptimizationRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Optimize user prompt for better AI generation"""
    optimized_prompt = await ai_service.AIService.optimize_prompt(
        request.prompt, request.content_type
    )
    suggestions = await ai_service.AIService.get_content_suggestions(
        request.prompt, request.content_type
    )
    
    return schemas.PromptOptimizationResponse(
        optimized_prompt=optimized_prompt,
        suggestions=suggestions
    )

# Content management endpoints
@app.get("/contents", response_model=List[schemas.Content])
async def get_user_contents(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get user's content with filtering and search"""
    query = db.query(models.Content).filter(models.Content.user_id == current_user.id)
    
    # Apply filters
    if content_type:
        query = query.filter(models.Content.content_type == content_type)
    
    if search:
        query = query.filter(
            or_(
                models.Content.title.contains(search),
                models.Content.input_text.contains(search),
                models.Content.generated_content.contains(search)
            )
        )
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query = query.filter(models.Content.tags.contains(tag_list))
    
    # Apply pagination
    contents = query.order_by(desc(models.Content.created_at)).offset(skip).limit(limit).all()
    return contents

@app.get("/contents/{content_id}", response_model=schemas.Content)
async def get_content(
    content_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get specific content by ID"""
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@app.put("/contents/{content_id}", response_model=schemas.Content)
async def update_content(
    content_id: int,
    content_update: schemas.ContentUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Update content"""
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    for field, value in content_update.dict(exclude_unset=True).items():
        setattr(content, field, value)
    
    content.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(content)
    return content

@app.delete("/contents/{content_id}")
async def delete_content(
    content_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete content"""
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(content)
    db.commit()
    return {"message": "Content deleted successfully"}

# Content sharing endpoints
@app.post("/contents/{content_id}/share", response_model=schemas.ContentShare)
async def share_content(
    content_id: int,
    share_request: schemas.ContentShareRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Share content with a public link"""
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Create share token
    share_token = auth.create_verification_token()
    expires_at = datetime.utcnow() + timedelta(hours=share_request.expires_in_hours)
    
    # Create share record
    content_share = models.ContentShare(
        content_id=content_id,
        share_token=share_token,
        expires_at=expires_at
    )
    db.add(content_share)
    
    # Update content
    content.is_shared = True
    content.share_token = share_token
    
    db.commit()
    db.refresh(content_share)
    return content_share

@app.get("/shared/{share_token}", response_model=schemas.Content)
async def get_shared_content(
    share_token: str,
    db: Session = Depends(database.get_db)
):
    """Get shared content by token"""
    content_share = db.query(models.ContentShare).filter(
        models.ContentShare.share_token == share_token,
        models.ContentShare.is_active == True,
        models.ContentShare.expires_at > datetime.utcnow()
    ).first()
    
    if not content_share:
        raise HTTPException(status_code=404, detail="Shared content not found or expired")
    
    # Increment view count
    content_share.view_count += 1
    db.commit()
    
    # Get the content
    content = db.query(models.Content).filter(
        models.Content.id == content_share.content_id
    ).first()
    
    return content

# Content export endpoints
@app.post("/contents/{content_id}/export")
async def export_content(
    content_id: int,
    export_type: str = Query(..., regex="^(pdf|markdown|json|docx)$"),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Export content in various formats"""
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.user_id == current_user.id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if export_type == "pdf":
        return await export_to_pdf(content)
    elif export_type == "markdown":
        return await export_to_markdown(content)
    elif export_type == "json":
        return await export_to_json(content)
    elif export_type == "docx":
        return await export_to_docx(content)

async def export_to_pdf(content: models.Content):
    """Export content to PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title = Paragraph(content.title, styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    # Content type and metadata
    meta_text = f"Type: {content.content_type} | Model: {content.model_used} | Created: {content.created_at.strftime('%Y-%m-%d %H:%M')}"
    meta = Paragraph(meta_text, styles['Normal'])
    story.append(meta)
    story.append(Spacer(1, 12))
    
    # Input prompt
    story.append(Paragraph("Input Prompt:", styles['Heading2']))
    story.append(Paragraph(content.input_text, styles['Normal']))
    story.append(Spacer(1, 12))
    
    # Generated content
    story.append(Paragraph("Generated Content:", styles['Heading2']))
    story.append(Paragraph(content.generated_content, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(buffer.getvalue()),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={content.title}.pdf"}
    )

async def export_to_markdown(content: models.Content):
    """Export content to Markdown"""
    markdown_content = f"""# {content.title}

**Type:** {content.content_type}  
**Model:** {content.model_used}  
**Created:** {content.created_at.strftime('%Y-%m-%d %H:%M')}

## Input Prompt

{content.input_text}

## Generated Content

{content.generated_content}
"""
    
    return StreamingResponse(
        io.StringIO(markdown_content),
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={content.title}.md"}
    )

async def export_to_json(content: models.Content):
    """Export content to JSON"""
    json_data = {
        "title": content.title,
        "content_type": content.content_type,
        "input_text": content.input_text,
        "generated_content": content.generated_content,
        "model_used": content.model_used,
        "created_at": content.created_at.isoformat(),
        "metadata": content.metadata,
        "tags": content.tags
    }
    
    return StreamingResponse(
        io.StringIO(json.dumps(json_data, indent=2)),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={content.title}.json"}
    )

async def export_to_docx(content: models.Content):
    """Export content to DOCX (placeholder)"""
    # This would require python-docx library
    raise HTTPException(status_code=501, detail="DOCX export not implemented yet")

# Analytics endpoints
@app.get("/analytics/user", response_model=schemas.UserAnalytics)
async def get_user_analytics(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get user analytics"""
    analytics = db.query(models.UserAnalytics).filter(
        models.UserAnalytics.user_id == current_user.id
    ).first()
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics not found")
    return analytics

@app.get("/analytics/system")
async def get_system_analytics(
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(database.get_db)
):
    """Get system-wide analytics (admin only)"""
    # Get today's analytics
    today = datetime.utcnow().date()
    analytics = db.query(models.SystemAnalytics).filter(
        func.date(models.SystemAnalytics.date) == today
    ).first()
    
    if not analytics:
        # Create new analytics record
        analytics = models.SystemAnalytics()
        db.add(analytics)
        db.commit()
        db.refresh(analytics)
    
    return analytics

# Template endpoints
@app.get("/templates", response_model=List[schemas.ContentTemplate])
async def get_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    content_type: Optional[str] = None,
    featured_only: bool = False,
    current_user: Optional[models.User] = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get content templates"""
    query = db.query(models.ContentTemplate).filter(
        or_(
            models.ContentTemplate.is_public == True,
            models.ContentTemplate.user_id == current_user.id if current_user else False
        )
    )
    
    if content_type:
        query = query.filter(models.ContentTemplate.content_type == content_type)
    
    if featured_only:
        query = query.filter(models.ContentTemplate.is_featured == True)
    
    templates = query.order_by(desc(models.ContentTemplate.usage_count)).offset(skip).limit(limit).all()
    return templates

@app.post("/templates", response_model=schemas.ContentTemplate)
async def create_template(
    template: schemas.ContentTemplateCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a new content template"""
    db_template = models.ContentTemplate(
        name=template.name,
        description=template.description,
        content_type=template.content_type,
        prompt_template=template.prompt_template,
        parameters=template.parameters,
        is_public=template.is_public,
        user_id=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

# Admin endpoints
@app.get("/admin/users", response_model=List[schemas.User])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(database.get_db)
):
    """Get all users (admin only)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.put("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: models.UserRole,
    admin_user: models.User = Depends(auth.get_admin_user),
    db: Session = Depends(database.get_db)
):
    """Update user role (admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    db.commit()
    return {"message": "User role updated successfully"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)