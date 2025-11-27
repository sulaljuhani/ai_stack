"""
Analyst Agent - Specialized in data analysis and reporting.
"""

from typing import Dict, Any, Optional
from datetime import datetime
from langchain_core.messages import AIMessage
from graph.state import MultiAgentState
from utils.logging import get_logger
from agents.agent_registry import get_agent_config, get_agent_tools
from .base import (
    load_system_prompt,
    create_context_message,
    create_cached_react_agent,
    detect_handoff,
)

logger = get_logger(__name__)

ANALYST_AGENT_CONFIG = get_agent_config("analyst_agent")
ANALYST_AGENT_PROMPT = load_system_prompt(
    "analyst_agent",
    prompt_file=ANALYST_AGENT_CONFIG.prompt_file,
    partial_files=ANALYST_AGENT_CONFIG.partials,
)
ANALYST_TOOLS = get_agent_tools("analyst_agent")
ANALYST_CONTEXT_KEY = ANALYST_AGENT_CONFIG.context_key

_analyst_react_agent = None


def _get_analyst_agent():
    """Get or create the analyst agent (cached)."""
    global _analyst_react_agent
    if _analyst_react_agent is None:
        _analyst_react_agent = create_cached_react_agent(
            agent_name="analyst_agent",
            tools=ANALYST_TOOLS,
            temperature=0.1, # Very low temperature for analytical precision
        )
    return _analyst_react_agent


async def analyst_agent_node(state: MultiAgentState) -> Dict[str, Any]:
    """
    Analyst Agent node for LangGraph workflow.
    Focused on data analysis and reporting.
    """
    logger.info("Analyst Agent activated")

    try:
        agent = _get_analyst_agent()
        context_message = create_context_message(state, ANALYST_CONTEXT_KEY, ANALYST_AGENT_PROMPT)
        messages_with_context = [context_message] + list(state["messages"])

        result = await agent.ainvoke(
            {"messages": messages_with_context},
            config={"recursion_limit": 60},
        )

        last_message = result["messages"][-1]
        response_content = last_message.content if hasattr(last_message, "content") else str(last_message)

        logger.info(f"Analyst Agent response: {response_content[:100]}...")

        should_handoff, target_agent, handoff_reason = await detect_handoff(
            state, "analyst_agent", response_content
        )

        agent_contexts = state.get("agent_contexts", {})
        agent_contexts[ANALYST_CONTEXT_KEY] = {
            "last_interaction": datetime.utcnow().isoformat(),
            "last_topic": response_content[:200],
        }

        updates = {
            "messages": result["messages"],
            "current_agent": "analyst_agent",
            "previous_agent": state.get("current_agent"),
            "agent_contexts": agent_contexts,
            "turn_count": state["turn_count"] + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

        if should_handoff and target_agent:
            updates["target_agent"] = target_agent
            updates["handoff_reason"] = handoff_reason
            handoff_msg = AIMessage(
                content=f"I'm transferring you to the {target_agent.replace('_', ' ').title()} who can better assist with that."
            )
            updates["messages"] = updates["messages"] + [handoff_msg]

        return updates

    except Exception as e:
        logger.error(f"Error in Analyst Agent: {e}", exc_info=True)
        error_msg = AIMessage(content="I encountered an error processing your request.")
        return {
            "messages": [error_msg],
            "current_agent": "analyst_agent",
            "turn_count": state["turn_count"] + 1,
        }
