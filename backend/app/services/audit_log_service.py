"""Append-only audit log helpers.

The helpers deliberately do not commit: callers retain their existing database
transaction boundary, so a failed business operation rolls back its audit rows.
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy.inspection import inspect
from sqlalchemy.orm import Session

from app.models import AuditLog


_SENSITIVE_FIELDS = {"password", "password_hash", "token", "access_token", "refresh_token", "secret", "credentials", "database_url", "jwt"}


def _json_value(value):
    if isinstance(value, (UUID, Decimal)):
        return str(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.value
    return value


def snapshot(entity, fields: set[str] | None = None) -> dict:
    """Return explicit mapped-column data, excluding credentials and ORM state."""
    result = {}
    for column in inspect(entity).mapper.column_attrs:
        name = column.key
        if name.lower() in _SENSITIVE_FIELDS or (fields is not None and name not in fields):
            continue
        result[name] = _json_value(getattr(entity, name))
    return result


def changed_values(before: dict, entity, requested_fields: set[str] | None = None) -> tuple[dict, dict]:
    after = snapshot(entity, requested_fields)
    old = {key: before.get(key) for key, value in after.items() if before.get(key) != value}
    new = {key: value for key, value in after.items() if key in old}
    return old, new


def create_log(db: Session, user_id: str | None, entity_type: str, entity, action: str, old_values: dict | None = None, new_values: dict | None = None) -> AuditLog:
    log = AuditLog(
        id=str(uuid4()), user_id=user_id, entity_type=entity_type,
        entity_id=str(entity.id), action=action,
        old_values=old_values, new_values=new_values,
    )
    db.add(log)
    return log
