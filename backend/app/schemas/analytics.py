from decimal import Decimal

from pydantic import BaseModel


class OverviewAnalytics(BaseModel):
    opening_balance: Decimal
    total_income: Decimal
    total_expense: Decimal
    total_lending_out: Decimal
    total_lending_repayment: Decimal
    total_investment: Decimal
    total_refund: Decimal
    current_balance: Decimal


class IncomeVsExpense(BaseModel):
    income: Decimal
    expense: Decimal
    difference: Decimal


class CategoryExpense(BaseModel):
    category_id: str
    category_name: str
    amount: Decimal


class SubcategoryExpense(BaseModel):
    subcategory_id: str
    subcategory_name: str
    category_name: str
    amount: Decimal


class MonthlyIncomeExpense(BaseModel):
    year: int
    month: int
    income: Decimal
    expense: Decimal


class AccountAnalytics(BaseModel):
    account_id: str
    account_name: str
    expense: Decimal
    income: Decimal


class BudgetActual(BaseModel):
    category_id: str
    category_name: str
    year: int
    month: int
    budget_amount: Decimal
    amount_spent: Decimal
    remaining_amount: Decimal
    percentage_used: Decimal


class LendingAnalytics(BaseModel):
    total_lent: Decimal
    total_repaid: Decimal
    outstanding_amount: Decimal
    pending_lendings: int
    partial_lendings: int
    fully_paid_lendings: int


class BillAnalytics(BaseModel):
    total_bills: int
    pending: int
    paid: int
    overdue: int
    cancelled: int
    total_pending_amount: Decimal


class AnalyticsResponse(BaseModel):
    overview: OverviewAnalytics
    income_vs_expense: IncomeVsExpense
    expense_by_category: list[CategoryExpense]
    expense_by_subcategory: list[SubcategoryExpense]
    monthly_income_expense: list[MonthlyIncomeExpense]
    account_summary: list[AccountAnalytics]
    budget_vs_actual: list[BudgetActual]
    lending: LendingAnalytics
    bills: BillAnalytics
