from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from app.models import LendingRepayment, Transaction
from app.schemas.lending_repayment import LendingRepaymentCreate, LendingRepaymentUpdate
from app.services.lending_service import LendingValidationError, get_lending, repaid, status
from app.services.audit_log_service import changed_values, create_log, snapshot


class RepaymentNotFoundError(Exception):
    pass


def get(db: Session, lid: str, rid: str):
    repayment = db.get(LendingRepayment, rid)
    if repayment is None or repayment.lending_id != lid or repayment.deleted_at is not None:
        raise RepaymentNotFoundError
    return repayment


def create(db: Session, uid: str, lid: str, d: LendingRepaymentCreate):
    lending = get_lending(db, uid, lid)
    existing_repaid = repaid(db, lid)
    
    if d.amount > lending.total_amount - existing_repaid:
        raise LendingValidationError("Repayment amount exceeds the remaining lending amount.")
        
    transaction = Transaction(
        id=str(uuid4()),
        user_id=uid,
        transaction_date=d.repayment_date,
        transaction_type="LENDING_REPAYMENT",
        amount=d.amount,
    )
    repayment = LendingRepayment(
        id=str(uuid4()),
        lending_id=lid,
        transaction_id=transaction.id,
        repayment_date=d.repayment_date,
        amount=d.amount,
        note=d.note,
    )
    
    try:
        db.add_all([transaction, repayment])
        db.flush()
        
        l_before = snapshot(lending)
        
        final_repaid = existing_repaid + d.amount
        status(lending, final_repaid)
        
        create_log(db, uid, "LENDING_REPAYMENT", repayment, "CREATE", new_values=snapshot(repayment))
        create_log(db, uid, "TRANSACTION", transaction, "CREATE", new_values=snapshot(transaction))
        
        l_old, l_new = changed_values(l_before, lending, {"status"})
        if l_old:
            create_log(db, uid, "LENDING", lending, "UPDATE", l_old, l_new)
            
        db.commit()
        db.refresh(repayment)
        return repayment
    except Exception:
        db.rollback()
        raise


def update(db: Session, uid: str, lid: str, rid: str, d: LendingRepaymentUpdate):
    lending = get_lending(db, uid, lid)
    repayment = get(db, lid, rid)
    updates = d.model_dump(exclude_unset=True)
    
    before = snapshot(repayment)
    t_before = snapshot(repayment.transaction)
    l_before = snapshot(lending)
    
    amount = updates.get("amount", repayment.amount)
    existing_other_repaid = repaid(db, lid, exclude=rid)
    
    if existing_other_repaid + amount > lending.total_amount:
        raise LendingValidationError("Repayment amount exceeds the remaining lending amount.")
        
    for key, value in updates.items():
        setattr(repayment, key, value)
        
    if "amount" in updates:
        repayment.transaction.amount = updates["amount"]
    if "repayment_date" in updates:
        repayment.transaction.transaction_date = updates["repayment_date"]
        
    try:
        db.flush()
        
        final_repaid = existing_other_repaid + amount
        status(lending, final_repaid)
        
        old, new = changed_values(before, repayment, set(updates))
        t_old, t_new = changed_values(t_before, repayment.transaction, {"amount", "transaction_date"})
        l_old, l_new = changed_values(l_before, lending, {"status"})
        
        if old:
            create_log(db, uid, "LENDING_REPAYMENT", repayment, "UPDATE", old, new)
        if t_old:
            create_log(db, uid, "TRANSACTION", repayment.transaction, "UPDATE", t_old, t_new)
        if l_old:
            create_log(db, uid, "LENDING", lending, "UPDATE", l_old, l_new)
            
        db.commit()
        db.refresh(repayment)
        return repayment
    except Exception:
        db.rollback()
        raise


def delete(db: Session, uid: str, lid: str, rid: str):
    lending = get_lending(db, uid, lid)
    repayment = get(db, lid, rid)
    
    r_before = snapshot(repayment)
    t_before = snapshot(repayment.transaction)
    l_before = snapshot(lending)
    
    now = datetime.utcnow()
    repayment.deleted_at = now
    repayment.transaction.deleted_at = now
    
    try:
        db.flush()
        
        remaining_repaid = repaid(db, lid, exclude=rid)
        status(lending, remaining_repaid)
        
        create_log(db, uid, "LENDING_REPAYMENT", repayment, "DELETE", r_before, snapshot(repayment))
        create_log(db, uid, "TRANSACTION", repayment.transaction, "DELETE", t_before, snapshot(repayment.transaction))
        
        l_old, l_new = changed_values(l_before, lending, {"status"})
        if l_old:
            create_log(db, uid, "LENDING", lending, "UPDATE", l_old, l_new)
            
        db.commit()
    except Exception:
        db.rollback()
        raise
