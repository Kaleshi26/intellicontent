# backend/app/auth.py
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_
import secrets
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from . import models, schemas, database
from .config import settings

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)  # 30 days for refresh token
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_verification_token():
    return secrets.token_urlsafe(32)

def create_password_reset_token():
    return secrets.token_urlsafe(32)

def verify_token(token: str, token_type: str = "access"):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = verify_token(token, "access")
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except HTTPException:
        raise
    except Exception:
        raise credentials_exception
    
    user = get_user(db, username=token_data.username)
    if user is None or not user.is_active:
        raise credentials_exception
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

async def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_moderator_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def create_user_session(db: Session, user_id: int, request: Request, session_token: str):
    """Create a new user session"""
    session = models.UserSession(
        user_id=user_id,
        session_token=session_token,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent", ""),
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    db.add(session)
    db.commit()
    return session

def get_user_sessions(db: Session, user_id: int):
    """Get all active sessions for a user"""
    return db.query(models.UserSession).filter(
        and_(
            models.UserSession.user_id == user_id,
            models.UserSession.is_active == True,
            models.UserSession.expires_at > datetime.utcnow()
        )
    ).all()

def revoke_session(db: Session, session_token: str, user_id: int):
    """Revoke a specific session"""
    session = db.query(models.UserSession).filter(
        and_(
            models.UserSession.session_token == session_token,
            models.UserSession.user_id == user_id
        )
    ).first()
    if session:
        session.is_active = False
        db.commit()
        return True
    return False

def revoke_all_sessions(db: Session, user_id: int):
    """Revoke all sessions for a user"""
    sessions = db.query(models.UserSession).filter(
        and_(
            models.UserSession.user_id == user_id,
            models.UserSession.is_active == True
        )
    ).all()
    for session in sessions:
        session.is_active = False
    db.commit()
    return len(sessions)

def send_verification_email(email: str, token: str):
    """Send email verification email"""
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = email
        msg['Subject'] = "Verify your IntelliContent account"
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        body = f"""
        Welcome to IntelliContent!
        
        Please click the link below to verify your email address:
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_FROM_EMAIL, email, text)
        server.quit()
        
        logger.info(f"Verification email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {email}: {e}")
        return False

def send_password_reset_email(email: str, token: str):
    """Send password reset email"""
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = email
        msg['Subject'] = "Reset your IntelliContent password"
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        body = f"""
        You requested a password reset for your IntelliContent account.
        
        Please click the link below to reset your password:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_FROM_EMAIL, email, text)
        server.quit()
        
        logger.info(f"Password reset email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {e}")
        return False

def verify_email_token(db: Session, token: str):
    """Verify email verification token"""
    # In a real implementation, you'd store this token in the database
    # For now, we'll just check if it's a valid format
    if len(token) == 43:  # Base64 URL safe token length
        return True
    return False

def verify_password_reset_token(db: Session, token: str):
    """Verify password reset token"""
    # In a real implementation, you'd store this token in the database
    # For now, we'll just check if it's a valid format
    if len(token) == 43:  # Base64 URL safe token length
        return True
    return False

def check_rate_limit(db: Session, user_id: int, endpoint: str, limit: int = 100, window_minutes: int = 60):
    """Check if user has exceeded rate limit for an endpoint"""
    window_start = datetime.utcnow() - timedelta(minutes=window_minutes)
    
    # Clean old rate limit records
    db.query(models.RateLimit).filter(
        models.RateLimit.window_start < window_start
    ).delete()
    
    # Check current rate limit
    current_count = db.query(models.RateLimit).filter(
        and_(
            models.RateLimit.user_id == user_id,
            models.RateLimit.endpoint == endpoint,
            models.RateLimit.window_start >= window_start
        )
    ).count()
    
    if current_count >= limit:
        return False
    
    # Record this request
    rate_limit = models.RateLimit(
        user_id=user_id,
        endpoint=endpoint,
        request_count=1
    )
    db.add(rate_limit)
    db.commit()
    
    return True