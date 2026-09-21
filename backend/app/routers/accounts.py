from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.account import AccountCreate, AccountResponse, AccountUpdate
from app.services.account_service import (
    AccountAlreadyExistsError,
    AccountNotFoundError,
    AccountServiceError,
    create_account,
    get_account,
    list_accounts,
    soft_delete_account,
    update_account,
)


router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


def _account_not_found_exception() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found.")


def _duplicate_name_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="An account with this name already exists.",
    )


def _account_operation_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to complete account operation.",
    )


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account_endpoint(
    account_data: AccountCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AccountResponse:
    try:
        return create_account(db, current_user.id, account_data)
    except AccountAlreadyExistsError as exc:
        raise _duplicate_name_exception() from exc
    except AccountServiceError as exc:
        raise _account_operation_exception() from exc


@router.get("", response_model=list[AccountResponse])
def list_accounts_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[AccountResponse]:
    return list_accounts(db, current_user.id)


@router.get("/{account_id}", response_model=AccountResponse)
def get_account_endpoint(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AccountResponse:
    try:
        return get_account(db, current_user.id, account_id)
    except AccountNotFoundError as exc:
        raise _account_not_found_exception() from exc


@router.put("/{account_id}", response_model=AccountResponse)
def update_account_endpoint(
    account_id: str,
    account_data: AccountUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AccountResponse:
    try:
        return update_account(db, current_user.id, account_id, account_data)
    except AccountNotFoundError as exc:
        raise _account_not_found_exception() from exc
    except AccountAlreadyExistsError as exc:
        raise _duplicate_name_exception() from exc
    except AccountServiceError as exc:
        raise _account_operation_exception() from exc


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account_endpoint(
    account_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Response:
    try:
        soft_delete_account(db, current_user.id, account_id)
    except AccountNotFoundError as exc:
        raise _account_not_found_exception() from exc
    except AccountServiceError as exc:
        raise _account_operation_exception() from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
