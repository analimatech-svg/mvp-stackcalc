"""
LLM Router — abstracts provider via litellm.
Supports 3 modes: BYOK, BYOM (OpenAI-spec), on-premise.
API keys are stored AES-encrypted in tenant.llm_config.
"""
import json
import time
from typing import AsyncGenerator, Any
from cryptography.fernet import Fernet
import base64
import litellm
import structlog

from .config import settings

log = structlog.get_logger(__name__)

litellm.drop_params = True  # ignore unsupported params per provider


def _get_fernet() -> Fernet:
    """Derive Fernet key from SECRET_KEY (pad/truncate to 32 bytes, then base64url)."""
    raw = settings.secret_key.encode()[:32].ljust(32, b"x")
    key = base64.urlsafe_b64encode(raw)
    return Fernet(key)


def encrypt_api_key(plain: str) -> str:
    return _get_fernet().encrypt(plain.encode()).decode()


def decrypt_api_key(token: str) -> str:
    return _get_fernet().decrypt(token.encode()).decode()


class LLMConfig:
    """Resolved LLM configuration for a single request."""

    def __init__(
        self,
        model: str,
        api_key: str | None = None,
        base_url: str | None = None,
        provider: str = "anthropic",
    ):
        self.model = model
        self.api_key = api_key
        self.base_url = base_url
        self.provider = provider


def resolve_llm_config(tenant_llm_config: dict | None) -> LLMConfig:
    """
    Resolve the effective LLM config for a tenant.

    Priority:
    1. Tenant-level config (BYOK / BYOM)
    2. Environment defaults (managed key or on-premise)
    """
    cfg = tenant_llm_config or {}
    mode = cfg.get("mode") or settings.llm_mode

    if mode == "byok":
        provider = cfg.get("provider", settings.llm_default_provider)
        model = cfg.get("model", settings.llm_default_model)
        encrypted_key = cfg.get("api_key")
        if encrypted_key:
            api_key = decrypt_api_key(encrypted_key)
        else:
            api_key = settings.llm_default_api_key
        # litellm model format: "anthropic/claude-..." or "openai/gpt-4o"
        full_model = f"{provider}/{model}" if "/" not in model else model
        return LLMConfig(model=full_model, api_key=api_key, provider=provider)

    if mode == "byom":
        model = cfg.get("model", "custom-model")
        base_url = cfg.get("base_url", settings.llm_base_url)
        encrypted_key = cfg.get("api_key")
        api_key = decrypt_api_key(encrypted_key) if encrypted_key else "unused"
        return LLMConfig(
            model=f"openai/{model}",
            api_key=api_key,
            base_url=base_url,
            provider="openai",
        )

    # onpremise — use env-level base_url (e.g., ollama)
    model = cfg.get("model", "llama3.1:70b")
    return LLMConfig(
        model=f"openai/{model}",
        api_key="unused",
        base_url=settings.llm_base_url or "http://localhost:11434/v1",
        provider="openai",
    )


class LLMRouter:
    """
    Central LLM router. Wraps litellm with tenant config, Helicone headers,
    usage tracking and error handling.
    """

    def __init__(self, tenant_llm_config: dict | None = None, tenant_id: str | None = None):
        self.llm_cfg = resolve_llm_config(tenant_llm_config)
        self.tenant_id = tenant_id

    def _extra_headers(self) -> dict:
        headers = {}
        if settings.helicone_api_key:
            headers["Helicone-Auth"] = f"Bearer {settings.helicone_api_key}"
            if self.tenant_id:
                headers["Helicone-Property-TenantId"] = self.tenant_id
        return headers

    async def complete(
        self,
        messages: list[dict],
        stream: bool = True,
        max_tokens: int = 2048,
        temperature: float = 0.3,
    ) -> AsyncGenerator[dict, None]:
        """
        Yields SSE-style dicts:
          {"type": "token", "content": "..."}
          {"type": "usage", "input_tokens": N, "output_tokens": N, "cost_usd": X, "latency_ms": Y}
          {"type": "error", "message": "..."}
        """
        start = time.monotonic()
        kwargs: dict[str, Any] = dict(
            model=self.llm_cfg.model,
            messages=messages,
            stream=stream,
            max_tokens=max_tokens,
            temperature=temperature,
            extra_headers=self._extra_headers(),
        )
        if self.llm_cfg.api_key:
            kwargs["api_key"] = self.llm_cfg.api_key
        if self.llm_cfg.base_url:
            kwargs["base_url"] = self.llm_cfg.base_url

        try:
            response = await litellm.acompletion(**kwargs)
            if stream:
                async for chunk in response:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        yield {"type": "token", "content": delta.content}
                    if hasattr(chunk, "usage") and chunk.usage:
                        cost = litellm.completion_cost(completion_response=chunk)
                        yield {
                            "type": "usage",
                            "input_tokens": chunk.usage.prompt_tokens,
                            "output_tokens": chunk.usage.completion_tokens,
                            "cost_usd": round(cost, 6),
                            "latency_ms": int((time.monotonic() - start) * 1000),
                            "model": self.llm_cfg.model,
                            "provider": self.llm_cfg.provider,
                        }
            else:
                content = response.choices[0].message.content
                yield {"type": "token", "content": content}
                cost = litellm.completion_cost(completion_response=response)
                yield {
                    "type": "usage",
                    "input_tokens": response.usage.prompt_tokens,
                    "output_tokens": response.usage.completion_tokens,
                    "cost_usd": round(cost, 6),
                    "latency_ms": int((time.monotonic() - start) * 1000),
                    "model": self.llm_cfg.model,
                    "provider": self.llm_cfg.provider,
                }
        except litellm.AuthenticationError as e:
            log.error("llm_auth_error", tenant=self.tenant_id, error=str(e))
            yield {"type": "error", "code": 401, "message": "LLM authentication failed. Check API key."}
        except litellm.RateLimitError as e:
            log.warning("llm_rate_limit", tenant=self.tenant_id, error=str(e))
            yield {"type": "error", "code": 429, "message": "LLM rate limit reached. Retry later."}
        except litellm.Timeout as e:
            log.warning("llm_timeout", tenant=self.tenant_id, error=str(e))
            yield {"type": "error", "code": 408, "message": "LLM request timed out."}
        except Exception as e:
            log.error("llm_unexpected_error", tenant=self.tenant_id, error=str(e))
            yield {"type": "error", "code": 500, "message": "Unexpected LLM error."}
