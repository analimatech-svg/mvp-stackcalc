"""
StackCalc AI — FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from .core.config import settings
from .api import sessions_router, tenants_router, analytics_router, v1_router

log = structlog.get_logger(__name__)

app = FastAPI(
    title="StackCalc AI",
    description="Technical intelligence platform for software project estimation.",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(sessions_router)
app.include_router(tenants_router)
app.include_router(analytics_router)
app.include_router(v1_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.on_event("startup")
async def startup():
    log.info("stackcalc_startup", env=settings.llm_mode)
