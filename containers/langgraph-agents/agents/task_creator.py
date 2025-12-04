"""Task Creation Agent - Creates tasks and subtasks."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

import re
from agents.agent_registry import get_agent_config, get_agent_tools
from agents.base import create_internal_response, load_system_prompt
from graph.state import MultiAgentState
from utils.logging import get_logger
from dateutil import parser as date_parser

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("task_creator")
AGENT_PROMPT = load_system_prompt(
    "task_creator",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("task_creator")
CONTEXT_KEY = AGENT_CONFIG.context_key


def _to_json_string(result: Any) -> str:
    if hasattr(result, "model_dump"):
        import json
        return json.dumps(result.model_dump())
    if isinstance(result, (dict, list)):
        import json
        return json.dumps(result)
    return str(result)


def _clean_title(message: str) -> str:
    cleaned = message.strip()
    cleaned = re.sub(r"^(please\s+)?(add|create|make)\s+(a\s+)?(task\s+)?(to\s+)?", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip().rstrip(".")
    if not cleaned:
        return message.strip()
    # If there's a " to " left, keep the part after to
    parts = re.split(r"\bto\b", cleaned, maxsplit=1, flags=re.IGNORECASE)
    if len(parts) == 2 and parts[1].strip():
        return parts[1].strip()
    return cleaned


def _parse_due(message: str) -> str | None:
    lower = message.lower()
    if "today" in lower or "tomorrow" in lower or "next week" in lower or "next " in lower:
        try:
            dt = date_parser.parse(message, fuzzy=True)
            return dt.isoformat()
        except Exception:
            pass
    return None


async def task_creator_node(state: MultiAgentState) -> Dict[str, Any]:
    """Create tasks/subtasks via tools, then hand back to supervisor."""
    logger.info("Task Creator activated")
    try:
        # Get last message for context
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        # CRITICAL FIX: Extract actual user request from system prompts
        # Open WebUI sends system instructions like "### Task: Generate..." with user message in chat_history
        if "### Task:" in request or "###Task:" in request:
            # Extract the last USER message from chat_history
            import re
            user_match = re.search(r'USER:\s*(.+?)(?:\n|ASSISTANT:|</chat_history>|$)', request, re.DOTALL)
            if user_match:
                extracted_request = user_match.group(1).strip()
                logger.info("Extracted user request from system prompt: '%s' (original length: %d)",
                           extracted_request[:100], len(request))
                request = extracted_request
            else:
                logger.warning("System prompt detected but no USER message found in chat_history, using full request")

        # Guard: Skip if request is clearly a system instruction, not a user task
        system_markers = ["### Output:", "JSON format:", "Generate a concise", "Generate 1-3 broad tags"]
        if any(marker in request for marker in system_markers):
            logger.warning("Request appears to be a system instruction, not a user task. Skipping creation.")
            return create_internal_response(
                state=state,
                agent_name="task_creator",
                context_key=CONTEXT_KEY,
                result_content="Skipped: system instruction detected, not a task creation request",
                team=state.get("current_team", "unknown"),
                additional_state={
                    "current_team": None,
                    "target_agent": "sebastian_supervisor",
                    "team_context": {
                        **state.get("team_context", {}),
                        state.get("current_team", "task_management"): {
                            "last_result": "No task created - system instruction",
                            "target_agent": None,
                            "workflow_stage": "complete",
                        },
                    },
                },
            )

        tools = {t.name: t for t in AGENT_TOOLS}
        create = tools.get("create_task")

        def _due_phrase(text: str) -> str | None:
            lower = text.lower()
            if "tomorrow" in lower:
                return "tomorrow"
            if "today" in lower:
                return "today"
            if "next week" in lower:
                return "next week"
            return None

        title = _clean_title(request)
        due = _parse_due(request) or _due_phrase(request)

        if create:
            result = await create.ainvoke(
                {
                    "user_id": state.get("user_id"),
                    "title": title,
                    "description": request,
                    "priority": "medium",
                    "due_date": due,
                }
            )
            response_content = _to_json_string(result)
        else:
            response_content = "No create_task tool available"

        # Internal-only response
        return create_internal_response(
            state=state,
            agent_name="task_creator",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team=state.get("current_team", "unknown"),
            additional_state={
                # Immediately hand off to Sebastian with no further team routing
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    state.get("current_team", "task_management"): {
                        "last_result": response_content,
                        "target_agent": None,
                        "workflow_stage": "complete",
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Task Creator: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="task_creator",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team=state.get("current_team", "unknown"),
        )
