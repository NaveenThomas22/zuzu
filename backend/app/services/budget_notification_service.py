from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.notification import Notification
from app.services.budget_service import _amount_spent
from app.services.notification_service import create_notification


def check_budget_thresholds(db: Session, user_id: str, category_id: str, transaction_date: date):
    budget = db.scalar(
        select(Budget).where(
            Budget.user_id == user_id,
            Budget.category_id == category_id,
            Budget.year == transaction_date.year,
            Budget.month == transaction_date.month,
            Budget.deleted_at.is_(None)
        )
    )
    if not budget:
        return

    spent = _amount_spent(db, budget)
    budget_amount = Decimal(budget.amount)
    
    if budget_amount <= 0:
        return

    percentage = (spent / budget_amount) * 100

    if percentage > 100:
        threshold = "EXCEEDED"
        title = "Budget Exceeded!"
        message = f"You have exceeded your budget for {budget.category.name} ({transaction_date.strftime('%B %Y')})."
    elif percentage == 100:
        threshold = "100"
        title = "Budget Reached"
        message = f"You have reached 100% of your budget for {budget.category.name} ({transaction_date.strftime('%B %Y')})."
    elif percentage >= 90:
        threshold = "90"
        title = "Budget Alert: 90%"
        message = f"You have used 90% of your budget for {budget.category.name} ({transaction_date.strftime('%B %Y')})."
    elif percentage >= 75:
        threshold = "75"
        title = "Budget Alert: 75%"
        message = f"You have used 75% of your budget for {budget.category.name} ({transaction_date.strftime('%B %Y')})."
    elif percentage >= 50:
        threshold = "50"
        title = "Budget Alert: 50%"
        message = f"You have used 50% of your budget for {budget.category.name} ({transaction_date.strftime('%B %Y')})."
    else:
        return

    notification_type = f"BUDGET_ALERT_{threshold}"

    # Check for duplicate
    existing = db.scalar(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.entity_type == "budget",
            Notification.entity_id == budget.id,
            Notification.type == notification_type
        )
    )
    
    if not existing:
        create_notification(
            db=db,
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            entity_type="budget",
            entity_id=budget.id
        )
