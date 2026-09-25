from datetime import date
from typing import Annotated
from fastapi import APIRouter,Depends,HTTPException,Response,status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import Lending,LendingRepayment,User
from app.schemas.lending import LendingCreate,LendingResponse,LendingUpdate
from app.schemas.lending_repayment import LendingRepaymentCreate,LendingRepaymentResponse,LendingRepaymentUpdate
from app.services import lending_service as ls
from app.services import lending_repayment_service as rs
router=APIRouter(prefix="/api/lendings",tags=["Lendings"])
def nf():return HTTPException(404,"Lending not found.")
def bad(e):return HTTPException(400,str(e))
def out(db,l):return ls.detail(db,l)
@router.post("",response_model=LendingResponse,status_code=201)
def create(d:LendingCreate,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:return out(db,ls.create(db,u.id,d))
 except Exception as e:raise HTTPException(500,"Unable to create lending.") from e
@router.get("",response_model=list[LendingResponse])
def list_(db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)],status_:str|None=None,start_date:date|None=None,end_date:date|None=None):
 q=select(Lending).where(Lending.user_id==u.id,Lending.deleted_at.is_(None));
 if status_:q=q.where(Lending.status==status_)
 if start_date:q=q.where(Lending.lending_date>=start_date)
 if end_date:q=q.where(Lending.lending_date<=end_date)
 return ls.list_with_repayment_totals(db, list(db.scalars(q.order_by(Lending.lending_date.desc(),Lending.created_at.desc()))))
@router.get("/{lid}",response_model=LendingResponse)
def get_(lid:str,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:return out(db,ls.get_lending(db,u.id,lid))
 except ls.LendingNotFoundError as e:raise nf() from e
@router.put("/{lid}",response_model=LendingResponse)
def update_(lid:str,d:LendingUpdate,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:return out(db,ls.update(db,u.id,lid,d))
 except ls.LendingNotFoundError as e:raise nf() from e
 except ls.LendingValidationError as e:raise bad(e) from e
@router.delete("/{lid}",status_code=204)
def delete_(lid:str,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:ls.delete(db,u.id,lid);return Response(status_code=204)
 except ls.LendingNotFoundError as e:raise nf() from e
@router.post("/{lid}/repayments",response_model=LendingRepaymentResponse,status_code=201)
def cr(lid:str,d:LendingRepaymentCreate,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:return rs.create(db,u.id,lid,d)
 except ls.LendingNotFoundError as e:raise nf() from e
 except ls.LendingValidationError as e:raise bad(e) from e
@router.get("/{lid}/repayments",response_model=list[LendingRepaymentResponse])
def lr(lid:str,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:ls.get_lending(db,u.id,lid)
 except ls.LendingNotFoundError as e:raise nf() from e
 return list(db.scalars(select(LendingRepayment).where(LendingRepayment.lending_id==lid,LendingRepayment.deleted_at.is_(None)).order_by(LendingRepayment.repayment_date.desc(),LendingRepayment.created_at.desc())))
@router.get("/{lid}/repayments/{rid}",response_model=LendingRepaymentResponse)
def gr(lid:str,rid:str,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:ls.get_lending(db,u.id,lid);return rs.get(db,lid,rid)
 except (ls.LendingNotFoundError,rs.RepaymentNotFoundError) as e:raise nf() from e
@router.put("/{lid}/repayments/{rid}",response_model=LendingRepaymentResponse)
def ur(lid:str,rid:str,d:LendingRepaymentUpdate,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:return rs.update(db,u.id,lid,rid,d)
 except (ls.LendingNotFoundError,rs.RepaymentNotFoundError) as e:raise nf() from e
 except ls.LendingValidationError as e:raise bad(e) from e
@router.delete("/{lid}/repayments/{rid}",status_code=204)
def dr(lid:str,rid:str,db:Annotated[Session,Depends(get_db)],u:Annotated[User,Depends(get_current_user)]):
 try:rs.delete(db,u.id,lid,rid);return Response(status_code=204)
 except (ls.LendingNotFoundError,rs.RepaymentNotFoundError) as e:raise nf() from e
