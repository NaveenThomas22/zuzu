from datetime import date
from decimal import Decimal

from sqlalchemy import and_, case, func, select
from sqlalchemy.orm import Session

from app.models import Account, Bill, Budget, Category, Lending, LendingRepayment, Subcategory, Transaction
from app.services.summary_service import get_financial_summary


_ZERO = Decimal("0.00")


def _money(value: Decimal | None) -> Decimal:
    return Decimal(value or 0).quantize(Decimal("0.01"))


def _transaction_conditions(user_id: str, start_date: date | None, end_date: date | None) -> list:
    conditions = [Transaction.user_id == user_id, Transaction.deleted_at.is_(None)]
    if start_date is not None:
        conditions.append(Transaction.transaction_date >= start_date)
    if end_date is not None:
        conditions.append(Transaction.transaction_date <= end_date)
    return conditions


def _budget_conditions(user_id: str, start_date: date | None, end_date: date | None) -> list:
    conditions = [Budget.user_id == user_id, Budget.deleted_at.is_(None)]
    if start_date is not None:
        conditions.append((Budget.year > start_date.year) | ((Budget.year == start_date.year) & (Budget.month >= start_date.month)))
    if end_date is not None:
        conditions.append((Budget.year < end_date.year) | ((Budget.year == end_date.year) & (Budget.month <= end_date.month)))
    return conditions


def _expense_by_category(db: Session, conditions: list) -> list[dict]:
    rows = db.execute(
        select(Category.id, Category.name, func.sum(Transaction.amount))
        .join(Category, Category.id == Transaction.category_id)
        .where(*conditions, Transaction.transaction_type == "EXPENSE")
        .group_by(Category.id, Category.name)
        .order_by(func.sum(Transaction.amount).desc(), Category.name)
    )
    return [{"category_id": row[0], "category_name": row[1], "amount": _money(row[2])} for row in rows]


def _expense_by_subcategory(db: Session, conditions: list) -> list[dict]:
    rows = db.execute(
        select(Subcategory.id, Subcategory.name, Category.name, func.sum(Transaction.amount))
        .join(Subcategory, Subcategory.id == Transaction.subcategory_id)
        .join(Category, Category.id == Transaction.category_id)
        .where(*conditions, Transaction.transaction_type == "EXPENSE")
        .group_by(Subcategory.id, Subcategory.name, Category.name)
        .order_by(func.sum(Transaction.amount).desc(), Subcategory.name)
    )
    return [{"subcategory_id": row[0], "subcategory_name": row[1], "category_name": row[2], "amount": _money(row[3])} for row in rows]


def _monthly_income_expense(db: Session, conditions: list) -> list[dict]:
    year = func.year(Transaction.transaction_date)
    month = func.month(Transaction.transaction_date)
    rows = db.execute(
        select(
            year, month,
            func.coalesce(func.sum(case((Transaction.transaction_type == "INCOME", Transaction.amount), else_=0)), 0),
            func.coalesce(func.sum(case((Transaction.transaction_type == "EXPENSE", Transaction.amount), else_=0)), 0),
        )
        .where(*conditions)
        .group_by(year, month)
        .order_by(year, month)
    )
    return [{"year": int(row[0]), "month": int(row[1]), "income": _money(row[2]), "expense": _money(row[3])} for row in rows]


def _account_summary(db: Session, conditions: list) -> list[dict]:
    rows = db.execute(
        select(
            Account.id, Account.name,
            func.coalesce(func.sum(case((Transaction.transaction_type == "EXPENSE", Transaction.amount), else_=0)), 0),
            func.coalesce(func.sum(case((Transaction.transaction_type == "INCOME", Transaction.amount), else_=0)), 0),
        )
        .join(Account, Account.id == Transaction.account_id)
        .where(*conditions)
        .group_by(Account.id, Account.name)
        .order_by(Account.name)
    )
    return [{"account_id": row[0], "account_name": row[1], "expense": _money(row[2]), "income": _money(row[3])} for row in rows]


def _budget_vs_actual(db: Session, user_id: str, start_date: date | None, end_date: date | None) -> list[dict]:
    budgets = list(
        db.execute(
            select(Budget, Category.name)
            .join(Category, Category.id == Budget.category_id)
            .where(*_budget_conditions(user_id, start_date, end_date))
            .order_by(Budget.year, Budget.month, Category.name)
        )
    )
    conditions = _transaction_conditions(user_id, start_date, end_date)
    rows = db.execute(
        select(func.year(Transaction.transaction_date), func.month(Transaction.transaction_date), Transaction.category_id, func.sum(Transaction.amount))
        .where(*conditions, Transaction.transaction_type == "EXPENSE")
        .group_by(func.year(Transaction.transaction_date), func.month(Transaction.transaction_date), Transaction.category_id)
    )
    spending = {(int(row[0]), int(row[1]), row[2]): _money(row[3]) for row in rows}
    result = []
    for budget, category_name in budgets:
        spent = spending.get((budget.year, budget.month, budget.category_id), _ZERO)
        amount = _money(budget.amount)
        result.append({
            "category_id": budget.category_id, "category_name": category_name, "year": budget.year, "month": budget.month,
            "budget_amount": amount, "amount_spent": spent,
            "remaining_amount": (amount - spent).quantize(Decimal("0.01")),
            "percentage_used": (spent / amount * Decimal("100")).quantize(Decimal("0.01")),
        })
    return result


def _lending(db: Session, user_id: str) -> dict:
    rows = db.execute(
        select(Lending.id, Lending.total_amount, func.coalesce(func.sum(LendingRepayment.amount), 0))
        .outerjoin(LendingRepayment, and_(LendingRepayment.lending_id == Lending.id, LendingRepayment.deleted_at.is_(None)))
        .where(Lending.user_id == user_id, Lending.deleted_at.is_(None))
        .group_by(Lending.id, Lending.total_amount)
    )
    total_lent = _ZERO; total_repaid = _ZERO; pending = partial = fully_paid = 0
    for _, lent, repaid in rows:
        lent = _money(lent); repaid = _money(repaid); total_lent += lent; total_repaid += repaid
        if repaid == 0:
            pending += 1
        elif lent - repaid == 0:
            fully_paid += 1
        else:
            partial += 1
    return {"total_lent": total_lent, "total_repaid": total_repaid, "outstanding_amount": (total_lent - total_repaid).quantize(Decimal("0.01")), "pending_lendings": pending, "partial_lendings": partial, "fully_paid_lendings": fully_paid}


def _bills(db: Session, user_id: str, start_date: date | None, end_date: date | None) -> dict:
    conditions = [Bill.user_id == user_id, Bill.deleted_at.is_(None)]
    if start_date is not None:
        conditions.append(Bill.due_date >= start_date)
    if end_date is not None:
        conditions.append(Bill.due_date <= end_date)
    rows = list(db.scalars(select(Bill).where(*conditions)))
    today = date.today(); pending = paid = overdue = cancelled = 0; pending_amount = _ZERO
    for bill in rows:
        if bill.status == "PAID":
            paid += 1
        elif bill.status == "CANCELLED":
            cancelled += 1
        elif bill.due_date < today:
            overdue += 1; pending_amount += _money(bill.amount)
        else:
            pending += 1; pending_amount += _money(bill.amount)
    return {"total_bills": len(rows), "pending": pending, "paid": paid, "overdue": overdue, "cancelled": cancelled, "total_pending_amount": pending_amount.quantize(Decimal("0.01"))}


def get_analytics(db: Session, user_id: str, *, start_date: date | None, end_date: date | None) -> dict:
    summary = get_financial_summary(db, user_id, start_date=start_date, end_date=end_date)
    overview = summary.model_dump()
    conditions = _transaction_conditions(user_id, start_date, end_date)
    return {
        "overview": overview,
        "income_vs_expense": {"income": summary.total_income, "expense": summary.total_expense, "difference": (summary.total_income - summary.total_expense).quantize(Decimal("0.01"))},
        "expense_by_category": _expense_by_category(db, conditions),
        "expense_by_subcategory": _expense_by_subcategory(db, conditions),
        "monthly_income_expense": _monthly_income_expense(db, conditions),
        "account_summary": _account_summary(db, conditions),
        "budget_vs_actual": _budget_vs_actual(db, user_id, start_date, end_date),
        "lending": _lending(db, user_id),
        "bills": _bills(db, user_id, start_date, end_date),
    }
