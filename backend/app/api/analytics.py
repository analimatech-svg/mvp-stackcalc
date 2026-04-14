from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..db import get_db
from ..models import DemandSession, LLMUsage, User
from ..schemas.analytics import LLMUsageRead, AnalyticsSummary
from .deps import require_admin, get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/sessions", response_model=AnalyticsSummary)
async def sessions_summary(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(
        select(func.count()).select_from(DemandSession)
        .where(DemandSession.tenant_id == user.tenant_id)
    )
    active = await db.scalar(
        select(func.count()).select_from(DemandSession)
        .where(DemandSession.tenant_id == user.tenant_id, DemandSession.status == "active")
    )
    cost = await db.scalar(
        select(func.coalesce(func.sum(LLMUsage.cost_usd), 0))
        .where(LLMUsage.tenant_id == user.tenant_id)
    )
    tokens = await db.scalar(
        select(func.coalesce(func.sum(LLMUsage.input_tokens + LLMUsage.output_tokens), 0))
        .where(LLMUsage.tenant_id == user.tenant_id)
    )
    avg_lat = await db.scalar(
        select(func.coalesce(func.avg(LLMUsage.latency_ms), 0))
        .where(LLMUsage.tenant_id == user.tenant_id)
    )
    return AnalyticsSummary(
        total_sessions=total or 0,
        active_sessions=active or 0,
        total_llm_cost_usd=float(cost or 0),
        total_tokens=int(tokens or 0),
        avg_latency_ms=float(avg_lat or 0),
    )


@router.get("/llm-usage", response_model=list[LLMUsageRead])
async def llm_usage_list(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LLMUsage)
        .where(LLMUsage.tenant_id == user.tenant_id)
        .order_by(LLMUsage.created_at.desc())
        .limit(100)
    )
    return result.scalars().all()
