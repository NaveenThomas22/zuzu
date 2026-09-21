from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.transaction import (
    NeedOrWant,
    TransactionCreate,
    TransactionResponse,
    TransactionType,
    TransactionUpdate,
)
from app.services.transaction_service import (
    TransactionNotFoundError,
    TransactionServiceError,
    TransactionValidationError,
    create_transaction,
    get_transaction,
    list_transactions,
    soft_delete_transaction,
    update_transaction,
)


router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


def _not_found_exception() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")


def _validation_exception(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=detail)


def _operation_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to complete transaction operation.",
    )


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction_endpoint(
    transaction_data: TransactionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TransactionResponse:
    try:
        return create_transaction(db, current_user.id, transaction_data)
    except TransactionValidationError as exc:
        raise _validation_exception(str(exc)) from exc
    except TransactionServiceError as exc:
        raise _operation_exception() from exc


@router.get("", response_model=list[TransactionResponse])
def list_transactions_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    transaction_type: TransactionType | None = None,
    account_id: str | None = None,
    category_id: str | None = None,
    subcategory_id: str | None = None,
    need_or_want: NeedOrWant | None = None,
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
) -> list[TransactionResponse]:
    return list_transactions(
        db,
        current_user.id,
        transaction_type=transaction_type.value if transaction_type is not None else None,
        account_id=account_id,
        category_id=category_id,
        subcategory_id=subcategory_id,
        need_or_want=need_or_want.value if need_or_want is not None else None,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_endpoint(
    transaction_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TransactionResponse:
    try:
        return get_transaction(db, current_user.id, transaction_id)
    except TransactionNotFoundError as exc:
        raise _not_found_exception() from exc


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction_endpoint(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TransactionResponse:
    try:
        return update_transaction(db, current_user.id, transaction_id, transaction_data)
    except TransactionNotFoundError as exc:
        raise _not_found_exception() from exc
    except TransactionValidationError as exc:
        raise _validation_exception(str(exc)) from exc
    except TransactionServiceError as exc:
        raise _operation_exception() from exc


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction_endpoint(
    transaction_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Response:
    try:
        soft_delete_transaction(db, current_user.id, transaction_id)
    except TransactionNotFoundError as exc:
        raise _not_found_exception() from exc
    except TransactionServiceError as exc:
        raise _operation_exception() from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
