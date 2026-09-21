from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

MoneyAmount = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]


class BudgetCreate(BaseModel):
    category_id: str
    year: int = Field(ge=1, le=32767)
    month: int = Field(ge=1, le=12)
    amount: MoneyAmount

    model_config = ConfigDict(extra="forbid")


class BudgetUpdate(BaseModel):
    category_id: str | None = None
    year: int | None = Field(default=None, ge=1, le=32767)
    month: int | None = Field(default=None, ge=1, le=12)
    amount: MoneyAmount | None = None

    model_config = ConfigDict(extra="forbid")


class BudgetResponse(BaseModel):
    id: str
    user_id: str
    category_id: str
    category_name: str
    year: int
    month: int
    amount: MoneyAmount
    amount_spent: Decimal
    remaining_amount: Decimal
    percentage_used: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
