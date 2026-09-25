from datetime import date, timedelta
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Transaction, Account

def test_income_summary_calculates_totals_and_groups_by_month(
    client: TestClient,
    db: Session,
    auth_headers: dict[str, str],
    user: dict,
):
    # Setup account
    account_id = str(uuid4())
    db.add(
        Account(
            id=account_id,
            user_id=user["id"],
            name="Income Test Account",
            account_type="BANK",

        )
    )
    
    # Setup income transactions
    # 1. This month
    db.add(
        Transaction(
            id=str(uuid4()),
            user_id=user["id"],
            account_id=account_id,
            transaction_date=date(2026, 9, 15),
            transaction_type="INCOME",
            amount=1000.00,
            description="Salary 1",
        )
    )
    
    # 2. This month again
    db.add(
        Transaction(
            id=str(uuid4()),
            user_id=user["id"],
            account_id=account_id,
            transaction_date=date(2026, 9, 20),
            transaction_type="INCOME",
            amount=500.00,
            description="Bonus",
        )
    )
    
    # 3. Last month
    db.add(
        Transaction(
            id=str(uuid4()),
            user_id=user["id"],
            account_id=account_id,
            transaction_date=date(2026, 8, 10),
            transaction_type="INCOME",
            amount=1200.00,
            description="Salary August",
        )
    )
    
    # 4. Deleted income (should be ignored)
    deleted_txn = Transaction(
            id=str(uuid4()),
            user_id=user["id"],
            account_id=account_id,
            transaction_date=date(2026, 9, 1),
            transaction_type="INCOME",
            amount=5000.00,
            description="Mistake",
    )
    # Since we can't easily mock datetime.utcnow(), we set deleted_at to any date.
    from datetime import datetime
    deleted_txn.deleted_at = datetime(2026, 9, 1)
    db.add(deleted_txn)
    
    # 5. EXPENSE transaction (should be ignored)
    db.add(
        Transaction(
            id=str(uuid4()),
            user_id=user["id"],
            account_id=account_id,
            transaction_date=date(2026, 9, 5),
            transaction_type="EXPENSE",
            amount=200.00,
            description="Groceries",
        )
    )
    
    # 6. Another user's income (should be ignored)
    from app.models import User
    other_user_id = str(uuid4())
    db.add(User(id=other_user_id, email=f"{other_user_id}@test.com", password_hash="test", name="Other User"))
    db.add(
        Transaction(
            id=str(uuid4()),
            user_id=other_user_id,
            account_id=account_id,
            transaction_date=date(2026, 9, 10),
            transaction_type="INCOME",
            amount=10000.00,
            description="Other user salary",
        )
    )
    
    db.commit()

    # Request the summary without filters
    response = client.get("/api/income/summary", headers=auth_headers)
    assert response.status_code == 200, response.text
    data = response.json()
    
    assert float(data["total_income"]) == 2700.00
    assert data["income_entries"] == 3
    
    # Breakdown should have 2 entries (Sep and Aug)
    breakdown = data["monthly_breakdown"]
    assert len(breakdown) == 2
    
    assert breakdown[0]["year"] == 2026
    assert breakdown[0]["month"] == 9
    assert float(breakdown[0]["total"]) == 1500.00
    
    assert breakdown[1]["year"] == 2026
    assert breakdown[1]["month"] == 8
    assert float(breakdown[1]["total"]) == 1200.00

def test_income_summary_filters_by_date_and_account(
    client: TestClient,
    db: Session,
    auth_headers: dict[str, str],
    user: dict,
):
    account_id_1 = str(uuid4())
    account_id_2 = str(uuid4())
    
    for aid in (account_id_1, account_id_2):
        db.add(
            Account(
                id=aid,
                user_id=user["id"],
                name=f"Acc {aid}",
                account_type="BANK",
            )
        )
        
    db.add(Transaction(id=str(uuid4()), user_id=user["id"], account_id=account_id_1, transaction_date=date(2026, 1, 1), transaction_type="INCOME", amount=100.00))
    db.add(Transaction(id=str(uuid4()), user_id=user["id"], account_id=account_id_1, transaction_date=date(2026, 2, 1), transaction_type="INCOME", amount=200.00))
    db.add(Transaction(id=str(uuid4()), user_id=user["id"], account_id=account_id_2, transaction_date=date(2026, 2, 1), transaction_type="INCOME", amount=300.00))
    
    db.commit()
    
    # Filter by date
    response = client.get("/api/income/summary?start_date=2026-02-01&end_date=2026-02-28", headers=auth_headers)
    data = response.json()
    assert float(data["total_income"]) == 500.00
    assert data["income_entries"] == 2
    
    # Filter by account
    response = client.get(f"/api/income/summary?account_id={account_id_1}", headers=auth_headers)
    data = response.json()
    assert float(data["total_income"]) == 300.00
    assert data["income_entries"] == 2
    
    # Filter by both
    response = client.get(f"/api/income/summary?account_id={account_id_1}&start_date=2026-02-01", headers=auth_headers)
    data = response.json()
    assert float(data["total_income"]) == 200.00
    assert data["income_entries"] == 1
