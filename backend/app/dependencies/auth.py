from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.core.security import get_user_id_from_token


bearer_scheme = HTTPBearer(auto_error=False)


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Resolve the active user represented by a valid Bearer access token."""
    if credentials is None:
        raise _credentials_exception()

    try:
        user_id = get_user_id_from_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise _credentials_exception() from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active or user.deleted_at is not None:
        raise _credentials_exception()
    return user
