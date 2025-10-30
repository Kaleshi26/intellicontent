# backend/app/schemas.py
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class ContentStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class User(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    role: UserRole
    preferences: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

class UserProfile(User):
    analytics: Optional[Dict[str, Any]] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class ContentBase(BaseModel):
    title: str
    content_type: str
    input_text: str
    tags: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None
    status: Optional[ContentStatus] = None

class Content(ContentBase):
    id: int
    generated_content: str
    model_used: str
    status: ContentStatus
    is_public: bool
    is_shared: bool
    share_token: Optional[str]
    generation_time: Optional[float]
    tokens_used: Optional[int]
    temperature: Optional[float]
    language: str
    style: str
    created_at: datetime
    updated_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True

class ContentWithOwner(Content):
    owner: User

class GenerateRequest(BaseModel):
    prompt: str
    content_type: str
    model: Optional[str] = "gpt-3.5-turbo"
    max_tokens: Optional[int] = 500
    temperature: Optional[float] = 0.7
    language: Optional[str] = "en"
    style: Optional[str] = "professional"
    tags: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}

class BatchGenerateRequest(BaseModel):
    requests: List[GenerateRequest]

class ContentTemplateBase(BaseModel):
    name: str
    description: str
    content_type: str
    prompt_template: str
    parameters: Optional[Dict[str, Any]] = {}

class ContentTemplateCreate(ContentTemplateBase):
    is_public: Optional[bool] = False

class ContentTemplate(ContentTemplateBase):
    id: int
    is_public: bool
    is_featured: bool
    usage_count: int
    created_at: datetime
    updated_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True

class ContentExportRequest(BaseModel):
    content_id: int
    export_type: str  # pdf, markdown, json, docx

class ContentExport(BaseModel):
    id: int
    content_id: int
    export_type: str
    file_path: str
    file_size: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ContentShareRequest(BaseModel):
    content_id: int
    expires_in_hours: Optional[int] = 24

class ContentShare(BaseModel):
    id: int
    content_id: int
    share_token: str
    expires_at: datetime
    is_active: bool
    view_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserAnalytics(BaseModel):
    id: int
    user_id: int
    total_generations: int
    total_tokens_used: int
    favorite_content_type: Optional[str]
    average_generation_time: Optional[float]
    last_generation_date: Optional[datetime]
    streak_days: int
    level: int
    experience_points: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SystemAnalytics(BaseModel):
    id: int
    date: datetime
    total_users: int
    total_generations: int
    total_tokens_used: int
    popular_content_types: Dict[str, Any]
    popular_models: Dict[str, Any]
    average_generation_time: Optional[float]
    error_rate: Optional[float]
    cache_hit_rate: Optional[float]
    
    class Config:
        from_attributes = True

class WebhookCreate(BaseModel):
    url: str
    events: List[str]
    secret: Optional[str] = None

class Webhook(BaseModel):
    id: int
    user_id: int
    url: str
    events: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PromptOptimizationRequest(BaseModel):
    prompt: str
    content_type: str

class PromptOptimizationResponse(BaseModel):
    optimized_prompt: str
    suggestions: List[str]

class ContentSuggestionRequest(BaseModel):
    prompt: str
    content_type: str

class ContentSuggestionResponse(BaseModel):
    suggestions: List[str]

class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    database: str
    redis: str
    ai_service: str

class RateLimitInfo(BaseModel):
    limit: int
    remaining: int
    reset_time: datetime

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None