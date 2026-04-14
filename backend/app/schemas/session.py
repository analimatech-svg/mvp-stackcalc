from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class SessionCreate(BaseModel):
    title: Optional[str] = None
    locale: str = "pt-BR"


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    scope_data: Optional[dict] = None
    estimate_data: Optional[dict] = None
    defend_data: Optional[dict] = None
    validate_data: Optional[dict] = None
    status: Optional[str] = None


class SessionRead(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    phase: str
    title: Optional[str]
    scope_data: dict
    estimate_data: dict
    defend_data: dict
    validate_data: dict
    complexity_pct: Optional[float]
    complexity_lvl: Optional[str]
    messages: list
    artifacts: list
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    context: Optional[dict] = None  # e.g. {"stakeholder_role": "tech_lead"}
    locale: str = "pt-BR"


class AdvancePhaseRequest(BaseModel):
    to_phase: str = Field(..., pattern="^(estimate|defend|validate)$")


class ArtifactRead(BaseModel):
    id: str
    type: str
    content: dict
    file_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ArtifactGenerateRequest(BaseModel):
    artifact_type: str
    locale: str = "pt-BR"


class ValidateRequest(BaseModel):
    estimated_hours: float
    actual_hours: float
    root_cause: Optional[str] = None
    learnings: Optional[str] = None
