"""Event Creation Agent - Creates single and recurring events with conflict checks."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict

from agents.agent_registry import get_agent_config, get_agent_tools
from agents.base import create_internal_response, load_system_prompt
from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("event_creator")
AGENT_PROMPT = load_system_prompt(
    "event_creator",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("event_creator")
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


async def event_creator_node(state: MultiAgentState) -> Dict[str, Any]:
    """Create events/series via tools, then hand back to supervisor."""
    logger.info("Event Creator activated")
    try:
        # Get last message for context
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        tools = {t.name: t for t in AGENT_TOOLS}
        create = tools.get("create_event")

        def _default_window(text: str) -> tuple[str, str]:
            now = datetime.utcnow()
            if "next week" in text.lower():
                start = now + timedelta(days=7)
            elif "tomorrow" in text.lower():
                start = now + timedelta(days=1)
            else:
                start = now + timedelta(days=1)
            start = start.replace(hour=15, minute=0, second=0, microsecond=0)
            end = start + timedelta(hours=1)
            return start.isoformat(), end.isoformat()

        start, end = _default_window(request)

        if create:
            result = await create.ainvoke(
                {
                    "user_id": state.get("user_id"),
                    "title": request.strip().rstrip("."),
                    "start_time": start,
                    "end_time": end,
                    "description": request,
                    "location": None,
                }
            )
            response_content = _to_json_string(result)
        else:
            response_content = "No create_event tool available"

        # Internal-only response mirroring task_creator pattern
        return create_internal_response(
            state=state,
            agent_name="event_creator",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team=state.get("current_team", "event_management"),
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    state.get("current_team", "event_management"): {
                        "last_result": response_content,
                        "target_agent": None,
                        "workflow_stage": "complete",
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Event Creator: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="event_creator",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team=state.get("current_team", "unknown"),
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    state.get("current_team", "event_management"): {
                        "last_result": f"ERROR: {str(e)[:100]}",
                        "target_agent": None,
                        "workflow_stage": "complete",
                    },
                },
            },
        )
