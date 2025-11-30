"""
Event Agent - Specialized in calendar management, scheduling, and time management.

Refactored following LangGraph tutorial best practices:
- Module-level agent caching (created once, reused forever)
- Context injection via messages (not templates)
- Simple agent function (minimal overhead)
"""

from typing import Dict, Any
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


# ============================================================================
# MODULE-LEVEL CONFIGURATION (Created once, reused forever)
# ============================================================================

# Load config and resources once
EVENT_AGENT_CONFIG = get_agent_config("event_agent")
EVENT_AGENT_PROMPT = load_system_prompt(
    "event_agent",
    prompt_file=EVENT_AGENT_CONFIG.prompt_file,
    partial_files=EVENT_AGENT_CONFIG.partials,
)
EVENT_TOOLS = get_agent_tools("event_agent")
EVENT_CONTEXT_KEY = EVENT_AGENT_CONFIG.context_key

# Create ReAct agent once (following tutorial pattern)
_event_react_agent = None


def _get_event_agent():
    """
    Get or create the event agent.

    Following LangGraph tutorial pattern: agent created once, reused forever.

    Returns:
        Cached ReAct agent
    """
    global _event_react_agent
    if _event_react_agent is None:
        _event_react_agent = create_cached_react_agent(
            agent_name="event_agent",
            tools=EVENT_TOOLS,
            temperature=0.7,
        )
    return _event_react_agent


# ============================================================================
# AGENT NODE (Simple function following tutorial pattern)
# ============================================================================

async def event_agent_node(state: MultiAgentState) -> Dict[str, Any]:
    """
    Event Agent node for LangGraph workflow.

    Following LangGraph tutorial pattern:
    - Simple function taking state, returning state updates
    - Reuses cached agent (no recreation)
    - Context injected via messages (not templates)

    Args:
        state: Current conversation state

    Returns:
        State updates dict
    """
    logger.info("Event Agent activated")

    try:
        # Get cached agent (created once, reused forever)
        agent = _get_event_agent()

        # Create context message (following tutorial pattern)
        context_message = create_context_message(state, EVENT_CONTEXT_KEY, EVENT_AGENT_PROMPT)

        # Prepend context to messages
        messages_with_context = [context_message] + list(state["messages"])

        # Invoke agent (simple like tutorial)
        result = await agent.ainvoke(
            {"messages": messages_with_context},
            config={"recursion_limit": 60},
        )

        # Extract response
        last_message = result["messages"][-1]
        response_content = (
            last_message.content if hasattr(last_message, "content") else str(last_message)
        )

        logger.info(f"Event Agent response: {response_content[:100]}...")

        # Detect handoff
        should_handoff, target_agent, handoff_reason = await detect_handoff(
            state, "event_agent", response_content
        )

        # Update agent context (consolidated structure)
        agent_contexts = state.get("agent_contexts", {})
        agent_contexts[EVENT_CONTEXT_KEY] = {
            "last_interaction": datetime.utcnow().isoformat(),
            "last_topic": response_content[:200],
        }

        # Prepare state updates (following tutorial pattern: return updates dict)
        updates = {
            "messages": result["messages"],
            "current_agent": "event_agent",
            "previous_agent": state.get("current_agent"),
            "agent_contexts": agent_contexts,
            "turn_count": state["turn_count"] + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Add handoff information if detected
        if should_handoff and target_agent:
            updates["target_agent"] = target_agent
            updates["handoff_reason"] = handoff_reason

            # Add handoff message
            handoff_msg = AIMessage(
                content=f"I'm transferring you to the {target_agent.replace('_', ' ').title()} who can better assist with that."
            )
            updates["messages"] = updates["messages"] + [handoff_msg]

        return updates

    except Exception as e:
        logger.error(f"Error in Event Agent: {e}", exc_info=True)
        error_msg = AIMessage(content="I encountered an error processing your request.")
        return {
            "messages": [error_msg],
            "current_agent": "event_agent",
            "turn_count": state["turn_count"] + 1,
        }
