"""Reminder Retrieval Agent - Read-only reminder searches."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict

from agents.agent_registry import get_agent_config, get_agent_tools
from agents.base import create_internal_response, load_system_prompt
from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("reminder_retriever")
AGENT_PROMPT = load_system_prompt(
    "reminder_retriever",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("reminder_retriever")
CONTEXT_KEY = AGENT_CONFIG.context_key


def _to_json_string(result: Any) -> str:
    """Convert result to JSON string, handling UUID and datetime objects."""
    import json
    from uuid import UUID
    from datetime import datetime, date

    class CustomJSONEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, UUID):
                return str(obj)
            if isinstance(obj, (datetime, date)):
                return obj.isoformat()
            return super().default(obj)

    if hasattr(result, "model_dump"):
        return json.dumps(result.model_dump(), cls=CustomJSONEncoder)
    if isinstance(result, (dict, list)):
        return json.dumps(result, cls=CustomJSONEncoder)
    return str(result)


async def reminder_retriever_node(state: MultiAgentState) -> Dict[str, Any]:
    """Handle reminder search and retrieval via tools, then hand back to supervisor."""
    logger.info("Reminder Retriever activated")
    try:
        tools = {t.name: t for t in AGENT_TOOLS}
        search = tools.get("search_reminders")

        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
        start = None
        end = None
        if "tomorrow" in request.lower():
            start_dt = (datetime.utcnow().date() + timedelta(days=1)).isoformat()
            end_dt = (datetime.utcnow().date() + timedelta(days=2)).isoformat()
            start, end = start_dt, end_dt

        if search:
            result = await search.ainvoke(
                {
                    "user_id": state.get("user_id"),
                    "status": None,
                    "priority": None,
                    "start_date": start,
                    "end_date": end,
                    "include_completed": False,
                    "limit": 10,
                }
            )
            response_content = _to_json_string(result)
        else:
            response_content = "No search_reminders tool available"

        return create_internal_response(
            state=state,
            agent_name="reminder_retriever",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team="reminder_management",
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    "reminder_management": {
                        "last_result": response_content,
                        "target_agent": None,
                        "workflow_stage": "complete",
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Reminder Retriever: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="reminder_retriever",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team="reminder_management",
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    "reminder_management": {
                        "last_result": f"ERROR: {str(e)[:100]}",
                        "target_agent": None,
                        "workflow_stage": "complete",
                    },
                },
            },
        )
