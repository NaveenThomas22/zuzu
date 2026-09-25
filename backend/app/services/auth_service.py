"""Authentication service helpers."""

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    get_user_id_from_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models import RefreshToken, User
from app.services.audit_log_service import create_log, snapshot
from app.schemas.auth import LoginRequest, UserRegister


class UserAlreadyExistsError(Exception):
    """Raised when registration uses an email that is already in use."""


class UserRegistrationError(Exception):
    """Raised when a user cannot be persisted safely."""


class AuthenticationError(Exception):
    """Raised when login credentials cannot authenticate a user."""


class RefreshTokenError(Exception):
    """Raised when a refresh token is invalid, expired, revoked, or mismatched."""


def register_user(db: Session, registration: UserRegister) -> User:
    """Create an active user from validated registration input."""
    normalized_email = str(registration.email).strip().lower()
    existing_user = db.scalar(select(User).where(User.email == normalized_email))
    if existing_user is not None:
        raise UserAlreadyExistsError

    user = User(
        id=str(uuid4()),
        name=registration.name,
        email=normalized_email,
        gender=registration.gender.value,
        password_hash=hash_password(registration.password),
        is_active=True,
    )
    db.add(user)
    create_log(db, user.id, "USER", user, "CREATE", new_values=snapshot(user))

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise UserAlreadyExistsError from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise UserRegistrationError from exc

    return user


def authenticate_user(db: Session, credentials: LoginRequest) -> User:
    """Return an active, non-deleted user with matching credentials."""
    normalized_email = str(credentials.email).strip().lower()
    user = db.scalar(select(User).where(User.email == normalized_email))

    if (
        user is None
        or not user.is_active
        or user.deleted_at is not None
        or not verify_password(credentials.password, user.password_hash)
    ):
        raise AuthenticationError

    return user


def create_login_access_token(user_id: str) -> str:
    """Issue a short-lived access token for an active user."""
    return create_access_token(user_id)


def create_refresh_token_record(db: Session, user_id: str, raw_refresh_token: str) -> RefreshToken:
    """Store a refresh-token session record using only a secure hash."""
    session = RefreshToken(
        id=str(uuid4()),
        user_id=user_id,
        token_hash=hash_refresh_token(raw_refresh_token),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        created_at=datetime.utcnow(),
    )
    db.add(session)
    db.flush()
    return session


def get_refresh_token_record(db: Session, raw_refresh_token: str) -> RefreshToken | None:
    """Look up a refresh-token session by the hashed value."""
    token_hash = hash_refresh_token(raw_refresh_token)
    return db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))


def revoke_refresh_token_record(db: Session, session: RefreshToken | None) -> None:
    """Revoke a refresh-token session if it exists and is not already revoked."""
    if session is None:
        return
    if session.revoked_at is None:
        session.revoked_at = datetime.utcnow()
    db.add(session)


def issue_refresh_token_for_user(db: Session, user: User) -> str:
    """Create a cryptographically secure refresh token and persist its hash."""
    raw_refresh_token = generate_refresh_token()
    create_refresh_token_record(db, user.id, raw_refresh_token)
    return raw_refresh_token


def validate_refresh_token(db: Session, raw_refresh_token: str) -> tuple[User, RefreshToken]:
    """Validate a refresh token and return its user and session record."""
    if not raw_refresh_token:
        raise RefreshTokenError("Refresh token is missing")

    session = get_refresh_token_record(db, raw_refresh_token)
    if session is None:
        raise RefreshTokenError("Refresh token not found")
    if session.revoked_at is not None:
        raise RefreshTokenError("Refresh token has been revoked")
    if session.expires_at <= datetime.utcnow():
        raise RefreshTokenError("Refresh token has expired")

    user = db.get(User, session.user_id)
    if user is None or not user.is_active or user.deleted_at is not None:
        raise RefreshTokenError("User no longer exists or is inactive")

    return user, session


__all__ = [
    "create_access_token",
    "create_login_access_token",
    "create_refresh_token_record",
    "decode_access_token",
    "generate_refresh_token",
    "get_refresh_token_record",
    "get_user_id_from_token",
    "hash_password",
    "issue_refresh_token_for_user",
    "authenticate_user",
    "AuthenticationError",
    "RefreshTokenError",
    "register_user",
    "UserAlreadyExistsError",
    "UserRegistrationError",
    "validate_refresh_token",
    "verify_password",
    "revoke_refresh_token_record",
]
