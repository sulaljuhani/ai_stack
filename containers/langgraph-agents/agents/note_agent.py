"""
Note-Taking Agent - captures user notes into the vault and triggers embeddings.
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

NOTE_AGENT_CONFIG = get_agent_config("note_agent")
NOTE_AGENT_PROMPT = load_system_prompt(
    "note_agent",
    prompt_file=NOTE_AGENT_CONFIG.prompt_file,
    partial_files=NOTE_AGENT_CONFIG.partials,
)
NOTE_TOOLS = get_agent_tools("note_agent")
NOTE_CONTEXT_KEY = NOTE_AGENT_CONFIG.context_key

_note_react_agent = None


def _get_note_agent():
    """Get or create the note-taking agent (cached)."""
    global _note_react_agent
    if _note_react_agent is None:
        _note_react_agent = create_cached_react_agent(
            agent_name="note_agent",
            tools=NOTE_TOOLS,
            temperature=0.2,
        )
    return _note_react_agent


async def note_agent_node(state: MultiAgentState) -> Dict[str, Any]:
    """
    Note Agent node for capturing and saving notes to the vault.
    """
    logger.info("Note Agent activated")

    try:
        agent = _get_note_agent()
        context_message = create_context_message(state, NOTE_CONTEXT_KEY, NOTE_AGENT_PROMPT)
        messages_with_context = [context_message] + list(state["messages"])

        result = await agent.ainvoke(
            {"messages": messages_with_context},
            config={"recursion_limit": 60},
        )

        last_message = result["messages"][-1]
        response_content = last_message.content if hasattr(last_message, "content") else str(last_message)

        logger.info(f"Note Agent response: {response_content[:100]}...")

        should_handoff, target_agent, handoff_reason = await detect_handoff(
            state, "note_agent", response_content
        )

        agent_contexts = state.get("agent_contexts", {})
        agent_contexts[NOTE_CONTEXT_KEY] = {
            "last_interaction": datetime.utcnow().isoformat(),
            "last_topic": response_content[:200],
        }

        updates = {
            "messages": result["messages"],
            "current_agent": "note_agent",
            "previous_agent": state.get("current_agent"),
            "agent_contexts": agent_contexts,
            "turn_count": state["turn_count"] + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

        if should_handoff and target_agent:
            updates["target_agent"] = target_agent
            updates["handoff_reason"] = handoff_reason
            handoff_msg = AIMessage(
                content=f"I'll hand this to the {target_agent.replace('_', ' ').title()} for better handling."
            )
            updates["messages"] = updates["messages"] + [handoff_msg]

        return updates

    except Exception as e:
        logger.error(f"Error in Note Agent: {e}", exc_info=True)
        error_msg = AIMessage(content="I hit an error while saving that note.")
        return {
            "messages": [error_msg],
            "current_agent": "note_agent",
            "turn_count": state["turn_count"] + 1,
        }
