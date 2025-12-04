"""Task Management Team Supervisor."""

from __future__ import annotations

import json
import re
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from langchain_core.messages import HumanMessage, AIMessage

from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

TEAM_NAME = "task_management"
DEFAULT_USER = "00000000-0000-0000-0000-000000000001"
CONTEXT_KEY = "task"


def _extract_message_payload(raw: str) -> Optional[str]:
    """Pull a JSON-ish payload from tool result strings."""
    if not raw:
        return None
    if isinstance(raw, str):
        m = re.search(r"message='([^']+)'", raw)
        if m:
            return m.group(1)
        return raw
    try:
        return json.dumps(raw)
    except Exception:
        return str(raw)


def _format_task_result(last_result: Optional[str]) -> str:
    if not last_result:
        return "Task completed."

    payload = _extract_message_payload(last_result)
    if not payload:
        return last_result

    try:
        data = json.loads(payload)
        # Unwrap common outer envelope {success, message, ...}
        if isinstance(data, dict) and "message" in data and isinstance(data["message"], str):
            try:
                inner = json.loads(data["message"])
                data = inner
            except Exception:
                pass
    except Exception:
        return last_result

    # Duplicate response shape
    if isinstance(data, dict) and data.get("duplicate"):
        existing = data.get("existing_task", {}) or {}
        title = existing.get("title", "existing task")
        status = existing.get("status", "unknown")
        due = existing.get("due_date") or "unscheduled"
        sim = int(data.get("similarity", 0) * 100)
        return f"Task already exists: {title} (status {status}, due {due}, similarity {sim}%)."

    # New task created
    task = None
    if isinstance(data, dict) and "task" in data:
        task = data.get("task")
    if task:
        title = task.get("title", "task")
        due = task.get("due_date") or "unscheduled"
        tid = task.get("id", "n/a")
        return f"Created task '{title}' (id {tid}, due {due})."

    # Search results list
    if isinstance(data, list):
        lines = []
        for t in data[:5]:
            title = t.get("title")
            status = t.get("status", "unknown")
            due = t.get("due_date") or "unscheduled"
            lines.append(f"- {title} (status {status}, due {due})")
        if lines:
            return "Latest tasks:\n" + "\n".join(lines)

    # Heuristic fallbacks
    lower = last_result.lower()
    if "duplicate" in lower:
        return "Task already exists (duplicate detected)."
    if "search_tasks" in lower:
        return "Tasks retrieved."

    return last_result


def _extract_due_phrase(message: str) -> Optional[str]:
    """Grab a simple due date phrase from the message."""
    lower = message.lower()
    if "tomorrow" in lower:
        return "tomorrow"
    if "today" in lower:
        return "today"
    if "next week" in lower:
        return "next week"
    weekday_match = re.search(r"next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)", lower)
    if weekday_match:
        return f"next {weekday_match.group(1)}"
    return None


def _clean_title(message: str) -> str:
    """Remove leading command phrases to form a concise task title."""
    cleaned = re.sub(r"^(please\s+)?(add|create|make|log)\s+(a\s+)?(task\s+)?(to\s+)?", "", message, flags=re.IGNORECASE)
    cleaned = cleaned.strip().rstrip(".")
    return cleaned or message.strip()


async def task_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Route task requests to specialized agents and return results via Sebastian."""
    logger.info("Task Supervisor activated")

    last_message = state["messages"][-1]
    if not isinstance(last_message, HumanMessage):
        logger.info("Last message is not user-authored; ending task flow without action")
        return {
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "task_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": "sebastian_supervisor",
            "handoff_reason": "task_noop",
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    # Check if task workflow is already marked complete—if so, exit immediately
    team_context = state.get("team_context", {})
    task_team_ctx = team_context.get(TEAM_NAME, {})
    if task_team_ctx.get("workflow_stage") == "complete":
        logger.info("Task workflow already marked complete; exiting to Sebastian")
        last_result = task_team_ctx.get("last_result")
        if last_result:
            summary = _format_task_result(last_result)
            return {
                "messages": [AIMessage(content=summary)],
                "current_team": None,
                "previous_team": state.get("current_team"),
                "current_agent": "task_supervisor",
                "previous_agent": state.get("current_agent"),
                "target_agent": None,
                "handoff_reason": "task_complete",
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }
        else:
            return {
                "current_team": None,
                "previous_team": state.get("current_team"),
                "current_agent": "task_supervisor",
                "previous_agent": state.get("current_agent"),
                "target_agent": "sebastian_supervisor",
                "handoff_reason": "task_flow_exit",
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }

    message_content = last_message.content if hasattr(last_message, "content") else ""
    message_lower = message_content.lower()

    agent_ctx = state.get("agent_contexts", {}).get(CONTEXT_KEY, {})
    last_result = agent_ctx.get("last_result")
    prev_agent = state.get("previous_agent")

    # If we have any result from a specialist, surface it once as an AI message and end.
    if last_result and not state.get("target_agent"):
        summary = _format_task_result(last_result)
        return {
            "messages": [AIMessage(content=summary)],
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "task_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": None,
            "handoff_reason": "task_complete",
            "team_context": {
                **state.get("team_context", {}),
                TEAM_NAME: {"workflow_stage": "complete"},
            },
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    # Guard: if we just returned from task_creator and have no last_result yet, exit to Sebastian to avoid loops
    if state.get("previous_agent") == "task_creator":
        return {
            "current_team": None,
            "previous_team": state.get("current_team"),
            "current_agent": "task_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": "sebastian_supervisor",
            "handoff_reason": "task_flow_exit",
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    # Route to the right task agent
    if any(kw in message_lower for kw in ["find", "show", "search", "list", "last task", "last tasks", "recent tasks"]):
        target = "task_retriever"
    elif any(kw in message_lower for kw in ["create", "add", "new task", "subtask", "make a task", "add a task"]):
        target = "task_creator"
    elif any(kw in message_lower for kw in ["update", "edit", "change", "modify", "tag", "priority", "due", "status", "move"]):
        target = "task_editor"
    elif any(kw in message_lower for kw in ["delete", "remove", "archive", "trash"]):
        target = "task_deleter"
    else:
        target = "task_creator"

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
        "current_agent": "task_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": target,
        "team_context": team_context,
    }
