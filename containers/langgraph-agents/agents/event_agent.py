"""
Event Agent - Specialized in calendar management, scheduling, and time management.

Refactored following LangGraph tutorial best practices:
- Module-level agent caching (created once, reused forever)
- Context injection via messages (not templates)
- Simple agent function (minimal overhead)
"""

from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import re
from dateutil import parser as dateparser
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
from tools import database as db_tools

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


def _detect_date_range(text: str) -> Optional[Tuple[datetime, datetime]]:
    """
    Heuristic date detector: accepts YYYY-MM-DD or natural language dates (e.g., "Dec 1, 2025").
    Returns [start, start+1d). If multiple dates exist, uses the first.
    """
    if not text:
        return None

    # Fast path: explicit ISO date
    iso_match = re.search(r"(20\d{2}-\d{2}-\d{2})", text)
    if iso_match:
        try:
            start = datetime.fromisoformat(iso_match.group(1))
            return start, start + timedelta(days=1)
        except Exception:
            pass

    # Fallback: natural language parsing
    try:
        parsed = dateparser.parse(text, fuzzy=True)
        if parsed:
            start = parsed
            return start, start + timedelta(days=1)
    except Exception:
        return None

    return None


def _get_last_human_message(state: MultiAgentState) -> Optional[str]:
    """Return last human message content if available."""
    for msg in reversed(state.get("messages", [])):
        if hasattr(msg, "type") and getattr(msg, "type", "") == "human":
            return msg.content
    return None


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

        # Auto-fetch events for mentioned date ranges to ground the response
        messages_with_context = [context_message]
        last_user_msg = _get_last_human_message(state)
        date_range = _detect_date_range(last_user_msg or "")
        if date_range:
            start_dt, end_dt = date_range
            try:
                # Call tool via ainvoke with a single mapping to avoid BaseTool kwargs issues
                events = await db_tools.search_events.ainvoke({
                    "user_id": state["user_id"],
                    "start_date": start_dt.isoformat(),
                    "end_date": end_dt.isoformat(),
                    "limit": 100,
                })
            except Exception as e:
                logger.error(f"Auto-fetch search_events failed: {e}", exc_info=True)
                events = []

            sample = ", ".join(e.get("title", "untitled") for e in events[:5]) if events else "none"
            if events:
                messages_with_context.append({
                    "type": "system",
                    "content": f"Auto-context: fetched {len(events)} events from {start_dt.date()} to {end_dt.date()}. Sample: {sample}"
                })
            else:
                messages_with_context.append({
                    "type": "system",
                    "content": f"Auto-context: no events found from {start_dt.date()} to {end_dt.date()}."
                })

        # Prepend context to messages
        messages_with_context += list(state["messages"])

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
