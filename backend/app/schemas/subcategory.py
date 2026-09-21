from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubcategoryCreate(BaseModel):
    category_id: str
    name: str = Field(max_length=100)


class SubcategoryUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = Field(default=None, max_length=100)
    is_active: bool | None = None


class SubcategoryResponse(BaseModel):
    id: str
    category_id: str
    user_id: str | None
    name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
