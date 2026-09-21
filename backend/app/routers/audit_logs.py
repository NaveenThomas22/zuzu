from datetime import date, datetime, time
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import AuditLog, User
from app.schemas.audit_log import AuditLogResponse

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])


@router.get("", response_model=list[AuditLogResponse])
def list_audit_logs(
    db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)],
    entity_type: str | None = None, entity_id: str | None = None, action: str | None = None,
    start_date: date | None = None, end_date: date | None = None,
    page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=100),
) -> list[AuditLog]:
    statement = select(AuditLog).where(AuditLog.user_id == current_user.id)
    if entity_type is not None:
        statement = statement.where(AuditLog.entity_type == entity_type.upper())
    if entity_id is not None:
        statement = statement.where(AuditLog.entity_id == entity_id)
    if action is not None:
        statement = statement.where(AuditLog.action == action.upper())
    if start_date is not None:
        statement = statement.where(AuditLog.created_at >= datetime.combine(start_date, time.min))
    if end_date is not None:
        statement = statement.where(AuditLog.created_at <= datetime.combine(end_date, time.max))
    statement = statement.order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).offset((page - 1) * page_size).limit(page_size)
    return list(db.scalars(statement))

