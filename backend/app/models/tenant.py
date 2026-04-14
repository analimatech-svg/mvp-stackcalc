from sqlalchemy import Column, String, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, new_uuid


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    plan = Column(String(50), nullable=False)  # saas_seat | annual | whitelabel | api
    llm_config = Column(JSONB, default=dict)   # mode + encrypted credentials
    white_label = Column(JSONB, default=dict)  # logo, colors, domain
    seat_limit = Column(Integer, nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    sessions = relationship("DemandSession", back_populates="tenant", cascade="all, delete-orphan")
    llm_usages = relationship("LLMUsage", back_populates="tenant", cascade="all, delete-orphan")
