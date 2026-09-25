from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Account, Category, Subcategory, Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services.audit_log_service import changed_values, create_log, snapshot
from app.services.budget_notification_service import check_budget_thresholds


class TransactionNotFoundError(Exception):
    """Raised when a transaction is absent, deleted, or belongs to another user."""


class TransactionValidationError(Exception):
    """Raised when a transaction reference is invalid for the authenticated user."""


class TransactionServiceError(Exception):
    """Raised when a transaction operation cannot be persisted safely."""


def _validate_references(
    db: Session,
    user_id: str,
    *,
    account_id: str | None,
    category_id: str | None,
    subcategory_id: str | None,
) -> None:
    if account_id is not None:
        account = db.scalar(
            select(Account).where(
                Account.id == account_id,
                Account.user_id == user_id,
                Account.deleted_at.is_(None),
            )
        )
        if account is None:
            raise TransactionValidationError("Account is invalid.")

    if category_id is not None:
        category = db.scalar(
            select(Category).where(
                Category.id == category_id,
                Category.is_active.is_(True),
                Category.deleted_at.is_(None),
            )
        )
        if category is None:
            raise TransactionValidationError("Category is invalid.")

    if subcategory_id is not None:
        if category_id is None:
            raise TransactionValidationError("A category is required when using a subcategory.")

        subcategory = db.scalar(
            select(Subcategory).where(
                Subcategory.id == subcategory_id,
                Subcategory.category_id == category_id,
                Subcategory.is_active.is_(True),
                Subcategory.deleted_at.is_(None),
                or_(Subcategory.user_id.is_(None), Subcategory.user_id == user_id),
            )
        )
        if subcategory is None:
            raise TransactionValidationError("Subcategory is invalid.")


def create_transaction(
    db: Session,
    user_id: str,
    transaction_data: TransactionCreate,
) -> Transaction:
    """Create a transaction owned by the authenticated user."""
    _validate_references(
        db,
        user_id,
        account_id=transaction_data.account_id,
        category_id=transaction_data.category_id,
        subcategory_id=transaction_data.subcategory_id,
    )
    transaction = Transaction(
        id=str(uuid4()),
        user_id=user_id,
        account_id=transaction_data.account_id,
        transaction_date=transaction_data.transaction_date,
        transaction_type=transaction_data.transaction_type.value,
        category_id=transaction_data.category_id,
        subcategory_id=transaction_data.subcategory_id,
        item_name=transaction_data.item_name,
        amount=transaction_data.amount,
        need_or_want=(
            transaction_data.need_or_want.value
            if transaction_data.need_or_want is not None
            else None
        ),
        description=transaction_data.description,
    )
    db.add(transaction)
    create_log(db, user_id, "TRANSACTION", transaction, "CREATE", new_values=snapshot(transaction))

    try:
        db.commit()
        db.refresh(transaction)
    except SQLAlchemyError as exc:
        db.rollback()
        raise TransactionServiceError from exc

    if transaction.transaction_type in ("EXPENSE", "REFUND"):
        check_budget_thresholds(db, user_id, transaction.category_id, transaction.transaction_date)

    return transaction


def list_transactions(
    db: Session,
    user_id: str,
    *,
    transaction_type: str | None = None,
    account_id: str | None = None,
    category_id: str | None = None,
    subcategory_id: str | None = None,
    need_or_want: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    page_size: int = 50,
) -> list[Transaction]:
    """Return non-deleted transactions owned by the authenticated user."""
    statement = select(Transaction).where(
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_(None),
    )
    if transaction_type is not None:
        statement = statement.where(Transaction.transaction_type == transaction_type)
    if account_id is not None:
        statement = statement.where(Transaction.account_id == account_id)
    if category_id is not None:
        statement = statement.where(Transaction.category_id == category_id)
    if subcategory_id is not None:
        statement = statement.where(Transaction.subcategory_id == subcategory_id)
    if need_or_want is not None:
        statement = statement.where(Transaction.need_or_want == need_or_want)
    if start_date is not None:
        statement = statement.where(Transaction.transaction_date >= start_date)
    if end_date is not None:
        statement = statement.where(Transaction.transaction_date <= end_date)

    statement = (
        statement.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(db.scalars(statement))


def get_transaction(db: Session, user_id: str, transaction_id: str) -> Transaction:
    """Return one non-deleted transaction owned by the authenticated user."""
    transaction = db.scalar(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
        )
    )
    if transaction is None:
        raise TransactionNotFoundError
    return transaction


def update_transaction(
    db: Session,
    user_id: str,
    transaction_id: str,
    transaction_data: TransactionUpdate,
) -> Transaction:
    """Update editable fields of an authenticated user's transaction."""
    transaction = get_transaction(db, user_id, transaction_id)
    before = snapshot(transaction)
    updates = transaction_data.model_dump(exclude_unset=True)

    account_id = updates.get("account_id", transaction.account_id)
    category_id = updates.get("category_id", transaction.category_id)
    subcategory_id = updates.get("subcategory_id", transaction.subcategory_id)
    _validate_references(
        db,
        user_id,
        account_id=account_id,
        category_id=category_id,
        subcategory_id=subcategory_id,
    )

    for field, value in updates.items():
        if field in {"transaction_type", "need_or_want"} and value is not None:
            value = value.value
        setattr(transaction, field, value)
    old_values, new_values = changed_values(before, transaction, set(updates))
    if old_values:
        create_log(db, user_id, "TRANSACTION", transaction, "UPDATE", old_values, new_values)

    try:
        db.commit()
        db.refresh(transaction)
    except SQLAlchemyError as exc:
        db.rollback()
        raise TransactionServiceError from exc

    if transaction.transaction_type in ("EXPENSE", "REFUND"):
        check_budget_thresholds(db, user_id, transaction.category_id, transaction.transaction_date)

    return transaction


def soft_delete_transaction(db: Session, user_id: str, transaction_id: str) -> None:
    """Soft-delete an authenticated user's transaction."""
    transaction = get_transaction(db, user_id, transaction_id)
    before = snapshot(transaction)
    transaction.deleted_at = datetime.utcnow()
    create_log(db, user_id, "TRANSACTION", transaction, "DELETE", before, snapshot(transaction))

    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise TransactionServiceError from exc
