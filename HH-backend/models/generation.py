import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Integer, Index
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.sql import func
from db.database import Base


class Generation(Base):
    __tablename__ = "generations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    share_id = Column(String(12), unique=True, nullable=False, index=True)
    format = Column(String(1), nullable=False)  # 'A' or 'B'
    image_url = Column(Text, nullable=False)
    download_url = Column(Text, nullable=False)
    name = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)
    title = Column(String(150), nullable=True)
    handle = Column(String(50), nullable=True)
    theme = Column(String(30), nullable=True)
    card_no = Column(Integer, nullable=True)
    user_agent = Column(Text, nullable=True)
    ip_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    downloaded_at = Column(DateTime(timezone=True), nullable=True)
    shared_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_generations_created_at", created_at.desc()),
        Index("idx_generations_format", format),
    )


class AdminUser(Base):
    __tablename__ = "admin_users"

    clerk_user_id = Column(String(100), primary_key=True)
    email = Column(String(255), nullable=True)
    added_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
