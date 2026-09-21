from datetime import date


def _audits(client, headers, entity_type, entity_id):
    response = client.get("/api/audit-logs", params={"entity_type": entity_type, "entity_id": entity_id, "page_size": 100}, headers=headers)
    assert response.status_code == 200, response.text
    return response.json()


def _assert_actions(logs, *actions):
    assert {log["action"] for log in logs}.issuperset(actions)
    assert all(log["created_at"] and log["user_id"] for log in logs)


def test_account_transaction_and_budget_audits(client, auth_headers, category):
    account = client.post("/api/accounts", json={"name": "Test account", "account_type": "BANK"}, headers=auth_headers)
    assert account.status_code == 201, account.text
    account_id = account.json()["id"]
    assert client.put(f"/api/accounts/{account_id}", json={"name": "Renamed account"}, headers=auth_headers).status_code == 200
    assert client.delete(f"/api/accounts/{account_id}", headers=auth_headers).status_code == 204
    account_logs = _audits(client, auth_headers, "ACCOUNT", account_id)
    _assert_actions(account_logs, "CREATE", "UPDATE", "DELETE")
    update = next(log for log in account_logs if log["action"] == "UPDATE")
    assert update["old_values"]["name"] == "Test account" and update["new_values"]["name"] == "Renamed account"

    transaction = client.post("/api/transactions", json={"transaction_date": str(date.today()), "transaction_type": "EXPENSE", "category_id": category.id, "amount": "10.00"}, headers=auth_headers)
    assert transaction.status_code == 201, transaction.text
    transaction_id = transaction.json()["id"]
    assert client.put(f"/api/transactions/{transaction_id}", json={"amount": "12.00"}, headers=auth_headers).status_code == 200
    assert client.delete(f"/api/transactions/{transaction_id}", headers=auth_headers).status_code == 204
    transaction_logs = _audits(client, auth_headers, "TRANSACTION", transaction_id)
    _assert_actions(transaction_logs, "CREATE", "UPDATE", "DELETE")
    assert next(log for log in transaction_logs if log["action"] == "UPDATE")["old_values"]["amount"] == "10.00"

    budget = client.post("/api/budgets", json={"category_id": category.id, "year": 2026, "month": 1, "amount": "100.00"}, headers=auth_headers)
    assert budget.status_code == 201, budget.text
    budget_id = budget.json()["id"]
    assert client.put(f"/api/budgets/{budget_id}", json={"amount": "150.00"}, headers=auth_headers).status_code == 200
    assert client.delete(f"/api/budgets/{budget_id}", headers=auth_headers).status_code == 204
    budget_logs = _audits(client, auth_headers, "BUDGET", budget_id)
    _assert_actions(budget_logs, "CREATE", "UPDATE", "DELETE")


def test_bill_payment_audits_are_linked(client, auth_headers, bills_category):
    bill = client.post("/api/bills", json={"bill_type": "INTERNET", "name": "Test internet", "amount": "50.00", "due_date": str(date.today()), "frequency": "MONTHLY"}, headers=auth_headers)
    assert bill.status_code == 201, bill.text
    bill_id = bill.json()["id"]
    assert client.put(f"/api/bills/{bill_id}", json={"note": "updated"}, headers=auth_headers).status_code == 200
    paid = client.post(f"/api/bills/{bill_id}/pay", json={}, headers=auth_headers)
    assert paid.status_code == 200, paid.text
    assert paid.json()["payment_transaction_id"]
    bill_logs = _audits(client, auth_headers, "BILL", bill_id)
    _assert_actions(bill_logs, "CREATE", "UPDATE")
    transaction_logs = _audits(client, auth_headers, "TRANSACTION", paid.json()["payment_transaction_id"])
    _assert_actions(transaction_logs, "CREATE")
    assert client.delete(f"/api/bills/{bill_id}", headers=auth_headers).status_code == 204
    _assert_actions(_audits(client, auth_headers, "BILL", bill_id), "DELETE")


def test_lending_and_repayment_audits(client, auth_headers):
    lending = client.post("/api/lendings", json={"person_name": "Test person", "total_amount": "100.00", "lending_date": str(date.today())}, headers=auth_headers)
    assert lending.status_code == 201, lending.text
    lending_id = lending.json()["id"]
    _assert_actions(_audits(client, auth_headers, "LENDING", lending_id), "CREATE")
    repayment = client.post(f"/api/lendings/{lending_id}/repayments", json={"repayment_date": str(date.today()), "amount": "25.00"}, headers=auth_headers)
    assert repayment.status_code == 201, repayment.text
    repayment_id = repayment.json()["id"]
    assert client.put(f"/api/lendings/{lending_id}/repayments/{repayment_id}", json={"amount": "30.00"}, headers=auth_headers).status_code == 200
    assert client.delete(f"/api/lendings/{lending_id}/repayments/{repayment_id}", headers=auth_headers).status_code == 204
    _assert_actions(_audits(client, auth_headers, "LENDING_REPAYMENT", repayment_id), "CREATE", "UPDATE", "DELETE")
    assert client.delete(f"/api/lendings/{lending_id}", headers=auth_headers).status_code == 204
    _assert_actions(_audits(client, auth_headers, "LENDING", lending_id), "DELETE")
