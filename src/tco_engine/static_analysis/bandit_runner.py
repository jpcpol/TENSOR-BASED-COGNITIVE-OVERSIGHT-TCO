# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Juan Pablo Chancay
import json
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

SEVERITY_WEIGHTS = {"LOW": 0.2, "MEDIUM": 0.6, "HIGH": 1.0}
# 3 HIGH-severity issues → weighted_severity = 1.0
_NORMALIZATION_DENOMINATOR = 3.0


@dataclass
class SecurityMetrics:
    weighted_severity: float  # [0,1] higher = more vulnerable
    issue_count: int
    high_count: int
    medium_count: int
    low_count: int


class BanditRunner:
    """Security analysis for v4 (security_risk) using Bandit."""

    def scan(self, code: str) -> SecurityMetrics:
        if not code or not code.strip():
            return SecurityMetrics(0.0, 0, 0, 0, 0)

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, encoding="utf-8"
        ) as tmp:
            tmp.write(code)
            tmp_path = tmp.name

        try:
            import subprocess
            result = subprocess.run(
                [sys.executable, "-m", "bandit", "-f", "json", "-q", tmp_path],
                capture_output=True,
                text=True,
                timeout=30,
            )
            try:
                data = json.loads(result.stdout)
            except json.JSONDecodeError:
                return SecurityMetrics(0.0, 0, 0, 0, 0)

            results = data.get("results", [])
            counts: dict[str, int] = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
            for r in results:
                sev = r.get("issue_severity", "LOW").upper()
                counts[sev] = counts.get(sev, 0) + 1

            total = sum(counts.values())
            if total == 0:
                weighted = 0.0
            else:
                raw = sum(SEVERITY_WEIGHTS[s] * c for s, c in counts.items())
                weighted = min(1.0, raw / _NORMALIZATION_DENOMINATOR)

            return SecurityMetrics(
                weighted_severity=weighted,
                issue_count=total,
                high_count=counts["HIGH"],
                medium_count=counts["MEDIUM"],
                low_count=counts["LOW"],
            )
        finally:
            Path(tmp_path).unlink(missing_ok=True)
