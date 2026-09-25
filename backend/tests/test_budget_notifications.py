from decimal import Decimal
from datetime import date
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.budget import Budget
from app.models.notification import Notification
from app.services.budget_service import create_budget
from app.services.transaction_service import create_transaction
from app.schemas.transaction import TransactionCreate
from app.schemas.budget import BudgetCreate
from app.models.user import User


def test_budget_notification_thresholds(client: TestClient, db: Session, auth_headers: dict, user: dict, category: Category):
    # Setup: create budget for current month
    budget_amount = Decimal("1000.00")
    b_date = date.today()
    budget_data = BudgetCreate(
        category_id=category.id,
        year=b_date.year,
        month=b_date.month,
        amount=budget_amount
    )
    budget = create_budget(db, user["id"], budget_data)

    # 1. 50% threshold
    t1_data = TransactionCreate(
        transaction_date=b_date,
        transaction_type="EXPENSE",
        category_id=category.id,
        amount=Decimal("500.00"),
        item_name="Half",
    )
    create_transaction(db, user["id"], t1_data)
    
    notifs = db.query(Notification).filter(Notification.user_id == user["id"]).all()
    assert len(notifs) == 1
    assert notifs[0].type == "BUDGET_ALERT_50"

    # Verify duplicate prevention: add another $1 expense, total $501 (still 50% range)
    t2_data = TransactionCreate(
        transaction_date=b_date,
        transaction_type="EXPENSE",
        category_id=category.id,
        amount=Decimal("1.00"),
        item_name="Extra",
    )
    create_transaction(db, user["id"], t2_data)
    
    notifs2 = db.query(Notification).filter(Notification.user_id == user["id"]).all()
    assert len(notifs2) == 1  # No new notification
    
    # 2. 75% threshold
    t3_data = TransactionCreate(
        transaction_date=b_date,
        transaction_type="EXPENSE",
        category_id=category.id,
        amount=Decimal("249.00"), # Total: 750
        item_name="Quarter",
    )
    create_transaction(db, user["id"], t3_data)
    
    notifs3 = db.query(Notification).filter(Notification.user_id == user["id"]).all()
    assert len(notifs3) == 2
    assert any(n.type == "BUDGET_ALERT_75" for n in notifs3)

    # 3. 90% threshold
    t4_data = TransactionCreate(
        transaction_date=b_date,
        transaction_type="EXPENSE",
        category_id=category.id,
        amount=Decimal("150.00"), # Total: 900
        item_name="Almost",
    )
    create_transaction(db, user["id"], t4_data)
    
    notifs4 = db.query(Notification).filter(Notification.user_id == user["id"]).all()
    assert len(notifs4) == 3
    assert any(n.type == "BUDGET_ALERT_90" for n in notifs4)

    # 4. 100% threshold
    t5_data = TransactionCreate(
        transaction_date=b_date,
        transaction_type="EXPENSE",
        category_id=category.id,
        amount=Decimal("100.00"), # Total: 1000
        item_name="Full",
    )
    create_transaction(db, user["id"], t5_data)
    
    notifs5 = db.query(Notification).filter(Notification.user_id == user["id"]).all()
    assert len(notifs5) == 4
    assert any(n.type == "BUDGET_ALERT_100" for n in notifs5)

    # 5. Exceeded threshold
    t6_data = TransactionCreate(
        transaction_date=b_date,
        transaction_type="EXPENSE",
        category_id=category.id,
        amount=Decimal("10.00"), # Total: 1010
        item_name="Over",
    )
    create_transaction(db, user["id"], t6_data)
    
    notifs6 = db.query(Notification).filter(Notification.user_id == user["id"]).all()
    assert len(notifs6) == 5
    assert any(n.type == "BUDGET_ALERT_EXCEEDED" for n in notifs6)

    # Test duplicate exceeded (adding more doesn't create another notification)
    t7_data = TransactionCreate(
        transaction_date=b_date,
        transaction_type="EXPENSE",
        category_id=category.id,
        amount=Decimal("10.00"), # Total: 1020
        item_name="More Over",
    )
    create_transaction(db, user["id"], t7_data)
    
    notifs7 = db.query(Notification).filter(Notification.user_id == user["id"]).all()
    assert len(notifs7) == 5
