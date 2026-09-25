from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.income import IncomeSummaryResponse
from app.services.income_service import get_income_summary

router = APIRouter(prefix="/api/income", tags=["Income"])

@router.get("/summary", response_model=IncomeSummaryResponse)
def get_income_summary_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    account_id: str | None = None,
) -> IncomeSummaryResponse:
    summary_data = get_income_summary(
        db,
        current_user.id,
        start_date=start_date,
        end_date=end_date,
        account_id=account_id
    )
    return IncomeSummaryResponse(**summary_data)
