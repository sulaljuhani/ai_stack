"""Event Management Team Supervisor."""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from langchain_core.messages import HumanMessage, AIMessage

from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

TEAM_NAME = "event_management"
DEFAULT_USER = "00000000-0000-0000-0000-000000000001"
CONTEXT_KEY = "event"


def _format_event_result(last_result: Optional[str]) -> str:
    if not last_result:
        return "Event completed."
    try:
        import json
        payload = last_result
        if "message='" in last_result:
            m = re.search(r"message='([^']+)'", last_result)
            if m:
                payload = m.group(1)
        data = json.loads(payload)

        # Unwrap common envelopes: {success: bool, message: <json|string>}
        if isinstance(data, dict) and "message" in data and isinstance(data["message"], str):
            msg_str = data["message"]
            try:
                inner = json.loads(msg_str)
                data = inner
            except Exception:
                # fall back to plain string
                return msg_str
    except Exception:
        return last_result

    if isinstance(data, dict) and data.get("duplicate"):
        existing = data.get("existing_event", {}) or {}
        title = existing.get("title", "existing event")
        start = existing.get("start_time") or "unscheduled"
        sim = int(data.get("similarity", 0) * 100)
        return f"Event already exists: {title} on {start} (similarity {sim}%)."

    ev = None
    if isinstance(data, dict) and "event" in data:
        ev = data.get("event")
    if ev:
        title = ev.get("title", "event")
        start = ev.get("start_time") or "unscheduled"
        eid = ev.get("id", "n/a")
        return f"Created event '{title}' (id {eid}) starting {start}."

    if isinstance(data, list):
        lines = []
        for ev in data[:5]:
            title = ev.get("title")
            start = ev.get("start_time") or "unscheduled"
            lines.append(f"- {title} at {start}")
        if lines:
            return "Upcoming events:\n" + "\n".join(lines)

    return last_result


def _clean_title(message: str) -> str:
    cleaned = re.sub(r"^(please\s+)?(add|create|schedule|book|set up)\s+(an?\s+)?(event|appointment)?( to)?", "", message, flags=re.IGNORECASE)
    cleaned = cleaned.strip().rstrip(".")
    return cleaned or message.strip()


def _default_time_window(message: str) -> tuple[datetime, datetime]:
    """Return start/end datetimes with simple heuristics."""
    now = datetime.utcnow()
    if "next week" in message.lower():
        start = now + timedelta(days=7)
    elif "tomorrow" in message.lower():
        start = now + timedelta(days=1)
    else:
        start = now + timedelta(days=1)
    start = start.replace(hour=15, minute=0, second=0, microsecond=0)
    end = start + timedelta(hours=1)
    return start, end


async def event_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Route event requests to specialized agents and return results via Sebastian."""
    logger.info("Event Supervisor activated")

    last_message = state["messages"][-1]
    if not isinstance(last_message, HumanMessage):
        logger.info("Last message is not user-authored; ending event flow without action")
        return {
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "event_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": None,
            "handoff_reason": "event_noop",
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    # Check if event workflow is already marked complete—if so, exit immediately
    team_context = state.get("team_context", {})
    event_team_ctx = team_context.get("event_management", {})
    if event_team_ctx.get("workflow_stage") == "complete":
        logger.info("Event workflow already marked complete; exiting to Sebastian")
        last_result = event_team_ctx.get("last_result")
        if last_result:
            summary = _format_event_result(last_result)
            return {
                "messages": [AIMessage(content=summary)],
                "current_team": None,
                "previous_team": state.get("current_team"),
                "current_agent": "event_supervisor",
                "previous_agent": state.get("current_agent"),
                "target_agent": None,
                "handoff_reason": "event_complete",
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }
        else:
            return {
                "current_team": None,
                "previous_team": state.get("current_team"),
                "current_agent": "event_supervisor",
                "previous_agent": state.get("current_agent"),
                "target_agent": "sebastian_supervisor",
                "handoff_reason": "event_flow_exit",
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }

    # Guard: if we just returned from event_creator and have no last_result yet, exit to Sebastian to avoid loops
    if state.get("previous_agent") == "event_creator":
        return {
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "event_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": "sebastian_supervisor",
            "handoff_reason": "event_flow_exit",
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    message_content = last_message.content if hasattr(last_message, "content") else ""
    message_lower = message_content.lower()

    agent_ctx = state.get("agent_contexts", {}).get(CONTEXT_KEY, {})
    last_result = agent_ctx.get("last_result")
    if last_result and not state.get("target_agent"):
        summary = _format_event_result(last_result)
        return {
            "messages": [AIMessage(content=summary)],
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "event_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": None,
            "handoff_reason": "event_complete",
            "team_context": {
                **state.get("team_context", {}),
                TEAM_NAME: {"workflow_stage": "complete"},
            },
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    if any(kw in message_lower for kw in ["find", "show", "search", "list", "calendar", "what's on", "what is on"]):
        target = "event_retriever"
    elif any(kw in message_lower for kw in ["create", "add", "schedule", "book", "set up", "meeting", "appointment"]):
        target = "event_creator"
    elif any(kw in message_lower for kw in ["update", "edit", "change", "modify", "reschedule", "move"]):
        target = "event_editor"
    elif any(kw in message_lower for kw in ["delete", "remove", "cancel"]):
        target = "event_deleter"
    else:
        target = "event_creator"

    team_context = {
        **state.get("team_context", {}),
        TEAM_NAME: {
            "target_agent": target,
            "supervisor_decision": "keyword_match",
        },
    }

    return {
        "current_team": TEAM_NAME,
        "previous_team": state.get("current_team"),
        "current_agent": "event_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": target,
        "team_context": team_context,
    }
