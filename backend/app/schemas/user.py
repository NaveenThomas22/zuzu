from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class UserCreate(BaseModel):
    name: str = Field(max_length=100)
    email: EmailStr
    password: str = Field(min_length=1)
    gender: Gender = Gender.MALE


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=1)
    gender: Gender | None = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    gender: Gender
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
