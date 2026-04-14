from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import Tenant
from ..schemas.tenant import TenantRead, LLMConfigUpdate, WhiteLabelUpdate
from ..core.llm_router import encrypt_api_key
from .deps import get_current_tenant, require_admin

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


@router.get("/me", response_model=TenantRead)
async def get_my_tenant(tenant: Tenant = Depends(get_current_tenant)):
    return tenant


@router.patch("/me/llm-config")
async def update_llm_config(
    body: LLMConfigUpdate,
    tenant: Tenant = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    cfg = dict(tenant.llm_config or {})
    cfg["mode"] = body.mode
    cfg["provider"] = body.provider
    cfg["model"] = body.model
    cfg["max_tokens"] = body.max_tokens
    cfg["temperature"] = body.temperature
    if body.base_url:
        cfg["base_url"] = body.base_url
    if body.api_key:
        cfg["api_key"] = encrypt_api_key(body.api_key)
    tenant.llm_config = cfg
    db.add(tenant)
    await db.commit()
    return {"status": "updated", "mode": body.mode}


@router.patch("/me/white-label")
async def update_white_label(
    body: WhiteLabelUpdate,
    tenant: Tenant = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    wl = dict(tenant.white_label or {})
    for field, value in body.model_dump(exclude_none=True).items():
        wl[field] = value
    tenant.white_label = wl
    db.add(tenant)
    await db.commit()
    return {"status": "updated"}
