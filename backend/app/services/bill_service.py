from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Bill, Category, Subcategory, Transaction
from app.schemas.bill import BillCreate, BillPaymentRequest, BillUpdate
from app.services.audit_log_service import changed_values, create_log, snapshot


_SUBCATEGORY_NAMES = {
    "MOBILE_RECHARGE": "Mobile Recharge",
    "ELECTRICITY": "Electricity",
    "WATER": "Water",
    "INTERNET": "Internet",
    "GAS": "Gas",
    "SUBSCRIPTION": "Subscription",
    "OTHER": "Other",
}


class BillNotFoundError(Exception):
    pass


class BillValidationError(Exception):
    pass


class BillPaymentError(Exception):
    pass


class BillServiceError(Exception):
    pass


def get_bill(db: Session, user_id: str, bill_id: str) -> Bill:
    bill = db.scalar(
        select(Bill).where(Bill.id == bill_id, Bill.user_id == user_id, Bill.deleted_at.is_(None))
    )
    if bill is None:
        raise BillNotFoundError
    return bill


def _display_status(bill: Bill) -> str:
    if bill.status == "PENDING" and bill.due_date < date.today():
        return "OVERDUE"
    return bill.status


def _payment_transaction(db: Session, bill_id: str) -> Transaction | None:
    return db.scalar(
        select(Transaction).where(Transaction.bill_id == bill_id, Transaction.deleted_at.is_(None))
    )


def detail(db: Session, bill: Bill) -> dict:
    payment = _payment_transaction(db, bill.id)
    return {
        "id": bill.id,
        "user_id": bill.user_id,
        "bill_type": bill.bill_type,
        "name": bill.name,
        "amount": bill.amount,
        "due_date": bill.due_date,
        "frequency": bill.frequency,
        "status": _display_status(bill),
        "paid_at": bill.paid_at,
        "note": bill.note,
        "created_at": bill.created_at,
        "updated_at": bill.updated_at,
        "payment_transaction_id": payment.id if payment else None,
    }


def list_with_payment_transactions(db: Session, bills: list[Bill]) -> list[dict]:
    if not bills:
        return []
    bill_ids = [b.id for b in bills]
    transactions = db.scalars(
        select(Transaction).where(Transaction.bill_id.in_(bill_ids), Transaction.deleted_at.is_(None))
    ).all()
    payment_map = {t.bill_id: t for t in transactions}
    
    return [
        {
            "id": bill.id,
            "user_id": bill.user_id,
            "bill_type": bill.bill_type,
            "name": bill.name,
            "amount": bill.amount,
            "due_date": bill.due_date,
            "frequency": bill.frequency,
            "status": _display_status(bill),
            "paid_at": bill.paid_at,
            "note": bill.note,
            "created_at": bill.created_at,
            "updated_at": bill.updated_at,
            "payment_transaction_id": payment_map.get(bill.id).id if payment_map.get(bill.id) else None,
        }
        for bill in bills
    ]


def create_bill(db: Session, user_id: str, data: BillCreate) -> Bill:
    bill = Bill(
        id=str(uuid4()), user_id=user_id, bill_type=data.bill_type.value, name=data.name,
        amount=data.amount, due_date=data.due_date, frequency=data.frequency.value,
        status="PENDING", note=data.note,
    )
    db.add(bill)
    create_log(db, user_id, "BILL", bill, "CREATE", new_values=snapshot(bill))
    try:
        db.commit()
        db.refresh(bill)
    except SQLAlchemyError as exc:
        db.rollback()
        raise BillServiceError from exc
    return bill


def list_bills(
    db: Session, user_id: str, *, status: str | None, bill_type: str | None,
    frequency: str | None, start_date: date | None, end_date: date | None,
) -> list[Bill]:
    statement = select(Bill).where(Bill.user_id == user_id, Bill.deleted_at.is_(None))
    if status is not None:
        statement = statement.where(Bill.status == status)
    if bill_type is not None:
        statement = statement.where(Bill.bill_type == bill_type)
    if frequency is not None:
        statement = statement.where(Bill.frequency == frequency)
    if start_date is not None:
        statement = statement.where(Bill.due_date >= start_date)
    if end_date is not None:
        statement = statement.where(Bill.due_date <= end_date)
    return list(db.scalars(statement.order_by(Bill.due_date, Bill.created_at)))


def update_bill(db: Session, user_id: str, bill_id: str, data: BillUpdate) -> Bill:
    bill = get_bill(db, user_id, bill_id)
    before = snapshot(bill)
    updates = data.model_dump(exclude_unset=True)
    if bill.status == "PAID" and "amount" in updates:
        raise BillValidationError("A paid bill amount cannot be changed.")
    for field, value in updates.items():
        if field in {"bill_type", "frequency"}:
            value = value.value
        setattr(bill, field, value)
    old_values, new_values = changed_values(before, bill, set(updates))
    if old_values:
        create_log(db, user_id, "BILL", bill, "UPDATE", old_values, new_values)
    try:
        db.commit()
        db.refresh(bill)
    except SQLAlchemyError as exc:
        db.rollback()
        raise BillServiceError from exc
    return bill


def _payment_references(db: Session, bill_type: str) -> tuple[Category, Subcategory]:
    category = db.scalar(
        select(Category).where(Category.name == "Bills", Category.is_active.is_(True), Category.deleted_at.is_(None))
    )
    if category is None:
        raise BillPaymentError("Bills category is unavailable.")
    subcategory = db.scalar(
        select(Subcategory).where(
            Subcategory.category_id == category.id,
            Subcategory.name == _SUBCATEGORY_NAMES[bill_type],
            Subcategory.is_active.is_(True),
            Subcategory.deleted_at.is_(None),
        )
    )
    if subcategory is None:
        raise BillPaymentError("Bill subcategory is unavailable.")
    return category, subcategory


def pay_bill(db: Session, user_id: str, bill_id: str, data: BillPaymentRequest) -> Bill:
    bill = get_bill(db, user_id, bill_id)
    before = snapshot(bill)
    if bill.status == "PAID":
        raise BillPaymentError("Bill has already been paid.")
    if bill.status == "CANCELLED":
        raise BillPaymentError("Cancelled bills cannot be paid.")
    if _payment_transaction(db, bill.id) is not None:
        raise BillPaymentError("Bill already has an active payment transaction.")
    category, subcategory = _payment_references(db, bill.bill_type)
    transaction = Transaction(
        id=str(uuid4()), user_id=user_id, bill_id=bill.id,
        transaction_date=data.payment_date or date.today(), transaction_type="EXPENSE",
        category_id=category.id, subcategory_id=subcategory.id, item_name=bill.name,
        amount=bill.amount, description=bill.note,
    )
    bill.status = "PAID"
    bill.paid_at = datetime.utcnow()
    db.add(transaction)
    create_log(db, user_id, "BILL", bill, "UPDATE", *changed_values(before, bill))
    create_log(db, user_id, "TRANSACTION", transaction, "CREATE", new_values=snapshot(transaction))
    try:
        db.flush()
        db.commit()
        db.refresh(bill)
    except SQLAlchemyError as exc:
        db.rollback()
        raise BillServiceError from exc
    return bill


def cancel_bill(db: Session, user_id: str, bill_id: str) -> Bill:
    bill = get_bill(db, user_id, bill_id)
    before = snapshot(bill)
    if bill.status == "PAID":
        raise BillValidationError("A paid bill cannot be cancelled.")
    if bill.status == "CANCELLED":
        raise BillValidationError("Bill is already cancelled.")
    bill.status = "CANCELLED"
    create_log(db, user_id, "BILL", bill, "UPDATE", *changed_values(before, bill))
    try:
        db.commit()
        db.refresh(bill)
    except SQLAlchemyError as exc:
        db.rollback()
        raise BillServiceError from exc
    return bill


def soft_delete_bill(db: Session, user_id: str, bill_id: str) -> None:
    bill = get_bill(db, user_id, bill_id)
    bill_before = snapshot(bill)
    now = datetime.utcnow()
    bill.deleted_at = now
    create_log(db, user_id, "BILL", bill, "DELETE", bill_before, snapshot(bill))
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise BillServiceError from exc
