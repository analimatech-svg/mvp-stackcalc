"""
Artifact generator — creates structured artifacts triggered by session state.
Supported types: checklist, scorecard, calculator_ab, rfc, onepage, email, slack, variance.
"""
import uuid
from dataclasses import dataclass
from typing import Any


class ArtifactType:
    CHECKLIST = "checklist"
    SCORECARD = "scorecard"
    CALCULATOR_AB = "calculator_ab"
    RFC = "rfc"
    ONEPAGE = "onepage"
    EMAIL_DEFENSE = "email"
    SLACK = "slack"
    VARIANCE = "variance"


class ArtifactGenerator:
    async def generate(
        self,
        artifact_type: str,
        session_data: dict,
        agent_response: str = "",
        locale: str = "pt-BR",
    ) -> dict | None:
        handlers = {
            ArtifactType.CHECKLIST: self._checklist,
            ArtifactType.SCORECARD: self._scorecard,
            ArtifactType.CALCULATOR_AB: self._calculator_ab,
            ArtifactType.RFC: self._rfc,
            ArtifactType.ONEPAGE: self._onepage,
            ArtifactType.EMAIL_DEFENSE: self._email_defense,
            ArtifactType.SLACK: self._slack,
            ArtifactType.VARIANCE: self._variance,
        }
        handler = handlers.get(artifact_type)
        if not handler:
            return None
        return await handler(session_data, agent_response, locale)

    async def _checklist(self, session_data: dict, response: str, locale: str) -> dict:
        scope = session_data.get("scope_data", {})
        labels = {
            "pt-BR": {
                "title": "Checklist de Escopo",
                "dimensions": ["Objetivo", "Usuários", "Integrações", "Premissas", "Riscos"],
            },
            "en": {
                "title": "Scope Checklist",
                "dimensions": ["Objective", "Users", "Integrations", "Assumptions", "Risks"],
            },
            "es": {
                "title": "Checklist de Alcance",
                "dimensions": ["Objetivo", "Usuarios", "Integraciones", "Supuestos", "Riesgos"],
            },
        }.get(locale, {
            "title": "Checklist de Escopo",
            "dimensions": ["Objetivo", "Usuários", "Integrações", "Premissas", "Riscos"],
        })

        keys = ["objective", "users", "integrations", "assumptions", "risks"]
        items = [
            {"dimension": labels["dimensions"][i], "filled": bool(scope.get(k)), "value": scope.get(k, "")}
            for i, k in enumerate(keys)
        ]
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.CHECKLIST,
            "title": labels["title"],
            "content": {"items": items, "completeness": sum(1 for i in items if i["filled"]) / 5},
        }

    async def _scorecard(self, session_data: dict, response: str, locale: str) -> dict:
        estimate = session_data.get("estimate_data", {})
        from .calculator import CRITERIA_WEIGHTS
        criteria_labels = {
            "pt-BR": {
                "architecture": "Arquitetura",
                "database": "Banco de Dados",
                "integrations": "Integrações",
                "testing": "Testes",
                "security": "Segurança",
                "team_deadline": "Time e Prazo",
            },
        }.get(locale, {
            "architecture": "Architecture",
            "database": "Database",
            "integrations": "Integrations",
            "testing": "Testing",
            "security": "Security",
            "team_deadline": "Team & Deadline",
        })
        rows = [
            {
                "criterion": criteria_labels.get(k, k),
                "score": estimate.get(k, 0),
                "weight": round(w * 100, 0),
                "weighted": round(estimate.get(k, 0) * w, 1),
            }
            for k, w in CRITERIA_WEIGHTS.items()
        ]
        total = sum(r["weighted"] for r in rows)
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.SCORECARD,
            "title": "Score Card de Complexidade" if locale == "pt-BR" else "Complexity Score Card",
            "content": {
                "rows": rows,
                "total_score": round(total, 2),
                "level": session_data.get("complexity_lvl", ""),
            },
        }

    async def _calculator_ab(self, session_data: dict, response: str, locale: str) -> dict:
        from .calculator import calculate_from_dict
        estimate = session_data.get("estimate_data", {})
        if not estimate:
            return None
        result = calculate_from_dict(estimate)
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.CALCULATOR_AB,
            "title": "Calculadora A/B" if locale == "pt-BR" else "A/B Calculator",
            "content": {
                "score_pct": result.score_pct,
                "level": result.level,
                "scenario_a": {
                    "dev": result.scenario_a.dev,
                    "doc": result.scenario_a.doc,
                    "mgmt": result.scenario_a.mgmt_contingency,
                    "total": result.scenario_a.total,
                    "days": result.scenario_a.working_days,
                },
                "scenario_b": {
                    "dev": result.scenario_b.dev,
                    "doc": result.scenario_b.doc,
                    "mgmt": result.scenario_b.mgmt_contingency,
                    "total": result.scenario_b.total,
                    "days": result.scenario_b.working_days,
                },
                "explanation": result.explanation,
            },
        }

    async def _rfc(self, session_data: dict, response: str, locale: str) -> dict:
        title = session_data.get("title", "Demanda sem título")
        scope = session_data.get("scope_data", {})
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.RFC,
            "title": f"RFC — {title}",
            "content": {
                "demand_title": title,
                "objective": scope.get("objective", ""),
                "users": scope.get("users", ""),
                "integrations": scope.get("integrations", ""),
                "assumptions": scope.get("assumptions", ""),
                "risks": scope.get("risks", ""),
                "complexity_pct": session_data.get("complexity_pct"),
                "complexity_lvl": session_data.get("complexity_lvl"),
                "agent_analysis": response[:2000],
            },
        }

    async def _onepage(self, session_data: dict, response: str, locale: str) -> dict:
        title = session_data.get("title", "Demanda")
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.ONEPAGE,
            "title": f"One Page Executiva — {title}",
            "content": {
                "demand_title": title,
                "complexity_pct": session_data.get("complexity_pct"),
                "complexity_lvl": session_data.get("complexity_lvl"),
                "executive_summary": response[:1000],
                "scenario_a_days": session_data.get("estimate_data", {}).get("scenario_a_days"),
                "scenario_b_days": session_data.get("estimate_data", {}).get("scenario_b_days"),
            },
        }

    async def _email_defense(self, session_data: dict, response: str, locale: str) -> dict:
        title = session_data.get("title", "Demanda")
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.EMAIL_DEFENSE,
            "title": f"Email de Defesa — {title}",
            "content": {
                "subject": f"Estimativa técnica: {title}",
                "body": response[:2000],
                "complexity_pct": session_data.get("complexity_pct"),
            },
        }

    async def _slack(self, session_data: dict, response: str, locale: str) -> dict:
        title = session_data.get("title", "Demanda")
        lvl = session_data.get("complexity_lvl", "?")
        pct = session_data.get("complexity_pct", "?")
        msg = f"[StackCalc] {title} → Complexidade {lvl} ({pct}%). {response[:150]}"
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.SLACK,
            "title": "Mensagem Slack",
            "content": {"message": msg[:280]},
        }

    async def _variance(self, session_data: dict, response: str, locale: str) -> dict:
        validate = session_data.get("validate_data", {})
        return {
            "id": str(uuid.uuid4()),
            "type": ArtifactType.VARIANCE,
            "title": "Relatório de Variância",
            "content": {
                "estimated_hours": validate.get("estimated_hours"),
                "actual_hours": validate.get("actual_hours"),
                "variance_pct": validate.get("variance_pct"),
                "root_cause": validate.get("root_cause", ""),
                "learnings": validate.get("learnings", ""),
                "agent_narrative": response[:1500],
            },
        }
