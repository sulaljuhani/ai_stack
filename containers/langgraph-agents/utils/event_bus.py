"""
Tiny in-process event bus used for cross-cutting concerns (metrics, hooks).
"""

from collections import defaultdict
from typing import Any, Callable, Dict, List

from utils.metrics import inc_counter
from utils.logging import get_logger

logger = get_logger(__name__)

_listeners: Dict[str, List[Callable[[Any], None]]] = defaultdict(list)


def subscribe(event: str, handler: Callable[[Any], None]) -> None:
    _listeners[event].append(handler)


def publish_event(event: str, payload: Any | None = None) -> None:
    for handler in _listeners.get(event, []):
        try:
            handler(payload)
        except Exception as exc:
            logger.warning("Event handler failed for %s: %s", event, exc)
    for handler in _listeners.get("*", []):
        try:
            handler({"event": event, "payload": payload})
        except Exception as exc:
            logger.warning("Wildcard handler failed for %s: %s", event, exc)


def _metrics_listener(data: Any) -> None:
    """
    Default listener to keep lightweight counters for emitted events.
    """
    try:
        event = data.get("event") if isinstance(data, dict) and "event" in data else None
        payload = data if event is None else data.get("payload")
        event_name = event or payload.get("event") if isinstance(payload, dict) else event
    except Exception:
        event_name = None

    if event_name:
        inc_counter(f"events.{event_name}")


# Always capture events for metrics by default
subscribe("*", _metrics_listener)
