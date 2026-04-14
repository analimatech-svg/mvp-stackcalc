"""
StackCalc complexity score calculator.
6 criteria with weights → 0–100% score → level → scenarios A and B.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class ComplexityLevel(str, Enum):
    BAIXA = "BAIXA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"
    MUITO_ALTA = "MUITO_ALTA"


CRITERIA_WEIGHTS = {
    "architecture": 0.25,   # alto — impacts existing architecture
    "database": 0.15,       # médio — creates/alters DB structures
    "integrations": 0.25,   # alto — external APIs
    "testing": 0.10,        # médio — coverage level needed
    "security": 0.15,       # alto — auth, authorization, LGPD
    "team_deadline": 0.10,  # médio — familiarity + deadline realism
}

# Hours per complexity level (baseline for scenario A)
HOURS_BY_LEVEL = {
    ComplexityLevel.BAIXA:     {"dev": 40,  "doc": 8,   "mgmt_pct": 0.15},
    ComplexityLevel.MEDIA:     {"dev": 120, "doc": 24,  "mgmt_pct": 0.20},
    ComplexityLevel.ALTA:      {"dev": 280, "doc": 56,  "mgmt_pct": 0.25},
    ComplexityLevel.MUITO_ALTA: {"dev": 560, "doc": 112, "mgmt_pct": 0.30},
}

# Scenario B reduces scope by ~35%
SCENARIO_B_FACTOR = 0.65


@dataclass
class CriteriaScores:
    architecture: float    # 0–100
    database: float
    integrations: float
    testing: float
    security: float
    team_deadline: float


@dataclass
class HoursBreakdown:
    dev: float
    doc: float
    mgmt_contingency: float
    total: float
    working_days: float  # assuming 8h/day, 1 person


@dataclass
class CalculatorResult:
    score_pct: float          # 0.0 – 100.0
    level: ComplexityLevel
    scenario_a: HoursBreakdown
    scenario_b: HoursBreakdown
    criteria: CriteriaScores
    explanation: str


def _level_from_score(score: float) -> ComplexityLevel:
    if score <= 25:
        return ComplexityLevel.BAIXA
    if score <= 50:
        return ComplexityLevel.MEDIA
    if score <= 75:
        return ComplexityLevel.ALTA
    return ComplexityLevel.MUITO_ALTA


def _build_hours(level: ComplexityLevel, factor: float = 1.0) -> HoursBreakdown:
    base = HOURS_BY_LEVEL[level]
    dev = base["dev"] * factor
    doc = base["doc"] * factor
    mgmt = (dev + doc) * base["mgmt_pct"]
    total = dev + doc + mgmt
    return HoursBreakdown(
        dev=round(dev, 1),
        doc=round(doc, 1),
        mgmt_contingency=round(mgmt, 1),
        total=round(total, 1),
        working_days=round(total / 8, 1),
    )


def calculate(criteria: CriteriaScores) -> CalculatorResult:
    """
    Calculate complexity score, level and hour scenarios A and B.
    Each criterion value is 0–100; weighted average gives final score.
    """
    raw = {
        "architecture": criteria.architecture,
        "database": criteria.database,
        "integrations": criteria.integrations,
        "testing": criteria.testing,
        "security": criteria.security,
        "team_deadline": criteria.team_deadline,
    }
    score = sum(raw[k] * w for k, w in CRITERIA_WEIGHTS.items())
    score = round(min(max(score, 0), 100), 2)
    level = _level_from_score(score)

    scenario_a = _build_hours(level, factor=1.0)
    scenario_b = _build_hours(level, factor=SCENARIO_B_FACTOR)

    level_labels = {
        ComplexityLevel.BAIXA: "BAIXA (0–25%)",
        ComplexityLevel.MEDIA: "MÉDIA (26–50%)",
        ComplexityLevel.ALTA: "ALTA (51–75%)",
        ComplexityLevel.MUITO_ALTA: "MUITO ALTA (76–100%)",
    }
    explanation = (
        f"Score de complexidade: {score:.1f}% — Classificação: {level_labels[level]}. "
        f"Cenário A (escopo completo): {scenario_a.total:.0f}h / {scenario_a.working_days:.0f} dias. "
        f"Cenário B (escopo reduzido ~35%): {scenario_b.total:.0f}h / {scenario_b.working_days:.0f} dias."
    )
    return CalculatorResult(
        score_pct=score,
        level=level,
        scenario_a=scenario_a,
        scenario_b=scenario_b,
        criteria=criteria,
        explanation=explanation,
    )


def calculate_from_dict(data: dict) -> CalculatorResult:
    criteria = CriteriaScores(
        architecture=float(data.get("architecture", 50)),
        database=float(data.get("database", 50)),
        integrations=float(data.get("integrations", 50)),
        testing=float(data.get("testing", 50)),
        security=float(data.get("security", 50)),
        team_deadline=float(data.get("team_deadline", 50)),
    )
    return calculate(criteria)
