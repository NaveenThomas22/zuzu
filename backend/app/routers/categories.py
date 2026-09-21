from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.category import CategoryResponse
from app.schemas.subcategory import SubcategoryResponse
from app.services.category_service import (
    CategoryNotFoundError,
    list_active_categories,
    list_available_subcategories,
)


router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Annotated[Session, Depends(get_db)]) -> list[CategoryResponse]:
    return list_active_categories(db)


@router.get("/{category_id}/subcategories", response_model=list[SubcategoryResponse])
def list_subcategories(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[SubcategoryResponse]:
    try:
        return list_available_subcategories(db, category_id, current_user.id)
    except CategoryNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        ) from exc
