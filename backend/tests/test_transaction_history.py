from datetime import date, timedelta
from uuid import uuid4

from app.models import Account, Category, Transaction


def _create_account(client, auth_headers, name: str):
    response = client.post(
        "/api/accounts",
        json={"name": name, "account_type": "BANK"},
        headers=auth_headers,
    )
    assert response.status_code == 201, response.text
    return response.json()


def _create_transaction(client, auth_headers, *, account_id: str, category_id: str, amount: str, need_or_want: str, transaction_type: str = "EXPENSE", day_offset: int = 0):
    payload = {
        "account_id": account_id,
        "transaction_date": str(date.today() + timedelta(days=day_offset)),
        "transaction_type": transaction_type,
        "category_id": category_id,
        "amount": amount,
        "need_or_want": need_or_want,
        "item_name": f"{need_or_want}-{amount}",
    }
    response = client.post("/api/transactions", json=payload, headers=auth_headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_transaction_history_need_want_filter_and_default_pagination(client, auth_headers, category):
    account = _create_account(client, auth_headers, "History account")

    _create_transaction(client, auth_headers, account_id=account["id"], category_id=category.id, amount="10.00", need_or_want="NEED", day_offset=1)
    _create_transaction(client, auth_headers, account_id=account["id"], category_id=category.id, amount="20.00", need_or_want="WANT", day_offset=2)
    _create_transaction(client, auth_headers, account_id=account["id"], category_id=category.id, amount="30.00", need_or_want="NEED", day_offset=3)

    need_only = client.get(
        "/api/transactions",
        params={"need_or_want": "NEED", "page": 1, "page_size": 10},
        headers=auth_headers,
    )
    assert need_only.status_code == 200, need_only.text
    rows = need_only.json()
    assert len(rows) == 2
    assert {row["need_or_want"] for row in rows} == {"NEED"}

    default_page = client.get("/api/transactions", headers=auth_headers)
    assert default_page.status_code == 200, default_page.text
    assert len(default_page.json()) <= 50


def test_transaction_history_combined_filters_and_pagination(client, auth_headers, category):
    account = _create_account(client, auth_headers, "Filter account")

    first = _create_transaction(client, auth_headers, account_id=account["id"], category_id=category.id, amount="40.00", need_or_want="NEED", transaction_type="EXPENSE", day_offset=-5)
    second = _create_transaction(client, auth_headers, account_id=account["id"], category_id=category.id, amount="50.00", need_or_want="NEED", transaction_type="EXPENSE", day_offset=-4)
    third = _create_transaction(client, auth_headers, account_id=account["id"], category_id=category.id, amount="60.00", need_or_want="WANT", transaction_type="EXPENSE", day_offset=-3)

    filtered = client.get(
        "/api/transactions",
        params={
            "start_date": str(date.today() - timedelta(days=6)),
            "end_date": str(date.today() - timedelta(days=2)),
            "transaction_type": "EXPENSE",
            "category_id": category.id,
            "account_id": account["id"],
            "need_or_want": "NEED",
            "page": 1,
            "page_size": 10,
        },
        headers=auth_headers,
    )
    assert filtered.status_code == 200, filtered.text
    rows = filtered.json()
    assert [row["id"] for row in rows] == [second["id"], first["id"]]

    second_page = client.get(
        "/api/transactions",
        params={"page": 2, "page_size": 1},
        headers=auth_headers,
    )
    assert second_page.status_code == 200, second_page.text
    assert len(second_page.json()) == 1


def test_transaction_history_user_isolation_and_soft_delete(client, auth_headers, category):
    account = _create_account(client, auth_headers, "Isolation account")
    other_user = client.post(
        "/api/auth/register",
        json={
            "name": "Other User",
            "email": f"other-{uuid4().hex}@example.test",
            "password": "test-password",
            "confirm_password": "test-password",
            "gender": "MALE",
        },
    )
    assert other_user.status_code == 201, other_user.text
    other_token = client.post(
        "/api/auth/login",
        json={"email": other_user.json()["email"], "password": "test-password"},
    )
    assert other_token.status_code == 200, other_token.text
    other_headers = {"Authorization": f"Bearer {other_token.json()['access_token']}"}

    created = _create_transaction(client, auth_headers, account_id=account["id"], category_id=category.id, amount="99.00", need_or_want="WANT")
    assert client.get("/api/transactions", params={"account_id": account["id"]}, headers=other_headers).status_code == 200
    assert client.get(f"/api/transactions/{created['id']}", headers=other_headers).status_code == 404

    delete_response = client.delete(f"/api/transactions/{created['id']}", headers=auth_headers)
    assert delete_response.status_code == 204, delete_response.text

    after_delete = client.get("/api/transactions", headers=auth_headers)
    assert after_delete.status_code == 200, after_delete.text
    assert all(row["id"] != created["id"] for row in after_delete.json())

    assert client.get("/api/transactions", params={"page_size": 101}, headers=auth_headers).status_code == 422
    assert client.get("/api/transactions", params={"page": 0}, headers=auth_headers).status_code == 422
