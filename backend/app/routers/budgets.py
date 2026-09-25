from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate
from app.services import budget_service as service


router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")


def _validation(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=detail)


def _duplicate() -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A budget already exists for this category and month.")


def _operation_error() -> HTTPException:
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to complete budget operation.")


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    try:
        return service.detail(db, service.create_budget(db, current_user.id, budget_data))
    except service.BudgetValidationError as exc:
        raise _validation(str(exc)) from exc
    except service.BudgetAlreadyExistsError as exc:
        raise _duplicate() from exc
    except service.BudgetServiceError as exc:
        raise _operation_error() from exc


@router.get("", response_model=list[BudgetResponse])
def list_budgets(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    year: int | None = None,
    month: int | None = None,
    category_id: str | None = None,
) -> list[dict]:
    return service.list_budgets_with_spending(db, current_user.id, year=year, month=month, category_id=category_id)


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    try:
        return service.detail(db, service.get_budget(db, current_user.id, budget_id))
    except service.BudgetNotFoundError as exc:
        raise _not_found() from exc


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    budget_data: BudgetUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    try:
        return service.detail(db, service.update_budget(db, current_user.id, budget_id, budget_data))
    except service.BudgetNotFoundError as exc:
        raise _not_found() from exc
    except service.BudgetValidationError as exc:
        raise _validation(str(exc)) from exc
    except service.BudgetAlreadyExistsError as exc:
        raise _duplicate() from exc
    except service.BudgetServiceError as exc:
        raise _operation_error() from exc


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Response:
    try:
        service.soft_delete_budget(db, current_user.id, budget_id)
    except service.BudgetNotFoundError as exc:
        raise _not_found() from exc
    except service.BudgetServiceError as exc:
        raise _operation_error() from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
