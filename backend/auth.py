# auth.py
import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

# Configuration for JWTs and password hashing
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key") # Use environment variables for security
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# `CryptContext` is used for password hashing and verification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# `OAuth2PasswordBearer` is a FastAPI utility for handling OAuth2 token schemes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Password Hashing Functions ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a password for secure storage."""
    return pwd_context.hash(password)

# --- JWT Token Functions ---
def create_access_token(data: dict) -> str:
    """Creates a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_email(token: str = Depends(oauth2_scheme)) -> str:
    """
    Validates the JWT token and returns the user's email.
    This function is a dependency to be used in protected routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return email

from database import SessionLocal
import crud, models

# This new dependency gets the full User object, not just the email
def get_current_user(token: str = Depends(oauth2_scheme)) -> models.User:
    """
    Validates a JWT token and returns the full User object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = SessionLocal()
    user = crud.get_user_by_email(db, email=email)
    db.close()

    if user is None:
        raise credentials_exception
    
    return user