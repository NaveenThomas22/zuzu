from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Budget, Category, Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.audit_log_service import changed_values, create_log, snapshot


_ZERO = Decimal("0.00")


class BudgetNotFoundError(Exception):
    pass


class BudgetAlreadyExistsError(Exception):
    pass


class BudgetValidationError(Exception):
    pass


class BudgetServiceError(Exception):
    pass


def _get_category(db: Session, category_id: str) -> Category:
    category = db.scalar(
        select(Category).where(
            Category.id == category_id,
            Category.is_active.is_(True),
            Category.deleted_at.is_(None),
        )
    )
    if category is None:
        raise BudgetValidationError("Category is invalid.")
    return category


def get_budget(db: Session, user_id: str, budget_id: str) -> Budget:
    budget = db.scalar(
        select(Budget).where(
            Budget.id == budget_id,
            Budget.user_id == user_id,
            Budget.deleted_at.is_(None),
        )
    )
    if budget is None:
        raise BudgetNotFoundError
    return budget


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    return start, end


def _amount_spent(db: Session, budget: Budget) -> Decimal:
    start, end = _month_bounds(budget.year, budget.month)
    amount = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == budget.user_id,
            Transaction.category_id == budget.category_id,
            Transaction.transaction_type == "EXPENSE",
            Transaction.transaction_date >= start,
            Transaction.transaction_date < end,
            Transaction.deleted_at.is_(None),
        )
    )
    return Decimal(amount or 0).quantize(Decimal("0.01"))


def detail(db: Session, budget: Budget) -> dict:
    spent = _amount_spent(db, budget)
    remaining = (Decimal(budget.amount) - spent).quantize(Decimal("0.01"))
    percentage = (spent / Decimal(budget.amount) * Decimal("100")).quantize(Decimal("0.01"))
    return {
        "id": budget.id,
        "user_id": budget.user_id,
        "category_id": budget.category_id,
        "category_name": budget.category.name,
        "year": budget.year,
        "month": budget.month,
        "amount": budget.amount,
        "amount_spent": spent,
        "remaining_amount": remaining,
        "percentage_used": percentage,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
    }


def create_budget(db: Session, user_id: str, budget_data: BudgetCreate) -> Budget:
    _get_category(db, budget_data.category_id)
    matching = list(
        db.scalars(
            select(Budget).where(
                Budget.user_id == user_id,
                Budget.category_id == budget_data.category_id,
                Budget.year == budget_data.year,
                Budget.month == budget_data.month,
            )
        )
    )
    active = next((budget for budget in matching if budget.deleted_at is None), None)
    if active is not None:
        raise BudgetAlreadyExistsError

    # MySQL's unique key includes deleted rows, so reuse a matching soft-deleted row.
    restoring = bool(matching)
    budget = matching[0] if matching else Budget(id=str(uuid4()), user_id=user_id)
    before = snapshot(budget) if restoring else None
    budget.category_id = budget_data.category_id
    budget.year = budget_data.year
    budget.month = budget_data.month
    budget.amount = budget_data.amount
    budget.deleted_at = None
    if not matching:
        db.add(budget)
    create_log(db, user_id, "BUDGET", budget, "RESTORE" if restoring else "CREATE", before if restoring else None, snapshot(budget))

    try:
        db.commit()
        db.refresh(budget)
    except IntegrityError as exc:
        db.rollback()
        raise BudgetAlreadyExistsError from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise BudgetServiceError from exc
    return budget


def list_budgets(
    db: Session, user_id: str, *, year: int | None, month: int | None, category_id: str | None
) -> list[Budget]:
    statement = select(Budget).where(Budget.user_id == user_id, Budget.deleted_at.is_(None))
    if year is not None:
        statement = statement.where(Budget.year == year)
    if month is not None:
        statement = statement.where(Budget.month == month)
    if category_id is not None:
        statement = statement.where(Budget.category_id == category_id)
    return list(db.scalars(statement.order_by(Budget.year.desc(), Budget.month.desc(), Budget.category_id)))


def update_budget(db: Session, user_id: str, budget_id: str, budget_data: BudgetUpdate) -> Budget:
    budget = get_budget(db, user_id, budget_id)
    before = snapshot(budget)
    updates = budget_data.model_dump(exclude_unset=True)
    category_id = updates.get("category_id", budget.category_id)
    year = updates.get("year", budget.year)
    month = updates.get("month", budget.month)
    _get_category(db, category_id)
    duplicate = db.scalar(
        select(Budget).where(
            Budget.user_id == user_id,
            Budget.category_id == category_id,
            Budget.year == year,
            Budget.month == month,
            Budget.deleted_at.is_(None),
            Budget.id != budget.id,
        )
    )
    if duplicate is not None:
        raise BudgetAlreadyExistsError
    for field, value in updates.items():
        setattr(budget, field, value)
    old_values, new_values = changed_values(before, budget, set(updates))
    if old_values:
        create_log(db, user_id, "BUDGET", budget, "UPDATE", old_values, new_values)
    try:
        db.commit()
        db.refresh(budget)
    except IntegrityError as exc:
        db.rollback()
        raise BudgetAlreadyExistsError from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise BudgetServiceError from exc
    return budget


def soft_delete_budget(db: Session, user_id: str, budget_id: str) -> None:
    budget = get_budget(db, user_id, budget_id)
    before = snapshot(budget)
    budget.deleted_at = datetime.utcnow()
    create_log(db, user_id, "BUDGET", budget, "DELETE", before, snapshot(budget))
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise BudgetServiceError from exc
