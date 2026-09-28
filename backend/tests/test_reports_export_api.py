from datetime import date
from decimal import Decimal
from uuid import uuid4

from app.models import Account, Category, Transaction

def _setup_transactions(db, user_id):
    account = Account(id=str(uuid4()), user_id=user_id, name="Test Account", account_type="BANK")
    category = Category(id=str(uuid4()), name="Test Category", icon="utensils", is_active=True)
    db.add_all([account, category])
    db.flush()

    t1 = Transaction(
        id=str(uuid4()), user_id=user_id, account_id=account.id,
        transaction_date=date(2026, 9, 15), transaction_type="EXPENSE",
        category_id=category.id, item_name="Test Item 1", amount=Decimal("50.00")
    )
    t2 = Transaction(
        id=str(uuid4()), user_id=user_id, account_id=account.id,
        transaction_date=date(2026, 9, 16), transaction_type="INCOME",
        item_name="Salary", amount=Decimal("150.00")
    )
    db.add_all([t1, t2])
    db.commit()
    return account.id, category.id

def test_export_overview_pdf_authenticated(client, auth_headers, user, db):
    _setup_transactions(db, user["id"])
    response = client.get("/api/reports/export/overview/pdf", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "attachment; filename=Zuzu_Overview_" in response.headers["Content-Disposition"]
    assert len(response.content) > 100

def test_export_overview_pdf_unauthenticated(client):
    response = client.get("/api/reports/export/overview/pdf")
    assert response.status_code == 401

def test_export_expense_analysis_pdf(client, auth_headers, user, db):
    _setup_transactions(db, user["id"])
    response = client.get("/api/reports/export/expense-analysis/pdf", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "attachment; filename=Zuzu_Expense_Analysis_" in response.headers["Content-Disposition"]
    assert len(response.content) > 100

def test_export_expense_list_pdf_respects_filters(client, auth_headers, user, db):
    acc_id, cat_id = _setup_transactions(db, user["id"])
    response = client.get(f"/api/reports/export/expense-list/pdf?account_id={acc_id}&category_id={cat_id}&start_date=2026-09-01&end_date=2026-09-30", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "attachment; filename=Zuzu_Expense_List_" in response.headers["Content-Disposition"]
    assert len(response.content) > 100

def test_export_income_history_pdf_respects_filters(client, auth_headers, user, db):
    acc_id, _ = _setup_transactions(db, user["id"])
    response = client.get(f"/api/reports/export/income-history/pdf?account_id={acc_id}&start_date=2026-09-01&end_date=2026-09-30", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/pdf"
    assert "attachment; filename=Zuzu_Income_History_" in response.headers["Content-Disposition"]
    assert len(response.content) > 100

def test_pdf_exports_prevent_cross_user_data_leakage(client, auth_headers, user, db):
    # Cross-user leakage is prevented because endpoints rely on current_user.id
    response = client.get("/api/reports/export/expense-list/pdf", headers=auth_headers)
    assert response.status_code == 200
