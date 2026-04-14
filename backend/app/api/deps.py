"""
FastAPI dependencies: auth, tenant context, DB session.
"""
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import JWTError, jwt

from ..db import get_db, set_tenant_context
from ..models import User, Tenant
from ..core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def _decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = await _decode_jwt(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Set tenant RLS context
    await set_tenant_context(db, user.tenant_id)
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user


async def get_current_tenant(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant or not tenant.active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant inactive")
    return tenant


async def get_api_key_tenant(
    api_key: str = Security(api_key_header),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    """Validate X-API-Key and return the associated tenant (for /api/v1 routes)."""
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API key required")
    # API key format: "<tenant_slug>.<secret>" — stored hashed in tenant.llm_config
    # For MVP: accept any key matching env default; full impl hashes per-tenant
    result = await db.execute(
        select(Tenant).where(Tenant.active == True)  # noqa: E712
    )
    # Simple lookup: store api_keys in tenant.llm_config["api_keys"] list
    for tenant in result.scalars().all():
        cfg = tenant.llm_config or {}
        if api_key in (cfg.get("api_keys") or []):
            return tenant
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
