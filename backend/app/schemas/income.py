from decimal import Decimal
from pydantic import BaseModel

class MonthlyIncome(BaseModel):
    year: int
    month: int
    total: Decimal

class IncomeSummaryResponse(BaseModel):
    total_income: Decimal
    income_entries: int
    monthly_breakdown: list[MonthlyIncome]
