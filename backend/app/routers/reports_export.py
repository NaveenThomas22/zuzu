from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User, Account, Category, Subcategory
from app.schemas.transaction import NeedOrWant
from app.services.analytics_service import get_analytics
from app.services.transaction_service import list_transactions
from app.services.report_pdf_service import (
    generate_overview_pdf,
    generate_expense_analysis_pdf,
    generate_expense_list_pdf,
    generate_income_history_pdf,
)

router = APIRouter(prefix="/api/reports/export", tags=["Reports Export"])

def _get_maps(db: Session, user_id: str):
    accounts = {a.id: a.name for a in db.scalars(select(Account).where(Account.user_id == user_id))}
    categories = {c.id: c.name for c in db.scalars(select(Category))}
    subcategories = {s.id: s.name for s in db.scalars(select(Subcategory))}
    return accounts, categories, subcategories

@router.get("/overview/pdf", response_class=Response)
def export_overview_pdf(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    start_date: date | None = None,
    end_date: date | None = None,
) -> Response:
    analytics_data = get_analytics(db, current_user.id, start_date=start_date, end_date=end_date)
    pdf_bytes = generate_overview_pdf(analytics_data, start_date, end_date)
    
    filename = f"Zuzu_Overview_{date.today().isoformat()}.pdf"
    if start_date and end_date:
        filename = f"Zuzu_Overview_{start_date.isoformat()}_to_{end_date.isoformat()}.pdf"
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/expense-analysis/pdf", response_class=Response)
def export_expense_analysis_pdf(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    start_date: date | None = None,
    end_date: date | None = None,
) -> Response:
    analytics_data = get_analytics(db, current_user.id, start_date=start_date, end_date=end_date)
    pdf_bytes = generate_expense_analysis_pdf(analytics_data, start_date, end_date)
    
    filename = f"Zuzu_Expense_Analysis_{date.today().isoformat()}.pdf"
    if start_date and end_date:
        filename = f"Zuzu_Expense_Analysis_{start_date.isoformat()}_to_{end_date.isoformat()}.pdf"
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/expense-list/pdf", response_class=Response)
def export_expense_list_pdf(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    account_id: str | None = None,
    category_id: str | None = None,
    subcategory_id: str | None = None,
    need_or_want: NeedOrWant | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> Response:
    transactions = list_transactions(
        db,
        current_user.id,
        transaction_type="EXPENSE",
        account_id=account_id,
        category_id=category_id,
        subcategory_id=subcategory_id,
        need_or_want=need_or_want.value if need_or_want is not None else None,
        start_date=start_date,
        end_date=end_date,
        page=1,
        page_size=1000000,
    )
    
    accounts, categories, subcategories = _get_maps(db, current_user.id)
    
    filters = {}
    if account_id: filters["ACCOUNT"] = accounts.get(account_id, account_id)
    if category_id: filters["CATEGORY"] = categories.get(category_id, category_id)
    if subcategory_id: filters["SUBCATEGORY"] = subcategories.get(subcategory_id, subcategory_id)
    if need_or_want: filters["TYPE"] = need_or_want.value
    
    pdf_bytes = generate_expense_list_pdf(transactions, accounts, categories, subcategories, start_date, end_date, filters)
    
    filename = f"Zuzu_Expense_List_{date.today().isoformat()}.pdf"
    if start_date and end_date:
        filename = f"Zuzu_Expense_List_{start_date.isoformat()}_to_{end_date.isoformat()}.pdf"
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/income-history/pdf", response_class=Response)
def export_income_history_pdf(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    account_id: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> Response:
    transactions = list_transactions(
        db,
        current_user.id,
        transaction_type="INCOME",
        account_id=account_id,
        start_date=start_date,
        end_date=end_date,
        page=1,
        page_size=1000000,
    )
    
    accounts, _, _ = _get_maps(db, current_user.id)
    
    filters = {}
    if account_id: filters["ACCOUNT"] = accounts.get(account_id, account_id)
    
    pdf_bytes = generate_income_history_pdf(transactions, accounts, start_date, end_date, filters)
    
    filename = f"Zuzu_Income_History_{date.today().isoformat()}.pdf"
    if start_date and end_date:
        filename = f"Zuzu_Income_History_{start_date.isoformat()}_to_{end_date.isoformat()}.pdf"
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
