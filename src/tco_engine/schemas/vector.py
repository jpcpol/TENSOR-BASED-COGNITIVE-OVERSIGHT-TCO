from pydantic import BaseModel, Field, model_validator
from typing import Annotated

Normalized = Annotated[float, Field(ge=0.0, le=1.0)]


class EvaluationVector(BaseModel):
    """φ: A → V ∈ [0,1]¹¹ — 11-dimension quality vector."""
    functional_correctness:  Normalized
    architectural_alignment: Normalized
    scalability_projection:  Normalized
    security_risk:           Normalized  # inverted: 1 = no risk
    observability_coverage:  Normalized
    testability:             Normalized
    maintainability:         Normalized
    technical_debt:          Normalized  # inverted: 1 = no debt
    performance:             Normalized
    confidence:              Normalized
    anomaly_score:           Normalized  # inverted: 1 = no anomaly

    def to_list(self) -> list[float]:
        return [
            self.functional_correctness, self.architectural_alignment,
            self.scalability_projection, self.security_risk,
            self.observability_coverage, self.testability,
            self.maintainability, self.technical_debt,
            self.performance, self.confidence, self.anomaly_score,
        ]


class VectorRequest(BaseModel):
    artifact_id:   str
    agent_id:      str
    stage:         str  # design | build | test | deploy
    cycle_k:       int
    artifact_code: str
    scenario_id:   str | None = None
    participant_id: str | None = None
    session_id:    str | None = None


class VectorResponse(BaseModel):
    artifact_id: str
    agent_id:    str
    stage:       str
    cycle_k:     int
    vector:      EvaluationVector
