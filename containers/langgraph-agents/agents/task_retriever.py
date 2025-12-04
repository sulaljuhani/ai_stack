"""Task Retrieval Agent - Read-only task searches and listings."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from langchain_core.messages import AIMessage

from agents.agent_registry import get_agent_config, get_agent_tools
from agents.base import create_internal_response, load_system_prompt
from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("task_retriever")
AGENT_PROMPT = load_system_prompt(
    "task_retriever",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("task_retriever")
CONTEXT_KEY = AGENT_CONFIG.context_key


def _to_json_string(result: Any) -> str:
    if hasattr(result, "model_dump"):
        import json
        return json.dumps(result.model_dump())
    if isinstance(result, (dict, list)):
        import json
        return json.dumps(result)
    return str(result)


async def task_retriever_node(state: MultiAgentState) -> Dict[str, Any]:
    """Handle task search/list retrieval via tools, then hand back to supervisor."""
    logger.info("Task Retriever activated")
    try:
        tools = {tool.name: tool for tool in AGENT_TOOLS}
        search = tools.get("search_tasks")
        if search:
            result = await search.ainvoke(
                {
                    "user_id": state.get("user_id"),
                    "status": None,
                    "priority": None,
                    "limit": 5,
                }
            )
            response_content = _to_json_string(result)
        else:
            response_content = "No search_tasks tool available"

        return create_internal_response(
            state=state,
            agent_name="task_retriever",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team="task_management",
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    "task_management": {
                        "last_result": response_content,
                        "target_agent": None,
                        "workflow_stage": "complete",
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Task Retriever: %s", e, exc_info=True)
        # Internal error - no visible message
        return create_internal_response(
            state=state,
            agent_name="task_retriever",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team="task_management",
            additional_state={
                "current_team": None,
                "target_agent": "sebastian_supervisor",
                "team_context": {
                    **state.get("team_context", {}),
                    "task_management": {
                        "last_result": f"ERROR: {str(e)[:100]}",
                        "target_agent": None,
                        "workflow_stage": "complete",
                    },
                },
            },
        )
