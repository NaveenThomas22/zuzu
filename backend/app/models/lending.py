from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .lending_repayment import LendingRepayment
    from .transaction import Transaction
    from .user import User


class Lending(Base):
    __tablename__ = "lendings"

    __table_args__ = (
        Index("ix_lendings_user_id", "user_id"),
        Index("ix_lendings_user_status", "user_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    person_name: Mapped[str] = mapped_column(String(150), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    lending_date: Mapped[date] = mapped_column(Date, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    lending_out_transaction_id: Mapped[str | None] = mapped_column(
        ForeignKey("transactions.id"), unique=True, nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="lendings")
    repayments: Mapped[list["LendingRepayment"]] = relationship(back_populates="lending")
    lending_out_transaction: Mapped["Transaction | None"] = relationship(
        foreign_keys=[lending_out_transaction_id]
    )
