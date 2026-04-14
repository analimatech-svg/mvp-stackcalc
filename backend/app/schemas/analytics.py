from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LLMUsageRead(BaseModel):
    id: str
    provider: str
    model: str
    input_tokens: float
    output_tokens: float
    cost_usd: Optional[float]
    latency_ms: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_sessions: int
    active_sessions: int
    total_llm_cost_usd: float
    total_tokens: int
    avg_latency_ms: float
