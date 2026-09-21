from datetime import datetime
from uuid import uuid4

from app.models import Category, Subcategory
from tests.conftest import register


def _subcategory(db, category_id: str, name: str, *, user_id: str | None = None, is_active: bool = True, deleted: bool = False) -> Subcategory:
    item = Subcategory(
        id=str(uuid4()), category_id=category_id, user_id=user_id, name=name,
        is_active=is_active, deleted_at=datetime.utcnow() if deleted else None,
    )
    db.add(item)
    return item


def test_list_categories_is_public_and_excludes_inactive_or_deleted(client, db):
    active = Category(id=str(uuid4()), name="Food", icon="utensils", is_active=True)
    inactive = Category(id=str(uuid4()), name="Hidden", is_active=False)
    deleted = Category(id=str(uuid4()), name="Removed", is_active=True, deleted_at=datetime.utcnow())
    db.add_all([active, inactive, deleted])
    db.commit()

    response = client.get("/api/categories")

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [active.id]
    assert response.json()[0]["name"] == "Food"
    assert response.json()[0]["icon"] == "utensils"
    assert response.json()[0]["is_active"] is True


def test_list_subcategories_scopes_custom_entries_to_current_user(client, db, auth_headers, user):
    category = Category(id=str(uuid4()), name="Food", is_active=True)
    db.add(category)
    db.flush()
    other_user = register(client)
    system = _subcategory(db, category.id, "System")
    own = _subcategory(db, category.id, "Mine", user_id=user["id"])
    _subcategory(db, category.id, "Other user", user_id=other_user["id"])
    _subcategory(db, category.id, "Inactive", is_active=False)
    _subcategory(db, category.id, "Deleted", deleted=True)
    db.commit()

    response = client.get(f"/api/categories/{category.id}/subcategories", headers=auth_headers)

    assert response.status_code == 200
    assert {item["id"] for item in response.json()} == {system.id, own.id}
    assert {item["name"] for item in response.json()} == {"System", "Mine"}


def test_list_subcategories_rejects_missing_inactive_and_deleted_categories(client, db, auth_headers):
    inactive = Category(id=str(uuid4()), name="Inactive", is_active=False)
    deleted = Category(id=str(uuid4()), name="Deleted", is_active=True, deleted_at=datetime.utcnow())
    db.add_all([inactive, deleted])
    db.commit()

    for category_id in (str(uuid4()), inactive.id, deleted.id):
        response = client.get(f"/api/categories/{category_id}/subcategories", headers=auth_headers)
        assert response.status_code == 404
        assert response.json() == {"detail": "Category not found."}


def test_list_subcategories_requires_authentication(client, category):
    response = client.get(f"/api/categories/{category.id}/subcategories")
    assert response.status_code == 401
