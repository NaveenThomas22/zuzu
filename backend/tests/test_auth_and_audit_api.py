from datetime import datetime, timedelta, timezone

from app.main import app
from app.models import RefreshToken
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
    assert client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong"}).status_code == 401
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


def test_login_sets_refresh_cookie_and_refresh_rotates_session(client):
    user = register(client)
    login_response = client.post("/api/auth/login", json={"email": user["email"], "password": "test-password"})
    assert login_response.status_code == 200
    body = login_response.json()
    assert "access_token" in body
    assert "zuzu_refresh_token" in login_response.cookies
    old_refresh = login_response.cookies["zuzu_refresh_token"]
    assert old_refresh

    import time
    time.sleep(1)
    refresh_response = client.post("/api/auth/refresh", cookies={"zuzu_refresh_token": old_refresh})
    assert refresh_response.status_code == 200
    refreshed = refresh_response.json()
    assert refreshed["access_token"]
    assert refreshed["access_token"] != body["access_token"]
    assert "zuzu_refresh_token" in refresh_response.cookies
    new_refresh = refresh_response.cookies["zuzu_refresh_token"]
    assert new_refresh
    assert new_refresh != old_refresh

    reused = client.post("/api/auth/refresh", cookies={"zuzu_refresh_token": old_refresh})
    assert reused.status_code == 401


def test_logout_revokes_session_and_refresh_after_logout_fails(client):
    user = register(client)
    login_response = client.post("/api/auth/login", json={"email": user["email"], "password": "test-password"})
    refresh_token = login_response.cookies["zuzu_refresh_token"]

    logout_response = client.post("/api/auth/logout", cookies={"zuzu_refresh_token": refresh_token})
    assert logout_response.status_code == 200
    assert "zuzu_refresh_token" not in logout_response.cookies

    retry = client.post("/api/auth/refresh", cookies={"zuzu_refresh_token": refresh_token})
    assert retry.status_code == 401


def test_expired_and_invalid_refresh_tokens_are_rejected(client, db):
    user = register(client)
    login_response = client.post("/api/auth/login", json={"email": user["email"], "password": "test-password"})
    refresh_token = login_response.cookies["zuzu_refresh_token"]
    session = db.query(RefreshToken).filter_by(user_id=user["id"]).one()
    session.expires_at = datetime.utcnow() - timedelta(minutes=1)
    db.commit()

    expired = client.post("/api/auth/refresh", cookies={"zuzu_refresh_token": refresh_token})
    assert expired.status_code == 401

    invalid = client.post("/api/auth/refresh", cookies={"zuzu_refresh_token": "not-a-valid-token"})
    assert invalid.status_code == 401


def test_uses_valid_access_token_after_login_and_allows_multiple_sessions(client):
    user = register(client)
    first_login = client.post("/api/auth/login", json={"email": user["email"], "password": "test-password"})
    second_login = client.post("/api/auth/login", json={"email": user["email"], "password": "test-password"})
    assert first_login.status_code == 200
    assert second_login.status_code == 200

    first_access = first_login.json()["access_token"]
    second_access = second_login.json()["access_token"]
    assert first_access
    assert second_access    

    first_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {first_access}"})
    second_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {second_access}"})
    assert first_me.status_code == 200
    assert second_me.status_code == 200
    assert first_me.json()["id"] == user["id"]
    assert second_me.json()["id"] == user["id"]

    first_cookie = first_login.cookies["zuzu_refresh_token"]
    second_cookie = second_login.cookies["zuzu_refresh_token"]
    assert first_cookie != second_cookie

    first_refresh = client.post("/api/auth/refresh", cookies={"zuzu_refresh_token": first_cookie})
    assert first_refresh.status_code == 200
    second_refresh = client.post("/api/auth/refresh", cookies={"zuzu_refresh_token": second_cookie})
    assert second_refresh.status_code == 200
