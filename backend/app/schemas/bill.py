from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

MoneyAmount = Annotated[Decimal, Field(gt=0, max_digits=12, decimal_places=2)]


class BillType(str, Enum):
    MOBILE_RECHARGE = "MOBILE_RECHARGE"
    ELECTRICITY = "ELECTRICITY"
    WATER = "WATER"
    INTERNET = "INTERNET"
    GAS = "GAS"
    SUBSCRIPTION = "SUBSCRIPTION"
    OTHER = "OTHER"


class BillFrequency(str, Enum):
    ONE_TIME = "ONE_TIME"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"


class BillStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class BillCreate(BaseModel):
    bill_type: BillType
    name: str = Field(max_length=150)
    amount: MoneyAmount
    due_date: date
    frequency: BillFrequency
    note: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name must not be blank")
        return value


class BillUpdate(BaseModel):
    bill_type: BillType | None = None
    name: str | None = Field(default=None, max_length=150)
    amount: MoneyAmount | None = None
    due_date: date | None = None
    frequency: BillFrequency | None = None
    note: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Name must not be blank")
        return value


class BillPaymentRequest(BaseModel):
    payment_date: date | None = None

    model_config = ConfigDict(extra="forbid")


class BillResponse(BaseModel):
    id: str
    user_id: str
    bill_type: BillType
    name: str
    amount: MoneyAmount
    due_date: date
    frequency: BillFrequency
    status: BillStatus
    paid_at: datetime | None
    note: str | None
    created_at: datetime
    updated_at: datetime
    payment_transaction_id: str | None

    model_config = ConfigDict(from_attributes=True)
