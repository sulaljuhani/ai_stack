"""Event Retrieval Agent - Read-only event searches and listings."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict

from agents.agent_registry import get_agent_config, get_agent_tools
from agents.base import create_internal_response, load_system_prompt
from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("event_retriever")
AGENT_PROMPT = load_system_prompt(
    "event_retriever",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("event_retriever")
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


async def event_retriever_node(state: MultiAgentState) -> Dict[str, Any]:
    """Handle event search/list retrieval via tools, then hand back to supervisor."""
    logger.info("Event Retriever activated")
    try:
        tools = {t.name: t for t in AGENT_TOOLS}
        search = tools.get("search_events")

        def _window(text: str) -> tuple[str, str]:
            now = datetime.utcnow()
            start = now
            end = now + timedelta(days=7)
            if "next week" in text.lower():
                start = now + timedelta(days=7)
                end = start + timedelta(days=7)
            return start.isoformat(), end.isoformat()

        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
        start, end = _window(request)

        if search:
            result = await search.ainvoke(
                {
                    "user_id": state.get("user_id"),
                    "start_date": start,
                    "end_date": end,
                    "limit": 10,
                }
            )
            response_content = _to_json_string(result)
        else:
            response_content = "No search_events tool available"

        return create_internal_response(
            state=state,
            agent_name="event_retriever",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team="event_management",
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    "event_management": {
                        "last_result": response_content,
                        "target_agent": "sebastian_supervisor",
                        "workflow_stage": "complete",
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Event Retriever: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="event_retriever",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team="event_management",
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    "event_management": {
                        "last_result": f"ERROR: {str(e)[:100]}",
                        "target_agent": "sebastian_supervisor",
                        "workflow_stage": "complete",
                    },
                },
            },
        )
