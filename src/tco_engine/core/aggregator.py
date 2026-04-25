# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Juan Pablo Chancay
"""
TensorAggregator f: {V_{d,i,j,k}} → T ∈ ℝ^(n×s×a×t)

Dimensions:
  n = 11  (quality dimensions)
  s = 4   (pipeline stages: design, build, test, deploy)
  a = N   (number of agents, dynamic)
  t = K   (cycle count, dynamic)
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from tco_engine.schemas.vector import EvaluationVector

STAGES = ["design", "build", "test", "deploy"]
N_DIMS = 11
DIM_NAMES = [
    "functional_correctness", "architectural_alignment", "scalability_projection",
    "security_risk", "observability_coverage", "testability", "maintainability",
    "technical_debt", "performance", "confidence", "anomaly_score",
]
STAGE_INDEX = {s: i for i, s in enumerate(STAGES)}


@dataclass
class VectorEntry:
    vector: EvaluationVector
    stage_idx: int
    agent_idx: int
    time_idx: int


class TensorAggregator:
    """f: {V_entries} → T ∈ ℝ^(11 × s × a × t)"""

    def aggregate(self, entries: list[VectorEntry]) -> np.ndarray:
        if not entries:
            return np.zeros((N_DIMS, len(STAGES), 1, 1))

        n_stages = len(STAGES)
        n_agents = max(e.agent_idx for e in entries) + 1
        n_time = max(e.time_idx for e in entries) + 1

        T = np.full((N_DIMS, n_stages, n_agents, n_time), np.nan)

        for e in entries:
            vals = e.vector.to_list()
            i, j, k = e.stage_idx, e.agent_idx, e.time_idx
            existing = T[:, i, j, k]
            if np.all(np.isnan(existing)):
                T[:, i, j, k] = vals
            else:
                # Average multiple vectors at the same tensor position
                T[:, i, j, k] = (existing + np.array(vals)) / 2.0

        return T

    def slice(
        self,
        T: np.ndarray,
        d: int | None = None,
        i: int | None = None,
        j: int | None = None,
        k: int | None = None,
    ) -> np.ndarray:
        """Named tensor slicing — None means 'all' on that axis."""
        idx = [
            d if d is not None else slice(None),
            i if i is not None else slice(None),
            j if j is not None else slice(None),
            k if k is not None else slice(None),
        ]
        return T[idx[0], idx[1], idx[2], idx[3]]

    def current_snapshot(self, T: np.ndarray) -> np.ndarray:
        """T[:, :, :, -1] — latest cycle across all dimensions, stages, agents."""
        return T[:, :, :, -1]

    def dimension_trajectory(self, T: np.ndarray, dim: int) -> np.ndarray:
        """T[dim, :, :, :] — full time series for one quality dimension."""
        return T[dim, :, :, :]

    def stage_profile(self, T: np.ndarray, stage: str) -> np.ndarray:
        """T[:, stage_idx, :, -1] — current snapshot for one stage."""
        i = STAGE_INDEX.get(stage, 0)
        return T[:, i, :, -1]
