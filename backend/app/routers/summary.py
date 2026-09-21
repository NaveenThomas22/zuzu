from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.summary import SummaryResponse
from app.services.summary_service import get_financial_summary


router = APIRouter(prefix="/api/summary", tags=["Summary"])


@router.get("", response_model=SummaryResponse)
def get_summary(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
) -> SummaryResponse:
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must not be after end_date.",
        )

    return get_financial_summary(
        db,
        current_user.id,
        start_date=start_date,
        end_date=end_date,
    )
