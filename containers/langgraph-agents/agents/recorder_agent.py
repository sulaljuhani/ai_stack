"""
Recorder Agent - Specialized in logging life events (health, cycle, misc).
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

RECORDER_AGENT_CONFIG = get_agent_config("recorder_agent")
RECORDER_AGENT_PROMPT = load_system_prompt(
    "recorder_agent",
    prompt_file=RECORDER_AGENT_CONFIG.prompt_file,
    partial_files=RECORDER_AGENT_CONFIG.partials,
)
RECORDER_TOOLS = get_agent_tools("recorder_agent")
RECORDER_CONTEXT_KEY = RECORDER_AGENT_CONFIG.context_key

_recorder_react_agent = None


def _get_recorder_agent():
    """Get or create the recorder agent (cached)."""
    global _recorder_react_agent
    if _recorder_react_agent is None:
        _recorder_react_agent = create_cached_react_agent(
            agent_name="recorder_agent",
            tools=RECORDER_TOOLS,
            temperature=0.2, # Lower temperature for precise data entry
        )
    return _recorder_react_agent


async def recorder_agent_node(state: MultiAgentState) -> Dict[str, Any]:
    """
    Recorder Agent node for LangGraph workflow.
    Focused on logging life events.
    """
    logger.info("Recorder Agent activated")

    try:
        agent = _get_recorder_agent()
        context_message = create_context_message(state, RECORDER_CONTEXT_KEY, RECORDER_AGENT_PROMPT)
        messages_with_context = [context_message] + list(state["messages"])

        result = await agent.ainvoke(
            {"messages": messages_with_context},
            config={"recursion_limit": 60},
        )

        last_message = result["messages"][-1]
        response_content = last_message.content if hasattr(last_message, "content") else str(last_message)

        logger.info(f"Recorder Agent response: {response_content[:100]}...")

        should_handoff, target_agent, handoff_reason = await detect_handoff(
            state, "recorder_agent", response_content
        )

        agent_contexts = state.get("agent_contexts", {})
        agent_contexts[RECORDER_CONTEXT_KEY] = {
            "last_interaction": datetime.utcnow().isoformat(),
            "last_topic": response_content[:200],
        }

        updates = {
            "messages": result["messages"],
            "current_agent": "recorder_agent",
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
        logger.error(f"Error in Recorder Agent: {e}", exc_info=True)
        error_msg = AIMessage(content="I encountered an error processing your request.")
        return {
            "messages": [error_msg],
            "current_agent": "recorder_agent",
            "turn_count": state["turn_count"] + 1,
        }
