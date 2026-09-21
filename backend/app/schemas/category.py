from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(max_length=100)
    icon: str | None = Field(default=None, max_length=100)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    icon: str | None = Field(default=None, max_length=100)
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
