from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.notification import Notification
from uuid import uuid4

def get_unread_count(db: Session, user_id: str) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id, 
        Notification.is_read == False
    ).count()

def list_notifications(db: Session, user_id: str, page: int = 1, page_size: int = 20) -> list[Notification]:
    offset = (page - 1) * page_size
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).offset(offset).limit(page_size).all()

def create_notification(db: Session, user_id: str, type: str, title: str, message: str, entity_type: str = None, entity_id: str = None) -> Notification:
    notif = Notification(
        id=str(uuid4()),
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
        is_read=False
    )
    db.add(notif)
    db.flush()
    
    # 20-notification limit enforcement in SQL
    # Get the 20th newest notification date
    # Delete anything older than that for the user
    # Or just use row_number to delete in a single query
    limit_query = text("""
        DELETE FROM notifications 
        WHERE user_id = :user_id 
        AND id NOT IN (
            SELECT id FROM (
                SELECT id 
                FROM notifications 
                WHERE user_id = :user_id 
                ORDER BY created_at DESC 
                LIMIT 20
            ) as keep_ids
        )
    """)
    db.execute(limit_query, {"user_id": user_id})
    db.commit()
    db.refresh(notif)
    return notif

def mark_as_read(db: Session, user_id: str, notification_id: str) -> bool:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
        return True
    return False

def mark_all_as_read(db: Session, user_id: str):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()

def delete_notification(db: Session, user_id: str, notification_id: str) -> bool:
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notif:
        db.delete(notif)
        db.commit()
        return True
    return False
