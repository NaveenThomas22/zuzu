from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Category, Subcategory


class CategoryNotFoundError(Exception):
    """Raised when a category is absent, inactive, or soft-deleted."""


def list_active_categories(db: Session) -> list[Category]:
    """Return global categories available for transaction entry."""
    statement = (
        select(Category)
        .where(Category.is_active.is_(True), Category.deleted_at.is_(None))
        .order_by(Category.name)
    )
    return list(db.scalars(statement))


def list_available_subcategories(
    db: Session, category_id: str, user_id: str
) -> list[Subcategory]:
    """Return active system and current-user subcategories for an active category."""
    category = db.scalar(
        select(Category).where(
            Category.id == category_id,
            Category.is_active.is_(True),
            Category.deleted_at.is_(None),
        )
    )
    if category is None:
        raise CategoryNotFoundError

    statement = (
        select(Subcategory)
        .where(
            Subcategory.category_id == category_id,
            Subcategory.is_active.is_(True),
            Subcategory.deleted_at.is_(None),
            or_(Subcategory.user_id.is_(None), Subcategory.user_id == user_id),
        )
        .order_by(Subcategory.name)
    )
    return list(db.scalars(statement))
