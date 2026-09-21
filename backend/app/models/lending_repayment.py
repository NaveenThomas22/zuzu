from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .lending import Lending
    from .transaction import Transaction


class LendingRepayment(Base):
    __tablename__ = "lending_repayments"

    __table_args__ = (
        Index("ix_lending_repayments_lending_date", "lending_id", "repayment_date"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    lending_id: Mapped[str] = mapped_column(ForeignKey("lendings.id"), nullable=False)
    transaction_id: Mapped[str] = mapped_column(ForeignKey("transactions.id"), unique=True, nullable=False)
    repayment_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    lending: Mapped["Lending"] = relationship(back_populates="repayments")
    transaction: Mapped["Transaction"] = relationship(back_populates="lending_repayment")
