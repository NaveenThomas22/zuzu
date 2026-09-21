from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

MoneyAmount = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]


class LendingRepaymentCreate(BaseModel):
    repayment_date: date
    amount: MoneyAmount
    note: str | None = None
    model_config = ConfigDict(extra="forbid")


class LendingRepaymentUpdate(BaseModel):
    repayment_date: date | None = None
    amount: MoneyAmount | None = None
    note: str | None = None
    model_config = ConfigDict(extra="forbid")


class LendingRepaymentResponse(BaseModel):
    id: str
    lending_id: str
    transaction_id: str
    repayment_date: date
    amount: MoneyAmount
    note: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
