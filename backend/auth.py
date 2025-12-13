import logging
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# Configuration
DEFAULT_SECRET_KEY = "your-secret-key-keep-it-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

_logged_missing_secret_warning = False
_logged_placeholder_warning = False

__all__ = [
    'Token', 'create_access_token', 'get_current_user', 'USERS_DB',
    'verify_password', 'get_password_hash', 'ACCESS_TOKEN_EXPIRE_MINUTES'
]

# Admin Users (Hardcoded as requested)
# Using simple SHA256 hashing for passwords
from argon2 import PasswordHasher

_password_hasher = PasswordHasher()

def hash_password(password: str) -> str:
    """Hash password using Argon2 (memory hard, salt included)"""
    return _password_hasher.hash(password)

# Precomputed Argon2 hashes for: "fxdxudu18!", "123456!", "654321!"
USERS_DB = {
    "josemercadogc18@gmail.com": {
        "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$B5enxJ+VuM4+AbCyo+Tx0w$BU5XR3VWIUUmwWbji1PoRCRn7XRvnNO62Jz9S8P5ZeQ",  # fxdxudu18!
        "name": "Jose Mercado"
    },
    "matheuscastrocorrea@gmail.com": {
        "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$Updi0pwxbzu026Jm3YAnbA$q/WhS5d2YAqya6QVkdxnpMemG6IcyMCaqtEItiBNHzM",  # 123456!
        "name": "Matheus Castro"
    },
    "jc@juicyscore.ai": {
        "password_hash": "$argon2id$v=19$m=65536,t=3,p=4$FE7QvKuHYvPz4aHgY5DDlg$J4tQyPsOfHTEJF3R60hjhJ6nyVbqv8NO6dsl4M/Nbpo",  # 654321!
        "name": "JC"
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

logger = logging.getLogger(__name__)


def _get_secret_key() -> str:
    global _logged_missing_secret_warning, _logged_placeholder_warning
    secret_key = os.getenv("SECRET_KEY")

    if not secret_key:
        if not _logged_missing_secret_warning:
            logger.warning("SECRET_KEY environment variable not set; using default placeholder key.")
            _logged_missing_secret_warning = True
        secret_key = DEFAULT_SECRET_KEY

    if secret_key == DEFAULT_SECRET_KEY and not _logged_placeholder_warning:
        logger.warning("Using default SECRET_KEY; set the SECRET_KEY environment variable for production use.")
        _logged_placeholder_warning = True

    return secret_key

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

def verify_password(plain_password, hashed_password):
    """
    Verifies a password against an Argon2 hash.
    """
    try:
        return _password_hasher.verify(hashed_password, plain_password)
    except Exception:
        return False
    """
    Returns an Argon2 hash for the given password.
    """

def get_password_hash(password):
    return hash_password(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    secret_key = _get_secret_key()

    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
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
