from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: str
    user_id: str | None
    entity_type: str
    entity_id: str
    action: str
    old_values: dict[str, Any] | None
    new_values: dict[str, Any] | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
