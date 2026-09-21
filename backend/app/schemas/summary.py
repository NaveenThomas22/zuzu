from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, Field


SummaryAmount = Annotated[Decimal, Field(max_digits=12, decimal_places=2)]


class SummaryResponse(BaseModel):
    opening_balance: SummaryAmount
    total_income: SummaryAmount
    total_expense: SummaryAmount
    total_lending_out: SummaryAmount
    total_lending_repayment: SummaryAmount
    total_investment: SummaryAmount
    total_refund: SummaryAmount
    current_balance: SummaryAmount
