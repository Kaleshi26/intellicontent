
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ContentBase(BaseModel):
    title: str
    content_type: str
    input_text: str

class ContentCreate(ContentBase):
    pass

class Content(ContentBase):
    id: int
    generated_content: str
    model_used: str
    created_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    prompt: str
    content_type: str  # text, code, summary
    model: Optional[str] = "gpt-3.5-turbo"
    max_tokens: Optional[int] = 500