from sqlalchemy import Column, String, Text, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin, new_uuid


class DemandSession(Base, TimestampMixin):
    __tablename__ = "demand_sessions"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    tenant_id = Column(UUID(as_uuid=False), ForeignKey("tenants.id"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    phase = Column(String(50), nullable=False, default="qualify")
    # qualify | estimate | defend | validate
    title = Column(Text, nullable=True)
    scope_data = Column(JSONB, default=dict)
    estimate_data = Column(JSONB, default=dict)
    defend_data = Column(JSONB, default=dict)
    validate_data = Column(JSONB, default=dict)
    complexity_pct = Column(Numeric(5, 2), nullable=True)
    complexity_lvl = Column(String(20), nullable=True)
    # BAIXA | MEDIA | ALTA | MUITO_ALTA
    messages = Column(JSONB, default=list)
    artifacts = Column(JSONB, default=list)
    status = Column(String(50), default="active")  # active | archived

    tenant = relationship("Tenant", back_populates="sessions")
    user = relationship("User", back_populates="sessions")
    artifact_records = relationship(
        "Artifact", back_populates="session", cascade="all, delete-orphan"
    )
    llm_usages = relationship("LLMUsage", back_populates="session")


class Artifact(Base, TimestampMixin):
    __tablename__ = "artifacts"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    tenant_id = Column(UUID(as_uuid=False), ForeignKey("tenants.id"), nullable=False)
    session_id = Column(UUID(as_uuid=False), ForeignKey("demand_sessions.id"), nullable=False)
    type = Column(String(50), nullable=False)
    # checklist | scorecard | calculator_ab | rfc | onepage | email | slack | variance
    content = Column(JSONB, nullable=False)
    file_url = Column(Text, nullable=True)

    session = relationship("DemandSession", back_populates="artifact_records")


class LLMUsage(Base, TimestampMixin):
    __tablename__ = "llm_usage"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    tenant_id = Column(UUID(as_uuid=False), ForeignKey("tenants.id"), nullable=False)
    session_id = Column(UUID(as_uuid=False), ForeignKey("demand_sessions.id"), nullable=True)
    provider = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    input_tokens = Column(Numeric, nullable=False)
    output_tokens = Column(Numeric, nullable=False)
    cost_usd = Column(Numeric(10, 6), nullable=True)
    latency_ms = Column(Numeric, nullable=True)

    tenant = relationship("Tenant", back_populates="llm_usages")
    session = relationship("DemandSession", back_populates="llm_usages")
