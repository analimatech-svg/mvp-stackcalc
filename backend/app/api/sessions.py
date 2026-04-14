"""
Session routes — chat (SSE), CRUD, phase advance, artifacts, export.
"""
import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db import get_db
from ..models import User, Tenant, DemandSession, Artifact, LLMUsage
from ..schemas.session import (
    SessionCreate, SessionRead, ChatRequest, AdvancePhaseRequest,
    ArtifactRead, ArtifactGenerateRequest, ValidateRequest,
)
from ..core.agent import StackCalcAgent
from ..core.artifacts import ArtifactGenerator, ArtifactType
from ..core.calculator import calculate_from_dict
from .deps import get_current_user, get_current_tenant

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionRead, status_code=201)
async def create_session(
    body: SessionCreate,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    session = DemandSession(
        id=str(uuid.uuid4()),
        tenant_id=user.tenant_id,
        user_id=user.id,
        title=body.title,
        phase="qualify",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("", response_model=list[SessionRead])
async def list_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DemandSession)
        .where(DemandSession.user_id == user.id)
        .order_by(DemandSession.updated_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/{session_id}", response_model=SessionRead)
async def get_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await _get_session_or_404(session_id, user.id, db)
    return session


@router.post("/{session_id}/chat")
async def chat(
    session_id: str,
    body: ChatRequest,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    session = await _get_session_or_404(session_id, user.id, db)

    agent = StackCalcAgent(
        tenant_id=user.tenant_id,
        llm_config=tenant.llm_config,
        locale=body.locale,
    )

    # Merge incoming context into defend_data
    if body.context:
        defend = dict(session.defend_data or {})
        defend.update(body.context)
        session.defend_data = defend

    session_data = {
        "phase": session.phase,
        "title": session.title,
        "scope_data": session.scope_data,
        "estimate_data": session.estimate_data,
        "defend_data": session.defend_data,
        "validate_data": session.validate_data,
        "complexity_pct": float(session.complexity_pct) if session.complexity_pct else None,
        "complexity_lvl": session.complexity_lvl,
        "messages": session.messages or [],
        "artifacts": session.artifacts or [],
    }

    company_context = (tenant.llm_config or {}).get("company_context", "")

    async def event_stream() -> AsyncGenerator[str, None]:
        artifacts_generated = []
        usage_record = None

        async for event in agent.chat(body.message, session_data, company_context):
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

            if event["type"] == "artifact_ready":
                artifacts_generated.append(event["artifact"])
            elif event["type"] == "usage":
                usage_record = event
            elif event["type"] == "done":
                # Persist updated session
                msgs = list(session.messages or [])
                msgs.append({"role": "user", "content": body.message, "ts": datetime.now(timezone.utc).isoformat()})
                msgs.append({
                    "role": "assistant",
                    "content": "",  # full content not stored to save space
                    "phase": event["session_state"].get("phase"),
                    "ts": datetime.now(timezone.utc).isoformat(),
                })
                session.messages = msgs
                session.updated_at = datetime.now(timezone.utc)

                # Persist artifacts
                for art in artifacts_generated:
                    db_art = Artifact(
                        id=art.get("id", str(uuid.uuid4())),
                        tenant_id=user.tenant_id,
                        session_id=session_id,
                        type=art["type"],
                        content=art.get("content", {}),
                    )
                    db.add(db_art)
                    arlist = list(session.artifacts or [])
                    arlist.append({"id": db_art.id, "type": db_art.type})
                    session.artifacts = arlist

                # Persist LLM usage
                if usage_record:
                    db.add(LLMUsage(
                        id=str(uuid.uuid4()),
                        tenant_id=user.tenant_id,
                        session_id=session_id,
                        provider=usage_record.get("provider", "unknown"),
                        model=usage_record.get("model", "unknown"),
                        input_tokens=usage_record.get("input_tokens", 0),
                        output_tokens=usage_record.get("output_tokens", 0),
                        cost_usd=usage_record.get("cost_usd"),
                        latency_ms=usage_record.get("latency_ms"),
                    ))

                await db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/{session_id}/advance")
async def advance_phase(
    session_id: str,
    body: AdvancePhaseRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await _get_session_or_404(session_id, user.id, db)
    phase_order = ["qualify", "estimate", "defend", "validate"]
    current_idx = phase_order.index(session.phase)
    target_idx = phase_order.index(body.to_phase)
    if target_idx != current_idx + 1:
        raise HTTPException(400, f"Cannot advance from {session.phase} to {body.to_phase}")

    # Auto-calculate complexity when advancing to estimate→defend
    if body.to_phase == "defend" and session.estimate_data:
        result = calculate_from_dict(session.estimate_data)
        session.complexity_pct = result.score_pct
        session.complexity_lvl = result.level.value
        session.estimate_data = {
            **session.estimate_data,
            "scenario_a": {
                "total": result.scenario_a.total,
                "days": result.scenario_a.working_days,
            },
            "scenario_b": {
                "total": result.scenario_b.total,
                "days": result.scenario_b.working_days,
            },
        }

    session.phase = body.to_phase
    session.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"phase": session.phase, "complexity_pct": session.complexity_pct}


@router.get("/{session_id}/artifacts", response_model=list[ArtifactRead])
async def list_artifacts(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_session_or_404(session_id, user.id, db)
    result = await db.execute(
        select(Artifact)
        .where(Artifact.session_id == session_id)
        .order_by(Artifact.created_at)
    )
    return result.scalars().all()


@router.post("/{session_id}/artifacts/generate", response_model=ArtifactRead, status_code=201)
async def generate_artifact(
    session_id: str,
    body: ArtifactGenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await _get_session_or_404(session_id, user.id, db)
    gen = ArtifactGenerator()
    session_data = {
        "phase": session.phase,
        "title": session.title,
        "scope_data": session.scope_data,
        "estimate_data": session.estimate_data,
        "complexity_pct": float(session.complexity_pct) if session.complexity_pct else None,
        "complexity_lvl": session.complexity_lvl,
        "artifacts": session.artifacts or [],
    }
    artifact_data = await gen.generate(body.artifact_type, session_data, locale=body.locale)
    if not artifact_data:
        raise HTTPException(400, "Could not generate artifact")

    db_art = Artifact(
        id=artifact_data.get("id", str(uuid.uuid4())),
        tenant_id=user.tenant_id,
        session_id=session_id,
        type=artifact_data["type"],
        content=artifact_data.get("content", {}),
    )
    db.add(db_art)
    await db.commit()
    await db.refresh(db_art)
    return db_art


@router.post("/{session_id}/validate")
async def validate_session(
    session_id: str,
    body: ValidateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await _get_session_or_404(session_id, user.id, db)
    variance_pct = round(
        (body.actual_hours - body.estimated_hours) / body.estimated_hours * 100, 1
    ) if body.estimated_hours else 0
    session.validate_data = {
        "estimated_hours": body.estimated_hours,
        "actual_hours": body.actual_hours,
        "variance_pct": variance_pct,
        "root_cause": body.root_cause,
        "learnings": body.learnings,
    }
    session.phase = "validate"
    await db.commit()
    return {"variance_pct": variance_pct}


async def _get_session_or_404(
    session_id: str, user_id: str, db: AsyncSession
) -> DemandSession:
    result = await db.execute(
        select(DemandSession).where(
            DemandSession.id == session_id,
            DemandSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
