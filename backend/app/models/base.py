import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=text("now()"),
        onupdate=datetime.utcnow,
        nullable=False,
    )


def new_uuid() -> str:
    return str(uuid.uuid4())
