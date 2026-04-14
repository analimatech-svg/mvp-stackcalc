"""
StackCalc Agent — state machine + LLM orchestration.
Manages session phases (qualify → estimate → defend → validate),
detects artifact triggers and yields SSE events.
"""
import json
from typing import AsyncGenerator, Any
from dataclasses import asdict

from .llm_router import LLMRouter
from .prompts import build_system_prompt
from .calculator import calculate_from_dict, ComplexityLevel
from .artifacts import ArtifactGenerator, ArtifactType

# Minimum dimensions filled before advancing to estimate
QUALIFY_MIN_DIMENSIONS = 3
ESTIMATE_CRITERIA_REQUIRED = 6

PHASE_ORDER = ["qualify", "estimate", "defend", "validate"]


class StackCalcAgent:
    def __init__(
        self,
        tenant_id: str,
        llm_config: dict | None = None,
        locale: str = "pt-BR",
    ):
        self.tenant_id = tenant_id
        self.router = LLMRouter(tenant_llm_config=llm_config, tenant_id=tenant_id)
        self.locale = locale
        self.artifact_gen = ArtifactGenerator()

    def _build_demand_context(self, session_data: dict) -> str:
        """Serialize session data to a concise context string for the prompt."""
        parts = []
        phase = session_data.get("phase", "qualify")
        parts.append(f"FASE ATUAL: {phase.upper()}")

        scope = session_data.get("scope_data", {})
        if scope:
            parts.append(f"ESCOPO MAPEADO:\n{json.dumps(scope, ensure_ascii=False, indent=2)}")

        estimate = session_data.get("estimate_data", {})
        if estimate:
            parts.append(f"DADOS DE ESTIMATIVA:\n{json.dumps(estimate, ensure_ascii=False, indent=2)}")

        if session_data.get("complexity_pct") is not None:
            parts.append(
                f"SCORE DE COMPLEXIDADE: {session_data['complexity_pct']}% "
                f"({session_data.get('complexity_lvl', '')})"
            )

        # Last 6 messages for context window efficiency
        messages = session_data.get("messages", [])
        if messages:
            recent = messages[-6:]
            history = "\n".join(
                f"[{m['role'].upper()}] {m['content'][:300]}" for m in recent
            )
            parts.append(f"MENSAGENS RECENTES:\n{history}")

        return "\n\n".join(parts)

    def _detect_artifact_triggers(
        self, session_data: dict, new_message: str
    ) -> list[str]:
        """Return list of artifact types that should be triggered."""
        triggers = []
        scope = session_data.get("scope_data", {})
        estimate = session_data.get("estimate_data", {})
        phase = session_data.get("phase", "qualify")
        stakeholder_role = session_data.get("defend_data", {}).get("stakeholder_role", "")
        complexity_lvl = session_data.get("complexity_lvl")

        filled_dimensions = sum(
            1 for k in ("objective", "users", "integrations", "assumptions", "risks")
            if scope.get(k)
        )
        if filled_dimensions >= 5 and "checklist" not in _artifact_types_present(session_data):
            triggers.append(ArtifactType.CHECKLIST)

        filled_criteria = sum(
            1 for k in ("architecture", "database", "integrations", "testing", "security", "team_deadline")
            if estimate.get(k) is not None
        )
        if filled_criteria >= 6 and "scorecard" not in _artifact_types_present(session_data):
            triggers.append(ArtifactType.SCORECARD)

        if session_data.get("complexity_pct") is not None and "calculator_ab" not in _artifact_types_present(session_data):
            triggers.append(ArtifactType.CALCULATOR_AB)

        if complexity_lvl in (ComplexityLevel.ALTA, ComplexityLevel.MUITO_ALTA) \
                and phase in ("estimate", "defend") \
                and "rfc" not in _artifact_types_present(session_data):
            triggers.append(ArtifactType.RFC)

        if phase == "defend":
            if stakeholder_role in ("c_level", "director") and "onepage" not in _artifact_types_present(session_data):
                triggers.append(ArtifactType.ONEPAGE)
            elif stakeholder_role in ("manager", "pm", "po") and "email" not in _artifact_types_present(session_data):
                triggers.append(ArtifactType.EMAIL_DEFENSE)

        return triggers

    async def chat(
        self,
        message: str,
        session_data: dict,
        company_context: str = "",
    ) -> AsyncGenerator[dict, None]:
        """
        Main entry point. Yields SSE dicts:
          token, phase_update, artifact_ready, usage, done, error
        """
        demand_context = self._build_demand_context(session_data)
        system = build_system_prompt(
            locale=self.locale,
            company_context=company_context,
            demand_context=demand_context,
        )

        messages_history = session_data.get("messages", [])
        llm_messages = [{"role": "system", "content": system}]

        # Include recent conversation history (last 10 turns)
        for msg in messages_history[-10:]:
            llm_messages.append({"role": msg["role"], "content": msg["content"]})

        llm_messages.append({"role": "user", "content": message})

        # Stream tokens
        full_response = ""
        usage_data = None
        error_occurred = False

        async for event in self.router.complete(llm_messages, stream=True):
            if event["type"] == "token":
                full_response += event["content"]
                yield event
            elif event["type"] == "usage":
                usage_data = event
            elif event["type"] == "error":
                yield event
                error_occurred = True
                return

        if error_occurred:
            return

        # Detect phase completeness and emit phase_update
        updated_session = dict(session_data)
        updated_session = _update_session_from_response(updated_session, message, full_response)
        completeness = _calc_phase_completeness(updated_session)

        yield {
            "type": "phase_update",
            "phase": updated_session.get("phase", "qualify"),
            "completeness": round(completeness, 2),
        }

        # Detect and generate artifacts
        triggers = self._detect_artifact_triggers(updated_session, full_response)
        for artifact_type in triggers:
            artifact = await self.artifact_gen.generate(
                artifact_type=artifact_type,
                session_data=updated_session,
                agent_response=full_response,
                locale=self.locale,
            )
            if artifact:
                yield {
                    "type": "artifact_ready",
                    "artifact_type": artifact_type,
                    "artifact_id": artifact.get("id", ""),
                    "artifact": artifact,
                }

        # Final done event
        yield {
            "type": "done",
            "session_state": {
                "phase": updated_session.get("phase"),
                "complexity_pct": updated_session.get("complexity_pct"),
                "complexity_lvl": updated_session.get("complexity_lvl"),
                "scope_completeness": completeness,
            },
            "usage": usage_data,
        }


def _artifact_types_present(session_data: dict) -> list[str]:
    return [a.get("type", "") for a in session_data.get("artifacts", [])]


def _update_session_from_response(session_data: dict, user_msg: str, agent_response: str) -> dict:
    """
    Lightweight heuristic to update session state from conversation content.
    A full implementation would parse structured JSON from the agent or use
    a separate extraction pass. Here we track dimension keywords.
    """
    scope = dict(session_data.get("scope_data", {}))

    kw_map = {
        "objective": ["objetivo", "problema", "resolve", "finalidade", "goal", "objetivo"],
        "users": ["usuário", "usuários", "volume", "user", "users", "audience"],
        "integrations": ["integração", "api", "sistema externo", "integration"],
        "assumptions": ["premissa", "assumindo", "assumption"],
        "risks": ["risco", "risk", "pode dar errado"],
    }
    lower_msg = (user_msg + " " + agent_response).lower()
    for dim, keywords in kw_map.items():
        if not scope.get(dim) and any(kw in lower_msg for kw in keywords):
            scope[dim] = True  # mark as mentioned; real impl would extract value

    session_data["scope_data"] = scope
    return session_data


def _calc_phase_completeness(session_data: dict) -> float:
    phase = session_data.get("phase", "qualify")
    if phase == "qualify":
        scope = session_data.get("scope_data", {})
        filled = sum(
            1 for k in ("objective", "users", "integrations", "assumptions", "risks")
            if scope.get(k)
        )
        return filled / 5
    if phase == "estimate":
        estimate = session_data.get("estimate_data", {})
        filled = sum(
            1 for k in ("architecture", "database", "integrations", "testing", "security", "team_deadline")
            if estimate.get(k) is not None
        )
        return filled / 6
    return 1.0
