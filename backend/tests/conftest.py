"""Fail-closed fixtures for the isolated MySQL test database."""
from __future__ import annotations

from urllib.parse import urlparse
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import require_test_database_url
from app.core.database import Base, get_db
from app.main import app
from app.models import Category, Subcategory


def _safe_database_label(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.hostname or 'unknown'}{parsed.path or '/'}"


@pytest.fixture(scope="session")
def test_database_url() -> str:
    # This runs before any schema mutation and never falls back to production.
    url = require_test_database_url()
    print(f"pytest database: {_safe_database_label(url)}")
    return url


@pytest.fixture(scope="session")
def test_engine(test_database_url: str):
    engine = create_engine(test_database_url, pool_pre_ping=True)
    Base.metadata.create_all(engine)
    yield engine
    # The engine can only be constructed from TEST_DATABASE_URL, validated above.
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture()
def db(test_engine) -> Session:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection, autoflush=False, autocommit=False)()
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db: Session):
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def category(db: Session) -> Category:
    item = Category(id=str(uuid4()), name=f"Test Category {uuid4().hex}", is_active=True)
    db.add(item)
    db.commit()
    return item


@pytest.fixture()
def bills_category(db: Session) -> Category:
    item = Category(id=str(uuid4()), name="Bills", is_active=True)
    db.add(item)
    db.flush()
    for name in ("Mobile Recharge", "Electricity", "Water", "Internet", "Gas", "Subscription", "Other"):
        db.add(Subcategory(id=str(uuid4()), category_id=item.id, name=name, is_active=True))
    db.commit()
    return item


def register(client: TestClient, email: str | None = None) -> dict:
    email = email or f"audit-{uuid4().hex}@example.test"
    response = client.post("/api/auth/register", json={"name": "Audit Test", "email": email, "password": "test-password", "confirm_password": "test-password", "gender": "MALE"})
    assert response.status_code == 201, response.text
    return response.json()


@pytest.fixture()
def user(client: TestClient) -> dict:
    return register(client)


@pytest.fixture()
def auth_headers(client: TestClient, user: dict) -> dict[str, str]:
    response = client.post("/api/auth/login", json={"email": user["email"], "password": "test-password"})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
