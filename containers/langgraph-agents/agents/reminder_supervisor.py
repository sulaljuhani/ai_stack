"""Reminder Management Team Supervisor."""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any, Dict

from langchain_core.messages import HumanMessage, AIMessage

from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

TEAM_NAME = "reminder_management"
DEFAULT_USER = "00000000-0000-0000-0000-000000000001"
CONTEXT_KEY = "reminder"


def _format_reminder_result(last_result: Optional[str]) -> str:
    if not last_result:
        return "Reminder completed."
    try:
        import json
        import re
        payload = last_result
        if "message='" in last_result:
            m = re.search(r"message='([^']+)'", last_result)
            if m:
                payload = m.group(1)
        data = json.loads(payload)
        if isinstance(data, dict) and "message" in data and isinstance(data["message"], str):
            try:
                inner = json.loads(data["message"])
                data = inner
            except Exception:
                pass
    except Exception:
        return last_result

    if isinstance(data, dict):
        if data.get("success") and data.get("reminder"):
            rem = data["reminder"]
            title = rem.get("title", "reminder")
            at = rem.get("remind_at") or "unscheduled"
            rid = rem.get("id", "n/a")
            return f"Created reminder '{title}' for {at} (id {rid})."
    if isinstance(data, list):
        lines = []
        for rem in data[:5]:
            title = rem.get("title")
            at = rem.get("remind_at") or "unscheduled"
            lines.append(f"- {title} at {at}")
        if lines:
            return "Upcoming reminders:\n" + "\n".join(lines)
    return last_result


def _clean_title(message: str) -> str:
    cleaned = re.sub(r"^(please\s+)?(remind me|set a reminder|create|add|make)\s+(to\s+)?", "", message, flags=re.IGNORECASE)
    cleaned = cleaned.strip().rstrip(".")
    return cleaned or message.strip()


def _remind_at_phrase(message: str) -> str:
    lower = message.lower()
    now = datetime.utcnow()
    if "tomorrow" in lower:
        dt = now + timedelta(days=1)
        dt = dt.replace(hour=9, minute=0, second=0, microsecond=0)
        return dt.isoformat()
    if "today" in lower:
        dt = now + timedelta(hours=1)
        return dt.isoformat()
    if "next week" in lower:
        dt = now + timedelta(days=7)
        dt = dt.replace(hour=9, minute=0, second=0, microsecond=0)
        return dt.isoformat()
    return (now + timedelta(hours=1)).isoformat()


async def reminder_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Route reminder requests to specialized agents and return results via Sebastian."""
    logger.info("Reminder Supervisor activated")

    last_message = state["messages"][-1]
    if not isinstance(last_message, HumanMessage):
        logger.info("Last message is not user-authored; ending reminder flow without action")
        return {
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "reminder_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": None,
            "handoff_reason": "reminder_noop",
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    # Check if reminder workflow is already marked complete—if so, exit immediately
    team_context = state.get("team_context", {})
    reminder_team_ctx = team_context.get("reminder_management", {})
    if reminder_team_ctx.get("workflow_stage") == "complete":
        logger.info("Reminder workflow already marked complete; exiting to Sebastian")
        last_result = reminder_team_ctx.get("last_result")
        if last_result:
            summary = _format_reminder_result(last_result)
            return {
                "messages": [AIMessage(content=summary)],
                "current_team": None,
                "previous_team": state.get("current_team"),
                "current_agent": "reminder_supervisor",
                "previous_agent": state.get("current_agent"),
                "target_agent": None,
                "handoff_reason": "reminder_complete",
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }
        else:
            return {
                "current_team": None,
                "previous_team": state.get("current_team"),
                "current_agent": "reminder_supervisor",
                "previous_agent": state.get("current_agent"),
                "target_agent": "sebastian_supervisor",
                "handoff_reason": "reminder_flow_exit",
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }

    message_content = last_message.content if hasattr(last_message, "content") else ""
    message_lower = message_content.lower()

    agent_ctx = state.get("agent_contexts", {}).get(CONTEXT_KEY, {})
    last_result = agent_ctx.get("last_result")
    if last_result and not state.get("target_agent"):
        summary = _format_reminder_result(last_result)
        return {
            "messages": [AIMessage(content=summary)],
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "reminder_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": None,
            "handoff_reason": "reminder_complete",
            "team_context": {
                **state.get("team_context", {}),
                TEAM_NAME: {"workflow_stage": "complete"},
            },
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    is_query = any(
        kw in message_lower
        for kw in ["what reminders", "list reminders", "reminders i have", "what do i have", "tomorrow", "next week"]
    ) and "remind me" not in message_lower and "add" not in message_lower

    if is_query:
        target = "reminder_retriever"
    elif any(kw in message_lower for kw in ["remind me", "create", "add", "set a reminder"]):
        target = "reminder_creator"
    elif any(kw in message_lower for kw in ["update", "edit", "change", "modify", "snooze"]):
        target = "reminder_editor"
    elif any(kw in message_lower for kw in ["complete", "done", "finish", "mark complete"]):
        target = "reminder_completer"
    elif any(kw in message_lower for kw in ["delete", "remove", "cancel"]):
        target = "reminder_deleter"
    else:
        target = "reminder_creator"

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
        "current_agent": "reminder_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": target,
        "team_context": team_context,
    }
