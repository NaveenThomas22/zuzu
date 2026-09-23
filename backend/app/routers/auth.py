from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, generate_refresh_token, hash_refresh_token
from app.dependencies.auth import get_current_user
from app.models import RefreshToken, User
from app.schemas.auth import LoginRequest, TokenResponse, UserRegister
from app.schemas.user import UserResponse
from app.services.auth_service import (
    AuthenticationError,
    RefreshTokenError,
    UserAlreadyExistsError,
    UserRegistrationError,
    authenticate_user,
    create_login_access_token,
    get_refresh_token_record,
    issue_refresh_token_for_user,
    register_user,
    revoke_refresh_token_record,
    validate_refresh_token,
)


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    registration: UserRegister,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    try:
        return register_user(db, registration)
    except UserAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        ) from exc
    except UserRegistrationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user.",
        ) from exc


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
    response: Response,
) -> TokenResponse:
    try:
        user = authenticate_user(db, credentials)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    access_token = create_login_access_token(user.id)
    refresh_token = issue_refresh_token_for_user(db, user)
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAME_SITE,
        path=settings.REFRESH_COOKIE_PATH,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )
    db.commit()
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    response: Response,
) -> TokenResponse:
    raw_refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not raw_refresh_token:
        response.delete_cookie(
            key=settings.REFRESH_COOKIE_NAME,
            path=settings.REFRESH_COOKIE_PATH,
            samesite=settings.COOKIE_SAME_SITE,
            secure=settings.COOKIE_SECURE,
            httponly=True,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    try:
        user, current_session = validate_refresh_token(db, raw_refresh_token)
    except RefreshTokenError as exc:
        response.delete_cookie(
            key=settings.REFRESH_COOKIE_NAME,
            path=settings.REFRESH_COOKIE_PATH,
            samesite=settings.COOKIE_SAME_SITE,
            secure=settings.COOKIE_SECURE,
            httponly=True,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        ) from exc

    now = datetime.now(timezone.utc)
    current_session.revoked_at = now
    replacement_token = generate_refresh_token()
    replacement_session = RefreshToken(
        id=str(uuid4()),
        user_id=user.id,
        token_hash=hash_refresh_token(replacement_token),
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        created_at=now,
    )
    current_session.replaced_by = replacement_session.id
    db.add(replacement_session)
    db.commit()

    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=replacement_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAME_SITE,
        path=settings.REFRESH_COOKIE_PATH,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/logout")
def logout(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    response: Response,
) -> dict[str, str]:
    raw_refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if raw_refresh_token:
        session = get_refresh_token_record(db, raw_refresh_token)
        if session is not None:
            revoke_refresh_token_record(db, session)
            db.commit()

    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path=settings.REFRESH_COOKIE_PATH,
        samesite=settings.COOKIE_SAME_SITE,
        secure=settings.COOKIE_SECURE,
        httponly=True,
    )
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    return current_user
