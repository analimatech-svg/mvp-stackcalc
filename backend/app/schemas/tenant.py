from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LLMConfigUpdate(BaseModel):
    mode: str = Field(..., pattern="^(byok|byom|onpremise)$")
    provider: Optional[str] = "anthropic"
    api_key: Optional[str] = None   # plain — will be encrypted at save
    model: Optional[str] = None
    base_url: Optional[str] = None  # for byom
    max_tokens: Optional[int] = 4096
    temperature: Optional[float] = 0.3


class WhiteLabelUpdate(BaseModel):
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    custom_domain: Optional[str] = None
    product_name: Optional[str] = None
    sender_email: Optional[str] = None
    custom_tos_url: Optional[str] = None
    hide_powered_by: Optional[bool] = False


class TenantCreate(BaseModel):
    name: str
    slug: str
    plan: str = Field(..., pattern="^(saas_seat|annual|whitelabel|api)$")
    seat_limit: Optional[int] = None


class TenantRead(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    seat_limit: Optional[int]
    active: bool
    white_label: dict
    created_at: datetime

    class Config:
        from_attributes = True
