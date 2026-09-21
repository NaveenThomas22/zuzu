"""Authentication service helpers."""

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    decode_access_token,
    get_user_id_from_token,
    hash_password,
    verify_password,
)
from app.models import User
from app.services.audit_log_service import create_log, snapshot
from app.schemas.auth import LoginRequest, UserRegister


class UserAlreadyExistsError(Exception):
    """Raised when registration uses an email that is already in use."""


class UserRegistrationError(Exception):
    """Raised when a user cannot be persisted safely."""


class AuthenticationError(Exception):
    """Raised when login credentials cannot authenticate a user."""


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


def create_login_access_token(db: Session, credentials: LoginRequest) -> str:
    """Authenticate credentials and issue an access token for the user."""
    user = authenticate_user(db, credentials)
    return create_access_token(user.id)

__all__ = [
    "create_access_token",
    "create_login_access_token",
    "decode_access_token",
    "get_user_id_from_token",
    "hash_password",
    "authenticate_user",
    "AuthenticationError",
    "register_user",
    "UserAlreadyExistsError",
    "UserRegistrationError",
    "verify_password",
]
