from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .account import Account
    from .bill import Bill
    from .category import Category
    from .lending_repayment import LendingRepayment
    from .subcategory import Subcategory
    from .user import User


class Transaction(Base):
    __tablename__ = "transactions"

    __table_args__ = (
        Index("ix_transactions_user_transaction_date", "user_id", "transaction_date"),
        Index("ix_transactions_user_transaction_type", "user_id", "transaction_type"),
        Index("ix_transactions_category_id", "category_id"),
        Index("ix_transactions_account_id", "account_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    account_id: Mapped[str | None] = mapped_column(ForeignKey("accounts.id"), nullable=True)
    bill_id: Mapped[str | None] = mapped_column(ForeignKey("bills.id"), nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(30), nullable=False)
    category_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    subcategory_id: Mapped[str | None] = mapped_column(ForeignKey("subcategories.id"), nullable=True)
    item_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    need_or_want: Mapped[str | None] = mapped_column(String(10), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="transactions")
    account: Mapped["Account | None"] = relationship(back_populates="transactions")
    bill: Mapped["Bill | None"] = relationship(back_populates="transactions")
    category: Mapped["Category | None"] = relationship(back_populates="transactions")
    subcategory: Mapped["Subcategory | None"] = relationship(back_populates="transactions")
    lending_repayment: Mapped["LendingRepayment | None"] = relationship(
        back_populates="transaction",
        uselist=False,
    )
