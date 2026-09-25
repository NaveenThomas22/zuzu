from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Transaction


def get_income_summary(
    db: Session,
    user_id: str,
    *,
    start_date: date | None = None,
    end_date: date | None = None,
    account_id: str | None = None,
) -> dict:
    """Return income summary for the authenticated user avoiding N+1 queries."""
    
    base_conditions = [
        Transaction.user_id == user_id,
        Transaction.transaction_type == "INCOME",
        Transaction.deleted_at.is_(None)
    ]
    
    if start_date is not None:
        base_conditions.append(Transaction.transaction_date >= start_date)
    if end_date is not None:
        base_conditions.append(Transaction.transaction_date <= end_date)
    if account_id is not None:
        base_conditions.append(Transaction.account_id == account_id)

    # 1. Total income and count in one query
    summary_res = db.execute(
        select(
            func.sum(Transaction.amount),
            func.count(Transaction.id)
        ).where(*base_conditions)
    ).first()
    
    total_income = summary_res[0] if summary_res and summary_res[0] else Decimal("0.00")
    income_entries = summary_res[1] if summary_res and summary_res[1] else 0

    # 2. Monthly breakdown grouping by year and month
    year_col = func.extract("year", Transaction.transaction_date).label("year")
    month_col = func.extract("month", Transaction.transaction_date).label("month")
    
    breakdown_stmt = (
        select(
            year_col,
            month_col,
            func.sum(Transaction.amount).label("total")
        )
        .where(*base_conditions)
        .group_by(year_col, month_col)
        .order_by(year_col.desc(), month_col.desc())
    )
    
    breakdown_res = db.execute(breakdown_stmt).all()
    
    monthly_breakdown = [
        {
            "year": int(row.year),
            "month": int(row.month),
            "total": row.total
        }
        for row in breakdown_res
    ]
    
    return {
        "total_income": total_income,
        "income_entries": income_entries,
        "monthly_breakdown": monthly_breakdown
    }
