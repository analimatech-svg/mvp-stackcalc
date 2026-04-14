from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "member"
    supabase_uid: Optional[str] = None


class UserRead(BaseModel):
    id: str
    tenant_id: str
    full_name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
