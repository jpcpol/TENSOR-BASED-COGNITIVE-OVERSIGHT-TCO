# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Juan Pablo Chancay
"""
InferenceEngine I: T → {Ω, Δ, Ρ, Ξ}

  Ω (omega) — global system state: "stable" | "warning" | "critical"
  Δ (delta) — per-dimension trend: improving / degrading
  Ρ (rho)   — inter-agent conflict detection
  Ξ (xi)    — prioritised recommendations
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

import numpy as np

from tco_engine.core.aggregator import DIM_NAMES, STAGES

StateLabel = Literal["stable", "warning", "critical"]

_THRESHOLD_STABLE = 0.70
_THRESHOLD_WARNING = 0.50
_TREND_MIN_SLOPE = 0.05     # |Δ| below this is noise
_CONFLICT_THRESHOLD = 0.30  # |v_j1 - v_j2| above this is a conflict
_CONFLICT_HIGH = 0.40


@dataclass
class TrendEntry:
    dimension: str
    stage: str
    agent: str
    slope: float
    direction: Literal["improving", "degrading"]


@dataclass
class ConflictEntry:
    agents: list[str]
    stage: str
    dimension: str
    delta_score: float
    severity: Literal["high", "medium"]


@dataclass
class RecommendationEntry:
    action: str
    target: str
    estimated_impact: float
    urgency: Literal["high", "medium", "low"]


@dataclass
class InferenceResult:
    omega: StateLabel
    omega_score: float
    delta: list[TrendEntry] = field(default_factory=list)
    rho: list[ConflictEntry] = field(default_factory=list)
    xi: list[RecommendationEntry] = field(default_factory=list)


class InferenceEngine:
    """I: T → {Ω, Δ, Ρ, Ξ}"""

    def infer(self, T: np.ndarray, k_now: int) -> InferenceResult:
        omega, omega_score = self._compute_omega(T, k_now)
        delta = self._compute_delta(T, k_now)
        rho = self._compute_rho(T, k_now)
        xi = self._generate_recommendations(omega, delta, rho)
        return InferenceResult(omega, omega_score, delta, rho, xi)

    def _compute_omega(self, T: np.ndarray, k: int) -> tuple[StateLabel, float]:
        snapshot = T[:, :, :, k]
        valid = snapshot[~np.isnan(snapshot)]
        score = float(np.mean(valid)) if valid.size > 0 else 0.5

        if score >= _THRESHOLD_STABLE:
            return "stable", score
        if score >= _THRESHOLD_WARNING:
            return "warning", score
        return "critical", score

    def _compute_delta(self, T: np.ndarray, k: int) -> list[TrendEntry]:
        if k == 0:
            return []

        delta_tensor = T[:, :, :, k] - T[:, :, :, k - 1]
        n_dims, n_stages, n_agents = T.shape[:3]
        trends: list[TrendEntry] = []

        for d in range(n_dims):
            for i in range(n_stages):
                for j in range(n_agents):
                    slope = float(delta_tensor[d, i, j])
                    if np.isnan(slope) or abs(slope) < _TREND_MIN_SLOPE:
                        continue
                    trends.append(TrendEntry(
                        dimension=DIM_NAMES[d] if d < len(DIM_NAMES) else f"dim_{d}",
                        stage=STAGES[i] if i < len(STAGES) else f"stage_{i}",
                        agent=f"agent_{j}",
                        slope=slope,
                        direction="improving" if slope > 0 else "degrading",
                    ))

        return sorted(trends, key=lambda x: abs(x.slope), reverse=True)

    def _compute_rho(self, T: np.ndarray, k: int) -> list[ConflictEntry]:
        n_dims, n_stages, n_agents = T.shape[:3]
        conflicts: list[ConflictEntry] = []

        for i in range(n_stages):
            for j1 in range(n_agents):
                for j2 in range(j1 + 1, n_agents):
                    diff = np.abs(T[:, i, j1, k] - T[:, i, j2, k])
                    for d, delta_d in enumerate(diff):
                        if np.isnan(delta_d) or delta_d <= _CONFLICT_THRESHOLD:
                            continue
                        severity: Literal["high", "medium"] = (
                            "high" if delta_d > _CONFLICT_HIGH else "medium"
                        )
                        conflicts.append(ConflictEntry(
                            agents=[f"agent_{j1}", f"agent_{j2}"],
                            stage=STAGES[i] if i < len(STAGES) else f"stage_{i}",
                            dimension=DIM_NAMES[d] if d < len(DIM_NAMES) else f"dim_{d}",
                            delta_score=float(delta_d),
                            severity=severity,
                        ))

        return sorted(conflicts, key=lambda x: x.delta_score, reverse=True)

    def _generate_recommendations(
        self,
        omega: StateLabel,
        delta: list[TrendEntry],
        rho: list[ConflictEntry],
    ) -> list[RecommendationEntry]:
        recs: list[RecommendationEntry] = []

        # Top 3 degrading trends
        for trend in [t for t in delta if t.direction == "degrading"][:3]:
            urgency: Literal["high", "medium", "low"] = (
                "high" if abs(trend.slope) > 0.15 else "medium"
            )
            recs.append(RecommendationEntry(
                action=(
                    f"Address degrading {trend.dimension} in "
                    f"{trend.stage} ({trend.agent})"
                ),
                target=trend.stage,
                estimated_impact=abs(trend.slope),
                urgency=urgency,
            ))

        # Top 2 conflicts
        for conflict in rho[:2]:
            recs.append(RecommendationEntry(
                action=(
                    f"Resolve {conflict.dimension} conflict between "
                    f"{conflict.agents[0]} and {conflict.agents[1]} "
                    f"at {conflict.stage} stage"
                ),
                target=conflict.stage,
                estimated_impact=conflict.delta_score,
                urgency=conflict.severity,
            ))

        if omega == "critical" and not recs:
            recs.append(RecommendationEntry(
                action="System in critical state — review all agent outputs immediately",
                target="all",
                estimated_impact=1.0,
                urgency="high",
            ))

        return sorted(recs, key=lambda x: x.estimated_impact, reverse=True)
