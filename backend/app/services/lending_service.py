from datetime import date, datetime
from decimal import Decimal
from uuid import uuid4
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models import Lending, LendingRepayment, Transaction
from app.schemas.lending import LendingCreate, LendingUpdate
from app.services.audit_log_service import changed_values, create_log, snapshot

ZERO=Decimal("0.00")
class LendingNotFoundError(Exception): pass
class LendingValidationError(Exception): pass
def get_lending(db:Session,user_id:str,lending_id:str)->Lending:
    x=db.scalar(select(Lending).where(Lending.id==lending_id,Lending.user_id==user_id,Lending.deleted_at.is_(None)))
    if x is None: raise LendingNotFoundError
    return x
def repaid(db:Session,lending_id:str,exclude:str|None=None)->Decimal:
    q=select(func.coalesce(func.sum(LendingRepayment.amount),0)).where(LendingRepayment.lending_id==lending_id,LendingRepayment.deleted_at.is_(None))
    if exclude:q=q.where(LendingRepayment.id!=exclude)
    return Decimal(db.scalar(q) or 0)
def status(l:Lending,total:Decimal):
    remaining=l.total_amount-total;l.status="PENDING" if total==0 else "FULLY_PAID" if remaining==0 else "PARTIAL"
    return remaining
def detail(db:Session,l:Lending)->dict:
    total=repaid(db,l.id);return {"id":l.id,"user_id":l.user_id,"person_name":l.person_name,"total_amount":l.total_amount,"lending_date":l.lending_date,"note":l.note,"status":l.status,"created_at":l.created_at,"updated_at":l.updated_at,"amount_repaid":total,"remaining_amount":l.total_amount-total}
def create(db:Session,user_id:str,d:LendingCreate)->Lending:
    try:
        l=Lending(id=str(uuid4()),user_id=user_id,person_name=d.person_name,total_amount=d.total_amount,lending_date=d.lending_date,note=d.note,status="PENDING");t=Transaction(id=str(uuid4()),user_id=user_id,transaction_date=d.lending_date,transaction_type="LENDING_OUT",amount=d.total_amount);db.add_all([l,t]);db.flush();l.lending_out_transaction_id=t.id;create_log(db,user_id,"LENDING",l,"CREATE",new_values=snapshot(l));create_log(db,user_id,"TRANSACTION",t,"CREATE",new_values=snapshot(t));db.commit();db.refresh(l);return l
    except Exception: db.rollback();raise
def update(db:Session,user_id:str,id:str,d:LendingUpdate)->Lending:
    l=get_lending(db,user_id,id);u=d.model_dump(exclude_unset=True);before=snapshot(l);transaction_before=snapshot(l.lending_out_transaction)
    if "total_amount" in u:
        if u["total_amount"]<repaid(db,l.id):raise LendingValidationError("Total amount cannot be less than repaid amount.")
        l.total_amount=u["total_amount"];l.lending_out_transaction.amount=u["total_amount"]
    for k in ("person_name","lending_date","note"):
        if k in u:setattr(l,k,u[k])
    if "lending_date" in u:l.lending_out_transaction.transaction_date=u["lending_date"]
    old_values,new_values=changed_values(before,l,set(u));transaction_old,transaction_new=changed_values(transaction_before,l.lending_out_transaction,{"amount","transaction_date"})
    if old_values:create_log(db,user_id,"LENDING",l,"UPDATE",old_values,new_values)
    if transaction_old:create_log(db,user_id,"TRANSACTION",l.lending_out_transaction,"UPDATE",transaction_old,transaction_new)
    try: db.commit();db.refresh(l);return l
    except Exception: db.rollback();raise
def delete(db:Session,user_id:str,id:str):
    l=get_lending(db,user_id,id);now=datetime.utcnow();l_before=snapshot(l);t_before=snapshot(l.lending_out_transaction);l.deleted_at=now;l.lending_out_transaction.deleted_at=now
    create_log(db,user_id,"LENDING",l,"DELETE",l_before,snapshot(l));create_log(db,user_id,"TRANSACTION",l.lending_out_transaction,"DELETE",t_before,snapshot(l.lending_out_transaction))
    for r in db.scalars(select(LendingRepayment).where(LendingRepayment.lending_id==id,LendingRepayment.deleted_at.is_(None))):
        r_before=snapshot(r);rt_before=snapshot(r.transaction);r.deleted_at=now;r.transaction.deleted_at=now;create_log(db,user_id,"LENDING_REPAYMENT",r,"DELETE",r_before,snapshot(r));create_log(db,user_id,"TRANSACTION",r.transaction,"DELETE",rt_before,snapshot(r.transaction))
    try: db.commit()
    except Exception: db.rollback();raise
