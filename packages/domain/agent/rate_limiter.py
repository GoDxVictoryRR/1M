"""In-memory sliding-window rate limiter for TerraOps.

Protects LLM endpoints from spamming and API quota exhaustion without
requiring external services or paid infrastructure.
"""
import time
import threading
from collections import defaultdict, deque
from typing import Dict, Optional, Tuple


class SlidingWindowRateLimiter:
    """Thread-safe, in-memory sliding-window rate limiter."""

    def __init__(
        self,
        max_requests: int = 15,
        window_seconds: float = 60.0,
        enabled: bool = True,
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.enabled = enabled
        self._records: Dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> Tuple[bool, int, int]:
        """Check if request for given key is allowed under rate limit.

        Returns:
            Tuple of (allowed: bool, remaining_quota: int, retry_after_seconds: int)
        """
        if not self.enabled or self.max_requests <= 0:
            return True, 999, 0

        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            q = self._records[key]

            # Evict timestamps outside current sliding window
            while q and q[0] <= window_start:
                q.popleft()

            if len(q) < self.max_requests:
                q.append(now)
                remaining = self.max_requests - len(q)
                return True, remaining, 0
            else:
                # Limit exceeded; calculate when earliest request will roll off
                oldest = q[0]
                retry_after = max(1, int(self.window_seconds - (now - oldest) + 0.999))
                return False, 0, retry_after

    def reset(self, key: Optional[str] = None) -> None:
        """Reset rate limit history for a key or all keys."""
        with self._lock:
            if key is not None:
                self._records.pop(key, None)
            else:
                self._records.clear()


_rate_limiter: Optional[SlidingWindowRateLimiter] = None


def get_rate_limiter() -> SlidingWindowRateLimiter:
    """Return the global rate limiter instance configured from application settings."""
    global _rate_limiter
    if _rate_limiter is None:
        from apps.api.config import settings
        _rate_limiter = SlidingWindowRateLimiter(
            max_requests=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
            window_seconds=60.0,
            enabled=settings.RATE_LIMIT_ENABLED,
        )
    return _rate_limiter
