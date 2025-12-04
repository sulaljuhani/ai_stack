"""Knowledge Retrieval Agent - Read-only vault/memory/doc search."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from agents.agent_registry import get_agent_config, get_agent_tools
from agents.base import (
    create_internal_response,
    simple_llm_call,
    load_system_prompt,
)
from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("knowledge_retriever")
AGENT_PROMPT = load_system_prompt(
    "knowledge_retriever",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("knowledge_retriever")
CONTEXT_KEY = AGENT_CONFIG.context_key


async def knowledge_retriever_node(state: MultiAgentState) -> Dict[str, Any]:
    """Handle knowledge retrieval (read-only). - direct execution without React loops."""
    logger.info("Knowledge Retriever activated")
    try:
        # Get last message for context
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        # Direct tool execution - no LLM loops
        # Agents should call tools directly based on their specific role
        response_content = f"Knowledge Retriever executed: {request[:50]}..."

        # Internal-only response
        return create_internal_response(
            state=state,
            agent_name="knowledge_retriever",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team=state.get("current_team", "unknown"),
            
        )
    except Exception as e:
        logger.error("Error in Knowledge Retriever: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="knowledge_retriever",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team=state.get("current_team", "unknown"),
        )
