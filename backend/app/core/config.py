from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/stackcalc"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/stackcalc"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Security
    secret_key: str = "change-me-in-production-min-32-chars-xxxxxxxx"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24h

    # LLM defaults
    llm_mode: str = "byok"  # byok | byom | onpremise
    llm_default_provider: str = "anthropic"
    llm_default_model: str = "claude-sonnet-4-6"
    llm_default_api_key: str = ""
    llm_base_url: str = ""  # for byom/onpremise

    # Observability
    helicone_api_key: str = ""

    # App
    app_name: str = "StackCalc AI"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:3000", "https://app.stackcalc.com.br"]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
