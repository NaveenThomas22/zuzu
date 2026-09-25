"""Fail-closed fixtures for the isolated MySQL test database."""

from __future__ import annotations

from urllib.parse import urlparse
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import require_test_database_url
from app.core.database import get_db
from app.main import app
from app.models import Category, Subcategory


def _safe_database_label(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.hostname or 'unknown'}{parsed.path or '/'}"


@pytest.fixture(scope="session")
def test_database_url() -> str:
    """
    Get the explicitly configured test database URL.

    The application/test database must be configured through
    TEST_DATABASE_URL and must never fall back to the production
    DATABASE_URL.
    """
    url = require_test_database_url()

    print(f"pytest database: {_safe_database_label(url)}")

    return url


@pytest.fixture(scope="session")
def test_engine(test_database_url: str):
    """
    Connect to the existing test database.

    The test database already contains the required schema,
    so pytest must NOT create or drop tables here.
    """
    engine = create_engine(
        test_database_url,
        pool_pre_ping=True,
    )

    yield engine

    engine.dispose()


@pytest.fixture()
def db(test_engine) -> Session:
    """
    Provide a database session wrapped in a transaction.

    Each test gets its own transaction, which is rolled back
    after the test so test data does not remain in the database.
    """
    connection = test_engine.connect()

    transaction = connection.begin()

    session = sessionmaker(
        bind=connection,
        autoflush=False,
        autocommit=False,
        join_transaction_mode="create_savepoint",
    )()

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db: Session):
    """
    FastAPI TestClient using the test database session.
    """

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def category(db: Session) -> Category:
    """
    Create a unique test category.
    """

    item = Category(
        id=str(uuid4()),
        name=f"Test Category {uuid4().hex}",
        is_active=True,
    )

    db.add(item)
    db.commit()

    return item


@pytest.fixture()
def bills_category(db: Session) -> Category:
    """
    Create a Bills category with the expected bill subcategories.
    """

    item = db.query(Category).filter_by(name="Bills").first()
    if not item:
        item = Category(
            id=str(uuid4()),
            name="Bills",
            is_active=True,
        )
        db.add(item)
        db.flush()

    for name in (
        "Mobile Recharge",
        "Electricity",
        "Water",
        "Internet",
        "Gas",
        "Subscription",
        "Other",
    ):
        if not db.query(Subcategory).filter_by(category_id=item.id, name=name).first():
            db.add(
                Subcategory(
                    id=str(uuid4()),
                    category_id=item.id,
                    name=name,
                    is_active=True,
                )
            )

    db.commit()
    return item


def register(
    client: TestClient,
    email: str | None = None,
) -> dict:
    """
    Register a test user.
    """

    email = email or f"audit-{uuid4().hex}@example.com"

    response = client.post(
        "/api/auth/register",
        json={
            "name": "Audit Test",
            "email": email,
            "password": "test-password",
            "confirm_password": "test-password",
            "gender": "MALE",
        },
    )

    assert response.status_code == 201, response.text

    return response.json()


@pytest.fixture()
def user(client: TestClient) -> dict:
    """
    Create a test user.
    """
    return register(client)


@pytest.fixture()
def auth_headers(
    client: TestClient,
    user: dict,
) -> dict[str, str]:
    """
    Login the test user and return Bearer authentication headers.
    """

    response = client.post(
        "/api/auth/login",
        json={
            "email": user["email"],
            "password": "test-password",
        },
    )

    assert response.status_code == 200, response.text

    return {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }