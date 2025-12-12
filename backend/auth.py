import json
import logging
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

# Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

_logged_missing_secret_warning = False
_missing_admin_users_logged = False
_logged_invalid_admin_json = False
_secret_key_cache: Optional[str] = None
_users_cache_config: Optional[tuple] = None
_users_cache_value: Optional[dict] = None

# Load environment variables before reading configuration
load_dotenv()

__all__ = [
    'Token', 'create_access_token', 'ensure_auth_configured', 'get_current_user',
    'USERS_DB', 'verify_password', 'get_password_hash', 'ACCESS_TOKEN_EXPIRE_MINUTES'
]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Hash password using bcrypt with a per-password salt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    except ValueError:
        return False


def get_password_hash(password: str) -> str:
    return hash_password(password)


def _load_users_from_env() -> dict:
    """Load admin users from environment configuration.

    Supports a JSON array in ADMIN_USERS_JSON or the ADMIN_EMAIL/ADMIN_PASSWORD
    pair. Each entry is stored with a bcrypt password hash.
    """
    global _users_cache_config, _users_cache_value, _logged_invalid_admin_json

    env_json = os.getenv("ADMIN_USERS_JSON") or ""
    admin_email = os.getenv("ADMIN_EMAIL") or ""
    admin_password = os.getenv("ADMIN_PASSWORD") or ""
    admin_name = os.getenv("ADMIN_NAME") or "Administrator"

    cache_signature = (env_json, admin_email, admin_password, admin_name)
    if cache_signature == _users_cache_config and _users_cache_value is not None:
        return dict(_users_cache_value)

    users: dict[str, dict[str, str]] = {}

    if env_json:
        try:
            entries = json.loads(env_json)
            for entry in entries:
                email = entry.get("email")
                password = entry.get("password")
                password_hash = entry.get("password_hash")
                name = entry.get("name", "Admin")

                if not email:
                    logger.error("Skipping admin entry without email in ADMIN_USERS_JSON")
                    continue

                if not password and not password_hash:
                    logger.error("Skipping admin entry for %s without password or password_hash", email)
                    continue

                if password:
                    password_hash = hash_password(password)

                users[email] = {"password_hash": password_hash, "name": name}
        except json.JSONDecodeError as exc:
            if not _logged_invalid_admin_json:
                logger.error("Invalid ADMIN_USERS_JSON: %s", exc)
                _logged_invalid_admin_json = True

    if admin_email:
        if not admin_password:
            logger.error("ADMIN_PASSWORD must be set when ADMIN_EMAIL is provided")
        else:
            users[admin_email] = {
                "password_hash": hash_password(admin_password),
                "name": admin_name,
            }

    _users_cache_config = cache_signature
    _users_cache_value = dict(users)
    return users


USERS_DB = _load_users_from_env()


def _get_secret_key() -> str:
    """Obtain a strong secret key, preferring an explicit environment value."""
    global _logged_missing_secret_warning, _secret_key_cache

    env_secret = os.getenv("SECRET_KEY")
    if env_secret:
        _secret_key_cache = env_secret
        return env_secret

    if _secret_key_cache is None:
        _secret_key_cache = secrets.token_urlsafe(64)
        if not _logged_missing_secret_warning:
            logger.warning(
                "SECRET_KEY environment variable not set; generated ephemeral key for this runtime."
            )
            _logged_missing_secret_warning = True

    return _secret_key_cache

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


def ensure_auth_configured():
    """Reload admin configuration and ensure at least one account is available."""
    global USERS_DB, _missing_admin_users_logged

    USERS_DB = _load_users_from_env()
    if USERS_DB:
        _missing_admin_users_logged = False
        return

    if not _missing_admin_users_logged:
        logger.error(
            "No admin users configured. Set ADMIN_USERS_JSON or ADMIN_EMAIL/ADMIN_PASSWORD before allowing login."
        )
        _missing_admin_users_logged = True
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Authentication is not configured. Contact an administrator.",
    )

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
    ensure_auth_configured()

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
