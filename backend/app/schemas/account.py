from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class AccountType(str, Enum):
    CASH = "CASH"
    BANK = "BANK"
    UPI = "UPI"
    CREDIT_CARD = "CREDIT_CARD"
    WALLET = "WALLET"
    OTHER = "OTHER"


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    account_type: AccountType

    model_config = ConfigDict(extra="forbid")


class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    account_type: AccountType | None = None
    is_active: bool | None = None

    model_config = ConfigDict(extra="forbid")


class AccountResponse(BaseModel):
    id: str
    user_id: str
    name: str
    account_type: AccountType
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
