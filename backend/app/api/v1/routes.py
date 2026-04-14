"""
Public API (API key auth) — /api/v1/analyze, /api/v1/prioritize.
"""
from fastapi import APIRouter, Depends
from ..deps import get_api_key_tenant
from ...models import Tenant
from ...schemas.v1 import (
    AnalyzeRequest, AnalyzeResponse,
    PrioritizeRequest, PrioritizeResponse, PrioritizeItem,
)
from ...core.agent import StackCalcAgent

router = APIRouter(prefix="/api/v1", tags=["v1-api"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    body: AnalyzeRequest,
    tenant: Tenant = Depends(get_api_key_tenant),
):
    """Single-shot analysis without session persistence."""
    agent = StackCalcAgent(
        tenant_id=tenant.id,
        llm_config=tenant.llm_config,
        locale=body.locale,
    )
    session_data = body.session_context or {
        "phase": "qualify",
        "scope_data": {},
        "estimate_data": {},
        "messages": [],
        "artifacts": [],
    }
    full_text = ""
    artifacts = []
    async for event in agent.chat(body.message, session_data):
        if event["type"] == "token":
            full_text += event["content"]
        elif event["type"] == "artifact_ready":
            artifacts.append(event["artifact"])

    return AnalyzeResponse(
        analysis=full_text,
        phase_detected=session_data.get("phase", "qualify"),
        artifacts=artifacts,
    )


@router.post("/prioritize", response_model=PrioritizeResponse)
async def prioritize(
    body: PrioritizeRequest,
    tenant: Tenant = Depends(get_api_key_tenant),
):
    """Rank demands by composite priority score."""
    complexity_inv = {"BAIXA": 100, "MEDIA": 75, "ALTA": 50, "MUITO_ALTA": 25,
                      "LOW": 100, "MEDIUM": 75, "HIGH": 50, "VERY_HIGH": 25}
    urgency_score = {"Alta": 100, "Media": 50, "Baixa": 20,
                     "High": 100, "Medium": 50, "Low": 20}

    ranked = []
    for d in body.demands:
        score = (
            d.scope_score * 0.35
            + complexity_inv.get(d.complexity, 50) * 0.30
            + urgency_score.get(d.urgency, 50) * 0.35
        )
        ranked.append((d, round(score, 2)))

    ranked.sort(key=lambda x: x[1], reverse=True)
    return PrioritizeResponse(
        method=body.method,
        ranked=[
            PrioritizeItem(
                rank=i + 1,
                name=d.name,
                priority_score=score,
                complexity=d.complexity,
                urgency=d.urgency,
                scope_score=d.scope_score,
            )
            for i, (d, score) in enumerate(ranked)
        ],
    )
