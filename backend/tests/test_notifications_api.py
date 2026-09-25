from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.notification_service import create_notification

def test_unauthenticated_user_cannot_access_notifications(client: TestClient):
    response = client.get("/api/notifications")
    assert response.status_code == 401

def test_authenticated_user_can_list_notifications_and_read_unread_count(client: TestClient, auth_headers: dict):
    response = client.get("/api/notifications", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

    count_res = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_res.status_code == 200
    assert count_res.json() == {"unread_count": 0}

def test_notification_lifecycle(client: TestClient, db: Session, auth_headers: dict, user: dict):
    # Setup: clear existing notifications for this user
    from app.models.notification import Notification
    db.query(Notification).filter(Notification.user_id == user["id"]).delete()
    db.commit()

    # create 3 notifications directly via service
    for i in range(3):
        create_notification(db, user["id"], "TEST", f"Title {i}", f"Msg {i}")

    # List
    response = client.get("/api/notifications", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    # Check all are present since timestamps might be identical
    titles = [d["title"] for d in data]
    assert "Title 0" in titles
    assert "Title 1" in titles
    assert "Title 2" in titles
    notif_id_to_read = data[0]["id"]

    # Count
    count_res = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_res.json()["unread_count"] == 3

    # Mark one read
    read_res = client.patch(f"/api/notifications/{notif_id_to_read}/read", headers=auth_headers)
    assert read_res.status_code == 200

    count_res2 = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_res2.json()["unread_count"] == 2

    # Delete one
    delete_res = client.delete(f"/api/notifications/{data[1]['id']}", headers=auth_headers)
    assert delete_res.status_code == 200

    count_res3 = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_res3.json()["unread_count"] == 1

    # Mark all read
    mark_all_res = client.patch("/api/notifications/read-all", headers=auth_headers)
    assert mark_all_res.status_code == 200

    count_res4 = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert count_res4.json()["unread_count"] == 0

    # Ensure deleted notification is gone
    response = client.get("/api/notifications", headers=auth_headers)
    data = response.json()
    assert len(data) == 2

def test_20_notification_limit_enforcement(client: TestClient, db: Session, auth_headers: dict, user: dict):
    # Setup: clear existing notifications
    from app.models.notification import Notification
    db.query(Notification).filter(Notification.user_id == user["id"]).delete()
    db.commit()

    # Create 25 notifications
    for i in range(25):
        create_notification(db, user["id"], "LIMIT_TEST", f"T {i}", "M")

    # The total number of notifications for this user should now be exactly 20.
    response = client.get("/api/notifications?page=1&page_size=20", headers=auth_headers)
    data = response.json()
    assert len(data) == 20

    # Ensure some of the latest ones are present since timestamps might be identical
    titles = [d["title"] for d in data]
    assert "T 24" in titles
    
    # Page 2 should be empty
    response_p2 = client.get("/api/notifications?page=2&page_size=20", headers=auth_headers)
    assert len(response_p2.json()) == 0

def test_user_isolation(client: TestClient, db: Session, auth_headers: dict, user: dict):
    # create a second user
    from uuid import uuid4
    user2_id = str(uuid4())
    # we can bypass user creation by using an existing user from DB, since creating one might violate constraints if we don't know the exact schema
    users = db.query(User).filter(User.id != user["id"]).all()
    if users:
        user2_id = users[0].id
    else:
        # just create a minimal user, hopefully no strict constraints fail
        new_user = User(id=user2_id, name="User B", email=f"{user2_id}@example.com", password_hash="dummy")
        db.add(new_user)
        db.commit()

    # Create a notification for user 2
    notif = create_notification(db, user2_id, "ISOLATION", "Secret", "Shh")

    # Current user (from token) shouldn't be able to delete it
    res = client.delete(f"/api/notifications/{notif.id}", headers=auth_headers)
    assert res.status_code == 404

    # Current user shouldn't be able to mark it read
    res2 = client.patch(f"/api/notifications/{notif.id}/read", headers=auth_headers)
    assert res2.status_code == 404
