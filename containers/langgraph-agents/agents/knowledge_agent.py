"""
Knowledge Agent - Specialized in memory retrieval, document search, and vault operations.
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
from tools.documents import search_embedded_documents

logger = get_logger(__name__)

KNOWLEDGE_AGENT_CONFIG = get_agent_config("knowledge_agent")
KNOWLEDGE_AGENT_PROMPT = load_system_prompt(
    "knowledge_agent",
    prompt_file=KNOWLEDGE_AGENT_CONFIG.prompt_file,
    partial_files=KNOWLEDGE_AGENT_CONFIG.partials,
)
KNOWLEDGE_TOOLS = get_agent_tools("knowledge_agent")
KNOWLEDGE_CONTEXT_KEY = KNOWLEDGE_AGENT_CONFIG.context_key

_knowledge_react_agent = None


async def _vault_fact_lookup(query: str) -> Optional[Dict[str, Any]]:
    """
    Fast path lookup in the vault for personal facts/preferences.
    Returns the top hit if any.
    """
    try:
        search_fn = getattr(search_embedded_documents, "coroutine", None) or getattr(search_embedded_documents, "func", None) or search_embedded_documents
        result = await search_fn(
            query=query,
            collection_name="vault",
            limit=3,
            score_threshold=0.3,
            fallback_to_vault=True,
        )
        if result.get("success") and result.get("results"):
            return result["results"][0]
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Vault fact lookup failed: {exc}")
    return None


def _get_knowledge_agent():
    """Get or create the knowledge agent (cached)."""
    global _knowledge_react_agent
    if _knowledge_react_agent is None:
        _knowledge_react_agent = create_cached_react_agent(
            agent_name="knowledge_agent",
            tools=KNOWLEDGE_TOOLS,
            temperature=0.4,
        )
    return _knowledge_react_agent


async def knowledge_agent_node(state: MultiAgentState) -> Dict[str, Any]:
    """
    Knowledge Agent node for LangGraph workflow.
    Focused on memory retrieval, document search, and vault operations.
    """
    logger.info("Knowledge Agent activated")

    try:
        # Fast-path vault lookup for personal facts before invoking the LLM
        last_user_msg = None
        for msg in reversed(state["messages"]):
            if hasattr(msg, "type") and msg.type == "human":
                last_user_msg = msg.content
                break
            if getattr(msg, "role", "") == "user":
                last_user_msg = getattr(msg, "content", None)
                break

        if last_user_msg:
            vault_hit = await _vault_fact_lookup(last_user_msg)
            if vault_hit:
                path = vault_hit.get("file_path") or vault_hit.get("metadata", {}).get("file_path") or "vault"
                content = vault_hit.get("content") or vault_hit.get("summary_preview") or "Found relevant note."
                response_text = f"I found this in your vault ({path}):\n\n{content}"
                agent_contexts = state.get("agent_contexts", {})
                agent_contexts[KNOWLEDGE_CONTEXT_KEY] = {
                    "last_interaction": datetime.utcnow().isoformat(),
                    "last_topic": response_text[:200],
                }
                return {
                    "messages": list(state["messages"]) + [AIMessage(content=response_text)],
                    "current_agent": "knowledge_agent",
                    "previous_agent": state.get("current_agent"),
                    "agent_contexts": agent_contexts,
                    "turn_count": state["turn_count"] + 1,
                    "updated_at": datetime.utcnow().isoformat(),
                }

        agent = _get_knowledge_agent()
        context_message = create_context_message(state, KNOWLEDGE_CONTEXT_KEY, KNOWLEDGE_AGENT_PROMPT)
        messages_with_context = [context_message] + list(state["messages"])

        result = await agent.ainvoke(
            {"messages": messages_with_context},
            config={"recursion_limit": 60},
        )

        last_message = result["messages"][-1]
        response_content = last_message.content if hasattr(last_message, "content") else str(last_message)

        logger.info(f"Knowledge Agent response: {response_content[:100]}...")

        should_handoff, target_agent, handoff_reason = await detect_handoff(
            state, "knowledge_agent", response_content
        )

        agent_contexts = state.get("agent_contexts", {})
        agent_contexts[KNOWLEDGE_CONTEXT_KEY] = {
            "last_interaction": datetime.utcnow().isoformat(),
            "last_topic": response_content[:200],
        }

        updates = {
            "messages": result["messages"],
            "current_agent": "knowledge_agent",
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
        logger.error(f"Error in Knowledge Agent: {e}", exc_info=True)
        error_msg = AIMessage(content="I encountered an error processing your request.")
        return {
            "messages": [error_msg],
            "current_agent": "knowledge_agent",
            "turn_count": state["turn_count"] + 1,
        }
