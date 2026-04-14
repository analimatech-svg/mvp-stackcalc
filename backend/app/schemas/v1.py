from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_context: Optional[dict] = None
    locale: str = "pt-BR"


class AnalyzeResponse(BaseModel):
    analysis: str
    phase_detected: str
    complexity_pct: Optional[float] = None
    artifacts: list = []


class PrioritizeDemand(BaseModel):
    name: str
    scope_score: float = Field(..., ge=0, le=100)
    complexity: str = Field(..., pattern="^(BAIXA|MEDIA|ALTA|MUITO_ALTA|LOW|MEDIUM|HIGH|VERY_HIGH)$")
    urgency: str = Field(..., pattern="^(Alta|Media|Baixa|High|Medium|Low)$")


class PrioritizeRequest(BaseModel):
    demands: list[PrioritizeDemand] = Field(..., min_length=1, max_length=8)
    method: str = Field("stackcalc", pattern="^(stackcalc|moscow|gut|rice)$")


class PrioritizeItem(BaseModel):
    rank: int
    name: str
    priority_score: float
    complexity: str
    urgency: str
    scope_score: float


class PrioritizeResponse(BaseModel):
    ranked: list[PrioritizeItem]
    method: str
