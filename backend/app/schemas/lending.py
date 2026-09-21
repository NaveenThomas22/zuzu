from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

MoneyAmount = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]


class LendingCreate(BaseModel):
    person_name: str = Field(max_length=150)
    total_amount: MoneyAmount
    lending_date: date
    note: str | None = None
    model_config = ConfigDict(extra="forbid")


class LendingUpdate(BaseModel):
    person_name: str | None = Field(default=None, max_length=150)
    total_amount: MoneyAmount | None = None
    lending_date: date | None = None
    note: str | None = None
    model_config = ConfigDict(extra="forbid")


class LendingResponse(BaseModel):
    id: str
    user_id: str
    person_name: str
    total_amount: MoneyAmount
    lending_date: date
    note: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    amount_repaid: Decimal
    remaining_amount: Decimal

    model_config = ConfigDict(from_attributes=True)
