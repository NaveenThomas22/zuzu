from datetime import datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Account
from app.schemas.account import AccountCreate, AccountUpdate
from app.services.audit_log_service import changed_values, create_log, snapshot


class AccountNotFoundError(Exception):
    """Raised when an account is absent, deleted, or belongs to another user."""


class AccountAlreadyExistsError(Exception):
    """Raised when a user already has an account with the requested name."""


class AccountServiceError(Exception):
    """Raised when an account operation cannot be persisted safely."""


def create_account(db: Session, user_id: str, account_data: AccountCreate) -> Account:
    """Create an account owned by the authenticated user."""
    account = Account(
        id=str(uuid4()),
        user_id=user_id,
        name=account_data.name,
        account_type=account_data.account_type.value,
        is_active=True,
    )
    db.add(account)
    create_log(db, user_id, "ACCOUNT", account, "CREATE", new_values=snapshot(account))

    try:
        db.commit()
        db.refresh(account)
    except IntegrityError as exc:
        db.rollback()
        raise AccountAlreadyExistsError from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise AccountServiceError from exc

    return account


def list_accounts(db: Session, user_id: str) -> list[Account]:
    """Return non-deleted accounts owned by the authenticated user."""
    statement = (
        select(Account)
        .where(Account.user_id == user_id, Account.deleted_at.is_(None))
        .order_by(Account.created_at)
    )
    return list(db.scalars(statement))


def get_account(db: Session, user_id: str, account_id: str) -> Account:
    """Return one non-deleted account owned by the authenticated user."""
    statement = select(Account).where(
        Account.id == account_id,
        Account.user_id == user_id,
        Account.deleted_at.is_(None),
    )
    account = db.scalar(statement)
    if account is None:
        raise AccountNotFoundError
    return account


def update_account(
    db: Session,
    user_id: str,
    account_id: str,
    account_data: AccountUpdate,
) -> Account:
    """Update editable fields of an authenticated user's account."""
    account = get_account(db, user_id, account_id)
    before = snapshot(account)
    updates = account_data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(account, field, value.value if field == "account_type" else value)
    old_values, new_values = changed_values(before, account, set(updates))
    if old_values:
        create_log(db, user_id, "ACCOUNT", account, "UPDATE", old_values, new_values)

    try:
        db.commit()
        db.refresh(account)
    except IntegrityError as exc:
        db.rollback()
        raise AccountAlreadyExistsError from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise AccountServiceError from exc

    return account


def soft_delete_account(db: Session, user_id: str, account_id: str) -> None:
    """Soft-delete an authenticated user's account."""
    account = get_account(db, user_id, account_id)
    before = snapshot(account)
    account.deleted_at = datetime.utcnow()
    create_log(db, user_id, "ACCOUNT", account, "DELETE", before, snapshot(account))

    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise AccountServiceError from exc
