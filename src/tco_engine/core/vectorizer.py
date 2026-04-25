# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Juan Pablo Chancay
"""
Vectorizer φ: Artifact → V ∈ [0,1]¹¹

Combines static analysis (radon + bandit) with LLM semantic evaluation
(QAEvaluator) to produce the 11-dimension evaluation vector.

Dimension sources:
  v1  functional_correctness   — LLM (test_pass_rate)
  v2  architectural_alignment  — LLM (pattern_compliance)
  v3  scalability_projection   — LLM (scalability_score)
  v4  security_risk            — Bandit (inverted: 1 - weighted_severity)
  v5  observability_coverage   — Radon (log_coverage)
  v6  testability              — Radon (inverted cyclomatic_complexity)
  v7  maintainability          — Radon (inverted halstead_volume)
  v8  technical_debt           — Radon (inverted debt_ratio)
  v9  performance              — LLM (performance_score)
  v10 confidence               — consensus(static, llm)
  v11 anomaly_score            — Z-score vs historical baseline (inverted)
"""
from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING

import numpy as np

from tco_engine.core.qa_evaluator import EvaluationMetrics, QAEvaluator
from tco_engine.db.cache import ArtifactCache
from tco_engine.schemas.vector import EvaluationVector
from tco_engine.static_analysis.bandit_runner import BanditRunner, SecurityMetrics
from tco_engine.static_analysis.radon_runner import RadonMetrics, RadonRunner

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


@dataclass
class Artifact:
    artifact_id: str
    agent_id: str
    stage: str
    cycle_k: int
    code: str
    artifact_type: str = "python_code"
    context: str = ""

    def content_hash(self) -> str:
        return hashlib.sha256(self.code.encode()).hexdigest()


@dataclass
class HistoricalBaseline:
    mean: np.ndarray  # shape (11,)
    std: np.ndarray   # shape (11,)


class Vectorizer:
    """φ: Artifact → V ∈ [0,1]¹¹"""

    def __init__(self, model: str = "claude-sonnet-4-6"):
        self._radon = RadonRunner()
        self._bandit = BanditRunner()
        self._qa = QAEvaluator(model=model)
        self._cache = ArtifactCache()

    def vectorize(
        self,
        artifact: Artifact,
        baseline: HistoricalBaseline | None = None,
    ) -> EvaluationVector:
        cached = self._cache.get(artifact.code)
        if cached:
            logger.debug("Cache hit for artifact %s", artifact.artifact_id)
            return EvaluationVector(**cached)

        radon_m = self._radon.analyze(artifact.code)
        bandit_m = self._bandit.scan(artifact.code)
        llm_m = self._qa.evaluate(
            artifact_content=artifact.code,
            artifact_type=artifact.artifact_type,  # type: ignore[arg-type]
            context=artifact.context,
        )

        confidence = self._compute_consensus(radon_m, llm_m)
        anomaly = self._compute_anomaly(artifact, baseline)

        vector = EvaluationVector(
            functional_correctness=_clip(llm_m.test_pass_rate),
            architectural_alignment=_clip(llm_m.pattern_compliance),
            scalability_projection=_clip(llm_m.scalability_score),
            security_risk=_clip(1.0 - bandit_m.weighted_severity),
            observability_coverage=_clip(radon_m.log_coverage),
            testability=_clip(1.0 - radon_m.cyclomatic_complexity),
            maintainability=_clip(1.0 - radon_m.halstead_volume),
            technical_debt=_clip(1.0 - radon_m.debt_ratio),
            performance=_clip(llm_m.performance_score),
            confidence=_clip(confidence),
            anomaly_score=_clip(1.0 - anomaly),
        )

        self._cache.set(artifact.code, vector.model_dump())
        logger.info(
            "Vectorized %s: fc=%.2f aa=%.2f sec=%.2f conf=%.2f",
            artifact.artifact_id,
            vector.functional_correctness,
            vector.architectural_alignment,
            vector.security_risk,
            vector.confidence,
        )
        return vector

    def _compute_consensus(
        self, static: RadonMetrics, llm: EvaluationMetrics
    ) -> float:
        """
        Inter-rater agreement between static analysis and LLM-QA on dimensions
        that both tools can independently estimate.

        High agreement (low mean absolute difference) → high confidence.
        Validation target: Spearman ρ ≥ 0.75 before pilot (DT-002).
        """
        pairs = [
            (static.functional_correctness, llm.functional_correctness),
            (static.maintainability, llm.semantic_maintainability),
            (static.testability, llm.semantic_testability),
        ]
        diffs = [abs(s - l) for s, l in pairs]
        return float(1.0 - np.mean(diffs))

    def _compute_anomaly(
        self, artifact: Artifact, baseline: HistoricalBaseline | None
    ) -> float:
        """
        Z-score of the current artifact's raw metrics vs historical baseline.
        Returns 0.0 when no baseline exists (first cycle).
        Returns [0,1] where 1 = maximum anomaly (3+ standard deviations away).
        """
        if baseline is None:
            return 0.0

        radon_m = self._radon.analyze(artifact.code)
        current = np.array([
            radon_m.cyclomatic_complexity,
            radon_m.halstead_volume,
            radon_m.debt_ratio,
            radon_m.log_coverage,
            radon_m.maintainability,
        ])

        if current.shape != baseline.mean.shape:
            return 0.0

        z_scores = np.abs((current - baseline.mean) / (baseline.std + 1e-8))
        # Clip at 3σ and normalise to [0,1]
        return float(np.clip(np.mean(z_scores) / 3.0, 0.0, 1.0))


def _clip(value: float) -> float:
    return float(max(0.0, min(1.0, value)))
