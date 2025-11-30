"""
Task Agent - Specialized in task management, planning, and productivity.

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
TASK_AGENT_CONFIG = get_agent_config("task_agent")
TASK_AGENT_PROMPT = load_system_prompt(
    "task_agent",
    prompt_file=TASK_AGENT_CONFIG.prompt_file,
    partial_files=TASK_AGENT_CONFIG.partials,
)
TASK_TOOLS = get_agent_tools("task_agent")
# Context key drives shared-context map
TASK_CONTEXT_KEY = TASK_AGENT_CONFIG.context_key

# Create ReAct agent once (following tutorial pattern)
_task_react_agent = None


def _get_task_agent():
    """
    Get or create the task agent.

    Following LangGraph tutorial pattern: agent created once, reused forever.

    Returns:
        Cached ReAct agent
    """
    global _task_react_agent
    if _task_react_agent is None:
        _task_react_agent = create_cached_react_agent(
            agent_name="task_agent",
            tools=TASK_TOOLS,
            temperature=0.7,
        )
    return _task_react_agent


# ============================================================================
# AGENT NODE (Simple function following tutorial pattern)
# ============================================================================

async def task_agent_node(state: MultiAgentState) -> Dict[str, Any]:
    """
    Task Agent node for LangGraph workflow.

    Following LangGraph tutorial pattern:
    - Simple function taking state, returning state updates
    - Reuses cached agent (no recreation)
    - Context injected via messages (not templates)

    Args:
        state: Current conversation state

    Returns:
        State updates dict
    """
    logger.info("Task Agent activated")

    try:
        # Get cached agent (created once, reused forever)
        agent = _get_task_agent()

        # Create context message (following tutorial pattern)
        context_message = create_context_message(state, TASK_CONTEXT_KEY, TASK_AGENT_PROMPT)

        # Prepend context to messages
        messages_with_context = [context_message] + list(state["messages"])

        # DEBUG: Log the last few user messages to understand what the agent sees
        logger.info(f"Task Agent message count: {len(state['messages'])}")
        from langchain_core.messages import HumanMessage
        user_messages = [m for m in state["messages"] if isinstance(m, HumanMessage)]
        if user_messages:
            last_user_msg = user_messages[-1].content if user_messages else "No user messages"
            logger.info(f"Last user message: {last_user_msg[:200]}...")

        # DEBUG: Log ALL messages being sent to LLM
        logger.info(f"Messages being sent to LLM ({len(messages_with_context)} total):")
        for i, msg in enumerate(messages_with_context[:5]):  # First 5 messages
            msg_preview = str(msg)[:150] if hasattr(msg, '__str__') else str(type(msg))
            logger.info(f"  Message {i}: {msg_preview}...")

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

        logger.info(f"Task Agent response: {response_content[:100]}...")

        # Detect handoff
        should_handoff, target_agent, handoff_reason = await detect_handoff(
            state, "task_agent", response_content
        )

        # Update agent context (consolidated structure)
        agent_contexts = state.get("agent_contexts", {})
        agent_contexts[TASK_CONTEXT_KEY] = {
            "last_interaction": datetime.utcnow().isoformat(),
            "last_topic": response_content[:200],
        }

        # Prepare state updates (following tutorial pattern: return updates dict)
        updates = {
            "messages": result["messages"],
            "current_agent": "task_agent",
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
        logger.error(f"Error in Task Agent: {e}", exc_info=True)
        error_msg = AIMessage(content="I encountered an error processing your request.")
        return {
            "messages": [error_msg],
            "current_agent": "task_agent",
            "turn_count": state["turn_count"] + 1,
        }
