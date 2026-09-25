from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.bill import BillCreate, BillFrequency, BillPaymentRequest, BillResponse, BillStatus, BillType, BillUpdate
from app.services import bill_service as service


router = APIRouter(prefix="/api/bills", tags=["Bills"])


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found.")


def _validation(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=detail)


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def _operation() -> HTTPException:
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to complete bill operation.")


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
def create_bill(data: BillCreate, db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]) -> dict:
    try:
        return service.detail(db, service.create_bill(db, current_user.id, data))
    except service.BillServiceError as exc:
        raise _operation() from exc


@router.get("", response_model=list[BillResponse])
def list_bills(
    db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)],
    status: BillStatus | None = None, bill_type: BillType | None = None,
    frequency: BillFrequency | None = None, start_date: date | None = None, end_date: date | None = None,
) -> list[dict]:
    bills = service.list_bills(
        db, current_user.id, status=status.value if status else None,
        bill_type=bill_type.value if bill_type else None, frequency=frequency.value if frequency else None,
        start_date=start_date, end_date=end_date,
    )
    return service.list_with_payment_transactions(db, bills)


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(bill_id: str, db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]) -> dict:
    try:
        return service.detail(db, service.get_bill(db, current_user.id, bill_id))
    except service.BillNotFoundError as exc:
        raise _not_found() from exc


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: str, data: BillUpdate, db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]) -> dict:
    try:
        return service.detail(db, service.update_bill(db, current_user.id, bill_id, data))
    except service.BillNotFoundError as exc:
        raise _not_found() from exc
    except service.BillValidationError as exc:
        raise _validation(str(exc)) from exc
    except service.BillServiceError as exc:
        raise _operation() from exc


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(bill_id: str, db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]) -> Response:
    try:
        service.soft_delete_bill(db, current_user.id, bill_id)
    except service.BillNotFoundError as exc:
        raise _not_found() from exc
    except service.BillServiceError as exc:
        raise _operation() from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{bill_id}/pay", response_model=BillResponse)
def pay_bill(bill_id: str, data: BillPaymentRequest, db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]) -> dict:
    try:
        return service.detail(db, service.pay_bill(db, current_user.id, bill_id, data))
    except service.BillNotFoundError as exc:
        raise _not_found() from exc
    except service.BillPaymentError as exc:
        raise _conflict(str(exc)) from exc
    except service.BillServiceError as exc:
        raise _operation() from exc


@router.post("/{bill_id}/cancel", response_model=BillResponse)
def cancel_bill(bill_id: str, db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]) -> dict:
    try:
        return service.detail(db, service.cancel_bill(db, current_user.id, bill_id))
    except service.BillNotFoundError as exc:
        raise _not_found() from exc
    except service.BillValidationError as exc:
        raise _conflict(str(exc)) from exc
    except service.BillServiceError as exc:
        raise _operation() from exc
