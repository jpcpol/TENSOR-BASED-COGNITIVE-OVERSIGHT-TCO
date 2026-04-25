# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Juan Pablo Chancay
"""
QA Agent — LangGraph node that evaluates all artifacts in a pipeline cycle
and returns raw EvaluationMetrics per artifact.

This agent is the *source* of the vector: its output feeds directly into
the TCO Engine vectorizer (φ). Inconsistency here contaminates both the
measurement instrument and the dependent variable simultaneously (DT-003).

Validation requirement: Spearman ρ ≥ 0.75 between this agent's semantic
scores and static analysis ground truth on v4, v6, v7, v8 before the pilot.
"""
import logging
from typing import Any

from tco_engine.core.qa_evaluator import ArtifactType, EvaluationMetrics, QAEvaluator

logger = logging.getLogger(__name__)


def _infer_type(artifact_id: str, content: str) -> ArtifactType:
    aid = artifact_id.lower()
    if aid.endswith(".py") or "python" in aid:
        return "python_code"
    if aid.endswith((".yaml", ".yml")):
        return "yaml_config"
    if aid.endswith(".md") or "arch" in aid:
        return "architecture_doc"
    if "ci" in aid or "cd" in aid or "deploy" in aid:
        return "ci_cd_config"
    return "generic"


class QAAgent:
    """
    LangGraph-compatible node: evaluates artifact quality across semantic dimensions.

    State contract (input keys consumed):
        artifacts: list[dict] with keys {id, content, stage, agent_id}
        policy_context: str | None  — active policy patch (from policy_processor)

    State contract (output keys added):
        qa_evaluations: dict[artifact_id → EvaluationMetrics]
    """

    role = "quality_evaluator"
    model = "claude-sonnet-4-6"

    def __init__(self, model: str = "claude-sonnet-4-6"):
        self._evaluator = QAEvaluator(model=model)

    def run(self, state: dict[str, Any]) -> dict[str, Any]:
        artifacts = state.get("artifacts", [])
        policy_context = state.get("policy_context", "")

        evaluations: dict[str, EvaluationMetrics] = {}
        for artifact in artifacts:
            artifact_id = artifact.get("id", "unknown")
            content = artifact.get("content", "")
            artifact_type = _infer_type(artifact_id, content)

            context = f"Stage: {artifact.get('stage', 'unknown')}."
            if policy_context:
                context += f" Active policy: {policy_context}"

            logger.info("QA evaluating artifact %s (%s)", artifact_id, artifact_type)
            metrics = self._evaluator.evaluate(
                artifact_content=content,
                artifact_type=artifact_type,
                context=context,
            )
            evaluations[artifact_id] = metrics
            logger.debug(
                "artifact=%s fc=%.2f aa=%.2f conf=%.2f",
                artifact_id,
                metrics.functional_correctness,
                metrics.architectural_alignment,
                metrics.confidence_self_assessment,
            )

        return {**state, "qa_evaluations": evaluations}
