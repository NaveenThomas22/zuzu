from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

PositiveMoneyAmount = Annotated[
    Decimal,
    Field(gt=0, max_digits=12, decimal_places=2),
]


class TransactionType(str, Enum):
    OPENING_BALANCE = "OPENING_BALANCE"
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"
    LENDING_OUT = "LENDING_OUT"
    LENDING_REPAYMENT = "LENDING_REPAYMENT"
    INVESTMENT = "INVESTMENT"
    REFUND = "REFUND"


class NeedOrWant(str, Enum):
    NEED = "NEED"
    WANT = "WANT"


class TransactionCreate(BaseModel):
    account_id: str | None = None
    transaction_date: date
    transaction_type: TransactionType
    category_id: str | None = None
    subcategory_id: str | None = None
    item_name: str | None = Field(default=None, max_length=150)
    amount: PositiveMoneyAmount
    need_or_want: NeedOrWant | None = None
    description: str | None = None

    model_config = ConfigDict(extra="forbid")


class TransactionUpdate(BaseModel):
    account_id: str | None = None
    transaction_date: date | None = None
    transaction_type: TransactionType | None = None
    category_id: str | None = None
    subcategory_id: str | None = None
    item_name: str | None = Field(default=None, max_length=150)
    amount: PositiveMoneyAmount | None = None
    need_or_want: NeedOrWant | None = None
    description: str | None = None

    model_config = ConfigDict(extra="forbid")


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    account_id: str | None
    bill_id: str | None
    transaction_date: date
    transaction_type: TransactionType
    category_id: str | None
    subcategory_id: str | None
    item_name: str | None
    amount: PositiveMoneyAmount
    need_or_want: NeedOrWant | None
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
