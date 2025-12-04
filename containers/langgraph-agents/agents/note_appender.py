"""Note Appender Agent - Appends or updates existing notes."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from langchain_core.messages import AIMessage

from agents.agent_registry import get_agent_config, get_agent_tools
from agents.base import (
    create_cached_react_agent,
    create_context_message,
    load_system_prompt,
)
from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("note_appender")
AGENT_PROMPT = load_system_prompt(
    "note_appender",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("note_appender")
CONTEXT_KEY = AGENT_CONFIG.context_key

_agent_instance = None


def _get_agent():
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = create_cached_react_agent(
            agent_name="note_appender",
            tools=AGENT_TOOLS,
            temperature=0.3,
        )
    return _agent_instance


async def note_appender_node(state: MultiAgentState) -> Dict[str, Any]:
    """Append/update notes then hand off to validator."""
    logger.info("Note Appender activated")
    try:
        agent = _get_agent()
        context_message = create_context_message(state, CONTEXT_KEY, AGENT_PROMPT)
        messages = [context_message] + list(state["messages"])

        result = await agent.ainvoke({"messages": messages}, config={"recursion_limit": 50})
        response = result["messages"][-1]
        response_content = response.content if hasattr(response, "content") else str(response)

        agent_contexts = state.get("agent_contexts", {})
        agent_contexts[CONTEXT_KEY] = {
            "last_interaction": datetime.utcnow().isoformat(),
            "last_topic": response_content[:200],
        }

        return {
            "messages": result["messages"],
            "current_agent": "note_appender",
            "previous_agent": state.get("current_agent"),
            "agent_contexts": agent_contexts,
            "turn_count": state["turn_count"] + 1,
            "updated_at": datetime.utcnow().isoformat(),
            "current_team": "knowledge_management",
            "target_agent": "knowledge_validator",
        }
    except Exception as e:
        logger.error("Error in Note Appender: %s", e, exc_info=True)
        error_msg = AIMessage(content="I couldn't update that note due to an error.")
        return {
            "messages": [error_msg],
            "current_agent": "note_appender",
            "previous_agent": state.get("current_agent"),
            "turn_count": state["turn_count"] + 1,
            "current_team": "knowledge_management",
        }

