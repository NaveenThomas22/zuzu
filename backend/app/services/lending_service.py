from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload
from app.models import Lending, LendingRepayment, Transaction
from app.schemas.lending import LendingCreate, LendingUpdate
from app.services.audit_log_service import changed_values, create_log, snapshot

ZERO = Decimal("0.00")


class LendingNotFoundError(Exception):
    pass


class LendingValidationError(Exception):
    pass


def get_lending(db: Session, user_id: str, lending_id: str) -> Lending:
    lending = db.scalar(
        select(Lending).where(Lending.id == lending_id, Lending.user_id == user_id, Lending.deleted_at.is_(None))
    )
    if lending is None:
        raise LendingNotFoundError
    return lending


def repaid(db: Session, lending_id: str, exclude: str | None = None) -> Decimal:
    q = select(func.coalesce(func.sum(LendingRepayment.amount), 0)).where(
        LendingRepayment.lending_id == lending_id, LendingRepayment.deleted_at.is_(None)
    )
    if exclude:
        q = q.where(LendingRepayment.id != exclude)
    return Decimal(db.scalar(q) or 0)


def status(lending: Lending, total: Decimal):
    remaining = lending.total_amount - total
    if total == 0:
        lending.status = "PENDING"
    elif remaining == 0:
        lending.status = "FULLY_PAID"
    else:
        lending.status = "PARTIAL"
    return remaining


def detail(db: Session, lending: Lending) -> dict:
    total = repaid(db, lending.id)
    return {
        "id": lending.id,
        "user_id": lending.user_id,
        "person_name": lending.person_name,
        "total_amount": lending.total_amount,
        "lending_date": lending.lending_date,
        "note": lending.note,
        "status": lending.status,
        "created_at": lending.created_at,
        "updated_at": lending.updated_at,
        "amount_repaid": total,
        "remaining_amount": lending.total_amount - total,
    }
def list_with_repayment_totals(db:Session,lendings:list[Lending])->list[dict]:
    if not lendings: return []
    q=select(LendingRepayment.lending_id,func.coalesce(func.sum(LendingRepayment.amount),0).label('amount_repaid')).where(LendingRepayment.lending_id.in_([l.id for l in lendings]),LendingRepayment.deleted_at.is_(None)).group_by(LendingRepayment.lending_id)
    repaid_map={r.lending_id:Decimal(r.amount_repaid).quantize(Decimal("0.01")) for r in db.execute(q).all()}
    return [{"id":l.id,"user_id":l.user_id,"person_name":l.person_name,"total_amount":l.total_amount,"lending_date":l.lending_date,"note":l.note,"status":l.status,"created_at":l.created_at,"updated_at":l.updated_at,"amount_repaid":repaid_map.get(l.id,ZERO),"remaining_amount":l.total_amount-repaid_map.get(l.id,ZERO)} for l in lendings]
def create(db: Session, user_id: str, d: LendingCreate) -> Lending:
    try:
        lending = Lending(
            id=str(uuid4()),
            user_id=user_id,
            person_name=d.person_name,
            total_amount=d.total_amount,
            lending_date=d.lending_date,
            note=d.note,
            status="PENDING",
        )
        transaction = Transaction(
            id=str(uuid4()),
            user_id=user_id,
            transaction_date=d.lending_date,
            transaction_type="LENDING_OUT",
            amount=d.total_amount,
        )
        db.add_all([lending, transaction])
        db.flush()
        lending.lending_out_transaction_id = transaction.id
        create_log(db, user_id, "LENDING", lending, "CREATE", new_values=snapshot(lending))
        create_log(db, user_id, "TRANSACTION", transaction, "CREATE", new_values=snapshot(transaction))
        db.commit()
        db.refresh(lending)
        return lending
    except Exception:
        db.rollback()
        raise


def update(db: Session, user_id: str, id: str, d: LendingUpdate) -> Lending:
    lending = get_lending(db, user_id, id)
    updates = d.model_dump(exclude_unset=True)
    before = snapshot(lending)
    transaction_before = snapshot(lending.lending_out_transaction)
    
    if "total_amount" in updates:
        if updates["total_amount"] < repaid(db, lending.id):
            raise LendingValidationError("Total amount cannot be less than repaid amount.")
        lending.total_amount = updates["total_amount"]
        lending.lending_out_transaction.amount = updates["total_amount"]
        
    for key in ("person_name", "lending_date", "note"):
        if key in updates:
            setattr(lending, key, updates[key])
            
    if "lending_date" in updates:
        lending.lending_out_transaction.transaction_date = updates["lending_date"]
        
    old_values, new_values = changed_values(before, lending, set(updates))
    transaction_old, transaction_new = changed_values(
        transaction_before, lending.lending_out_transaction, {"amount", "transaction_date"}
    )
    
    if old_values:
        create_log(db, user_id, "LENDING", lending, "UPDATE", old_values, new_values)
    if transaction_old:
        create_log(db, user_id, "TRANSACTION", lending.lending_out_transaction, "UPDATE", transaction_old, transaction_new)
        
    try:
        db.commit()
        db.refresh(lending)
        return lending
    except Exception:
        db.rollback()
        raise


def delete(db: Session, user_id: str, id: str):
    lending = get_lending(db, user_id, id)
    now = datetime.utcnow()
    l_before = snapshot(lending)
    t_before = snapshot(lending.lending_out_transaction)
    
    lending.deleted_at = now
    lending.lending_out_transaction.deleted_at = now
    
    create_log(db, user_id, "LENDING", lending, "DELETE", l_before, snapshot(lending))
    create_log(db, user_id, "TRANSACTION", lending.lending_out_transaction, "DELETE", t_before, snapshot(lending.lending_out_transaction))
    
    for r in db.scalars(select(LendingRepayment).options(joinedload(LendingRepayment.transaction)).where(LendingRepayment.lending_id == id, LendingRepayment.deleted_at.is_(None))):
        r_before = snapshot(r)
        rt_before = snapshot(r.transaction)
        
        r.deleted_at = now
        r.transaction.deleted_at = now
        
        create_log(db, user_id, "LENDING_REPAYMENT", r, "DELETE", r_before, snapshot(r))
        create_log(db, user_id, "TRANSACTION", r.transaction, "DELETE", rt_before, snapshot(r.transaction))
        
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
