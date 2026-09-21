from datetime import date
from decimal import Decimal

from sqlalchemy import case, cast, func, literal, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.sqltypes import Numeric

from app.models import Transaction
from app.schemas.summary import SummaryResponse
from app.schemas.transaction import TransactionType


_ZERO = Decimal("0.00")
_MONEY_TYPE = Numeric(12, 2)


def _total_for(transaction_type: TransactionType):
    return func.coalesce(
        func.sum(
            case(
                (Transaction.transaction_type == transaction_type.value, Transaction.amount),
                else_=cast(literal(0), _MONEY_TYPE),
            )
        ),
        cast(literal(0), _MONEY_TYPE),
    ).label(transaction_type.value.lower())


def _as_money(value: Decimal | None) -> Decimal:
    if value is None:
        return _ZERO
    return Decimal(value).quantize(Decimal("0.01"))


def get_financial_summary(
    db: Session,
    user_id: str,
    *,
    start_date: date | None = None,
    end_date: date | None = None,
) -> SummaryResponse:
    """Aggregate a user's non-deleted transactions into a financial summary."""
    statement = select(
        _total_for(TransactionType.OPENING_BALANCE),
        _total_for(TransactionType.INCOME),
        _total_for(TransactionType.EXPENSE),
        _total_for(TransactionType.LENDING_OUT),
        _total_for(TransactionType.LENDING_REPAYMENT),
        _total_for(TransactionType.INVESTMENT),
        _total_for(TransactionType.REFUND),
    ).where(
        Transaction.user_id == user_id,
        Transaction.deleted_at.is_(None),
    )
    if start_date is not None:
        statement = statement.where(Transaction.transaction_date >= start_date)
    if end_date is not None:
        statement = statement.where(Transaction.transaction_date <= end_date)

    row = db.execute(statement).one()
    opening_balance = _as_money(row[0])
    total_income = _as_money(row[1])
    total_expense = _as_money(row[2])
    total_lending_out = _as_money(row[3])
    total_lending_repayment = _as_money(row[4])
    total_investment = _as_money(row[5])
    total_refund = _as_money(row[6])
    current_balance = (
        opening_balance
        + total_income
        + total_lending_repayment
        + total_refund
        - total_expense
        - total_lending_out
        - total_investment
    ).quantize(Decimal("0.01"))

    return SummaryResponse(
        opening_balance=opening_balance,
        total_income=total_income,
        total_expense=total_expense,
        total_lending_out=total_lending_out,
        total_lending_repayment=total_lending_repayment,
        total_investment=total_investment,
        total_refund=total_refund,
        current_balance=current_balance,
    )
