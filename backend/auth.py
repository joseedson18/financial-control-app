from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# Configuration
SECRET_KEY = "your-secret-key-keep-it-secret" # In production, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

__all__ = ['TOKEN', 'create_access_token', 'get_current_user', 'USERS_DB', 'verify_password', 'get_password_hash', 'ACCESS_TOKEN_EXPIRE_MINUTES']

# Admin Users (Hardcoded as requested)
# Using simple SHA256 hashing for passwords
import hashlib

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

USERS_DB = {
    "josemercadogc18@gmail.com": {
        "password_hash": hash_password("fxdxudu18!"),
        "name": "Jose Mercado"
    },
    "matheuscastrocorrea@gmail.com": {
        "password_hash": "069f57dae98079b842a956e41d081e76487591a2ad65fa7a450717c1ab19767f", # Hash of 123456!
        "name": "Matheus Castro"
    },
    "jc@juicyscore.ai": {
        "password_hash": "06b8d0bd9f7f33fa0e46ad56186ed2fd9425e9c5aa808ea2b4be0293e6edb953", # Hash of 654321!
        "name": "JC"
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

def verify_password(plain_password, hashed_password):
    return hash_password(plain_password) == hashed_password

def get_password_hash(password):
    return hash_password(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = USERS_DB.get(token_data.username)
    if user is None:
        raise credentials_exception
    return user
