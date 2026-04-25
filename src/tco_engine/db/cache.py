# SPDX-License-Identifier: AGPL-3.0
# Copyright (C) 2026 Juan Pablo Chancay
"""
ArtifactCache — Redis hash cache keyed by SHA-256 of artifact content.

Identical artifact content is never re-evaluated; the cached vector is
returned directly. Estimated API cost reduction: 40–60% in repeated cycle
scenarios (DT-017). TTL policy: no TTL for artifact hash (deterministic),
30 s for tensor snapshots.
"""
import hashlib
import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

_TENSOR_TTL = 30  # seconds


def _sha256(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


class ArtifactCache:
    """Redis-backed cache for EvaluationVector objects (JSON-serialised)."""

    def __init__(self, prefix: str = "tco:artifact:"):
        self._prefix = prefix
        self._redis = self._connect()

    def _connect(self):
        try:
            import redis
            return redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", "6379")),
                db=0,
                decode_responses=True,
            )
        except Exception as exc:
            logger.warning("Redis unavailable (%s) — cache disabled", exc)
            return None

    def key_for(self, content: str) -> str:
        return f"{self._prefix}{_sha256(content)}"

    def get(self, content: str) -> Any | None:
        if self._redis is None:
            return None
        try:
            raw = self._redis.get(self.key_for(content))
            return json.loads(raw) if raw else None
        except Exception as exc:
            logger.debug("Cache get failed: %s", exc)
            return None

    def set(self, content: str, value: Any) -> None:
        if self._redis is None:
            return
        try:
            serialised = json.dumps(value) if not isinstance(value, str) else value
            self._redis.set(self.key_for(content), serialised)  # no TTL: deterministic
        except Exception as exc:
            logger.debug("Cache set failed: %s", exc)

    def set_tensor_snapshot(self, key: str, value: Any) -> None:
        if self._redis is None:
            return
        try:
            serialised = json.dumps(value) if not isinstance(value, str) else value
            self._redis.setex(f"tco:tensor:{key}", _TENSOR_TTL, serialised)
        except Exception as exc:
            logger.debug("Tensor cache set failed: %s", exc)

    def get_tensor_snapshot(self, key: str) -> Any | None:
        if self._redis is None:
            return None
        try:
            raw = self._redis.get(f"tco:tensor:{key}")
            return json.loads(raw) if raw else None
        except Exception as exc:
            logger.debug("Tensor cache get failed: %s", exc)
            return None
