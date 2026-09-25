from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=list[NotificationResponse])
def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return notification_service.list_notifications(db, current_user.id, page, page_size)

@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = notification_service.mark_as_read(db, current_user.id, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"detail": "Marked as read"}

@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification_service.mark_all_as_read(db, current_user.id)
    return {"detail": "All marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = notification_service.delete_notification(db, current_user.id, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"detail": "Deleted"}
