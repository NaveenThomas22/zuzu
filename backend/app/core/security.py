import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
import jwt
from jwt.exceptions import InvalidTokenError

from app.core.config import settings


_password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2."""
    return _password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return whether a plaintext password matches an Argon2 hash."""
    try:
        return _password_hasher.verify(hashed_password, plain_password)
    except (InvalidHashError, VerificationError, VerifyMismatchError):
        return False


def _jwt_secret_key() -> str:
    if not settings.JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY must be configured")
    return settings.JWT_SECRET_KEY


def create_access_token(
    user_id: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed access token whose subject is the user's ID."""
    if not user_id:
        raise ValueError("user_id must not be empty")

    expires_at = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": user_id, "exp": expires_at}
    return jwt.encode(payload, _jwt_secret_key(), algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify a signed access token, including its expiration."""
    return jwt.decode(
        token,
        _jwt_secret_key(),
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": ["exp", "sub"]},
    )


def get_user_id_from_token(token: str) -> str:
    """Extract a validated user ID from an access token's subject claim."""
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise InvalidTokenError("Token subject is invalid")
    return user_id


def generate_refresh_token() -> str:
    """Generate a cryptographically secure opaque refresh token."""
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token before storing it in the database."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
