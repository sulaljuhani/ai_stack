"""
Lightweight in-memory metrics and rate limiting.
"""

import time
from collections import defaultdict, deque
from typing import Dict, Deque, Tuple

# Simple counters
COUNTERS: Dict[str, int] = defaultdict(int)

# Timing (store rolling durations)
DURATIONS: Dict[str, Deque[float]] = defaultdict(lambda: deque(maxlen=100))

# Rate limiting windows: action -> deque of timestamps
RATE_WINDOWS: Dict[str, Deque[float]] = defaultdict(deque)


def inc_counter(name: str, value: int = 1) -> None:
    COUNTERS[name] += value


def observe_duration(name: str, duration_seconds: float) -> None:
    DURATIONS[name].append(duration_seconds)


def get_metrics_snapshot() -> Dict[str, Dict[str, float]]:
    snapshot: Dict[str, Dict[str, float]] = {"counters": {}, "avg_durations": {}}
    for name, count in COUNTERS.items():
        snapshot["counters"][name] = count
    for name, durations in DURATIONS.items():
        if durations:
            snapshot["avg_durations"][name] = sum(durations) / len(durations)
    return snapshot


def check_rate_limit(action: str, max_calls: int, window_seconds: int) -> Tuple[bool, str]:
    """
    Sliding window rate limit.
    Returns (allowed, error_message_if_any).
    """
    now = time.time()
    window = RATE_WINDOWS[action]
    # Remove expired timestamps
    while window and window[0] < now - window_seconds:
        window.popleft()

    if len(window) >= max_calls:
        return False, f"Rate limit exceeded for {action}: {max_calls} calls per {window_seconds}s"

    window.append(now)
    return True, ""
