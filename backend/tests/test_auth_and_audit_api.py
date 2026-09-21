from app.main import app
from tests.conftest import register


def test_register_login_me_and_sensitive_user_audit(client):
    user = register(client)
    login = client.post("/api/auth/login", json={"email": user["email"], "password": "test-password"})
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    assert client.get("/api/auth/me", headers=headers).status_code == 200
    audits = client.get("/api/audit-logs", params={"entity_type": "USER"}, headers=headers)
    assert audits.status_code == 200
    audit = audits.json()[0]
    assert audit["entity_type"] == "USER" and audit["action"] == "CREATE" and audit["user_id"] == user["id"]
    payload = audit["new_values"]
    assert all("password" not in key.lower() and "token" not in key.lower() and "secret" not in key.lower() for key in payload)


def test_auth_rejection_and_audit_api_contract(client, auth_headers):
    assert client.get("/api/audit-logs").status_code == 401
    assert client.post("/api/auth/login", json={"email": "nobody@example.test", "password": "wrong"}).status_code == 401
    assert set(app.openapi()["paths"]["/api/audit-logs"]) == {"get"}
    before = client.get("/api/audit-logs", headers=auth_headers).json()
    assert client.get("/api/audit-logs", params={"page_size": 101}, headers=auth_headers).status_code == 422
    assert client.get("/api/audit-logs", headers=auth_headers).json() == before


def test_audit_user_isolation(client, auth_headers):
    first = client.post("/api/accounts", json={"name": "First", "account_type": "BANK"}, headers=auth_headers).json()
    second_user = register(client)
    second_token = client.post("/api/auth/login", json={"email": second_user["email"], "password": "test-password"}).json()["access_token"]
    second_headers = {"Authorization": f"Bearer {second_token}"}
    assert client.get("/api/audit-logs", params={"entity_id": first["id"]}, headers=second_headers).json() == []
    assert client.get(f"/api/accounts/{first['id']}", headers=second_headers).status_code == 404
