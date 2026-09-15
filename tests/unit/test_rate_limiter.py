import time
import pytest
from packages.domain.agent.rate_limiter import SlidingWindowRateLimiter


def test_rate_limiter_allows_under_limit():
    """Verify rate limiter allows requests up to max_requests."""
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=2.0, enabled=True)
    ip = "192.168.1.10"

    # Request 1
    allowed, remaining, retry_after = limiter.check(ip)
    assert allowed is True
    assert remaining == 2
    assert retry_after == 0

    # Request 2
    allowed, remaining, retry_after = limiter.check(ip)
    assert allowed is True
    assert remaining == 1
    assert retry_after == 0

    # Request 3
    allowed, remaining, retry_after = limiter.check(ip)
    assert allowed is True
    assert remaining == 0
    assert retry_after == 0


def test_rate_limiter_blocks_over_limit():
    """Verify rate limiter rejects requests when limit is exceeded and provides retry_after."""
    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=5.0, enabled=True)
    ip = "10.0.0.1"

    assert limiter.check(ip)[0] is True
    assert limiter.check(ip)[0] is True

    # 3rd request should be blocked
    allowed, remaining, retry_after = limiter.check(ip)
    assert allowed is False
    assert remaining == 0
    assert retry_after > 0
    assert retry_after <= 5


def test_rate_limiter_sliding_window_replenishment():
    """Verify quota rolls over after the window expires."""
    limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=0.2, enabled=True)
    ip = "127.0.0.1"

    # First request consumes quota
    assert limiter.check(ip)[0] is True
    # Immediate second request is blocked
    assert limiter.check(ip)[0] is False

    # Wait for window to expire
    time.sleep(0.25)

    # Third request is allowed
    allowed, remaining, _ = limiter.check(ip)
    assert allowed is True
    assert remaining == 0


def test_rate_limiter_disabled():
    """Verify disabled rate limiter never blocks requests."""
    limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=10.0, enabled=False)
    ip = "10.0.0.5"

    for _ in range(10):
        allowed, remaining, _ = limiter.check(ip)
        assert allowed is True
        assert remaining > 0


def test_rate_limiter_reset():
    """Verify reset function clears tracking records."""
    limiter = SlidingWindowRateLimiter(max_requests=1, window_seconds=10.0, enabled=True)
    ip = "10.0.0.9"

    assert limiter.check(ip)[0] is True
    assert limiter.check(ip)[0] is False

    limiter.reset(ip)
    assert limiter.check(ip)[0] is True
