"""Knowledge & Notes Team Supervisor."""

from __future__ import annotations

from typing import Any, Dict

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from graph.state import MultiAgentState
from utils.llm import get_routing_llm
from utils.logging import get_logger

logger = get_logger(__name__)

TEAM_NAME = "knowledge_management"


class InternalRoutingDecision(BaseModel):
    agent: str
    reason: str


async def _llm_internal_routing(message: str) -> str:
    """Use LLM to determine which specialized agent to use."""
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are an internal routing agent for the Knowledge & Notes Team.

Available agents:
- note_creator: Capture/write notes to the vault
- note_appender: Append/augment existing notes
- knowledge_retriever: Search vault/memories/documents (READ ONLY)
- knowledge_searcher: Vector/fuzzy/document search (READ ONLY)
- knowledge_validator: Validate knowledge operations (READ ONLY)

Based on the user's message, which agent should handle this? Respond with the agent name only.""",
            ),
            ("user", "Message: {message}\n\nWhich agent?"),
        ]
    )

    llm = get_routing_llm()
    try:
        structured_llm = llm.with_structured_output(InternalRoutingDecision)
        decision = await structured_llm.ainvoke(prompt.format_messages(message=message))
        return decision.agent
    except Exception as e:
        logger.error("Knowledge internal routing failed: %s", e)
        return "knowledge_retriever"


async def knowledge_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Route knowledge/note requests to specialized agents."""
    logger.info("Knowledge Supervisor activated")

    last_message = state["messages"][-1]
    message_content = last_message.content if hasattr(last_message, "content") else ""
    message_lower = message_content.lower()

    if any(kw in message_lower for kw in ["write a note", "create note", "new note", "journal", "save this note"]):
        target = "note_creator"
    elif any(kw in message_lower for kw in ["append", "add to note", "update note", "extend note"]):
        target = "note_appender"
    elif any(kw in message_lower for kw in ["search", "find", "lookup", "recall", "what do i know", "documents"]):
        target = "knowledge_retriever"
    elif any(kw in message_lower for kw in ["vector", "fuzzy", "embedding", "similar", "semantic"]):
        target = "knowledge_searcher"
    else:
        target = await _llm_internal_routing(message_content)

    team_context = {
        **state.get("team_context", {}),
        TEAM_NAME: {
            "target_agent": target,
            "supervisor_decision": "keyword_match",
        },
    }

    return {
        "current_team": TEAM_NAME,
        "previous_team": state.get("current_team"),
        "current_agent": "knowledge_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": target,
        "team_context": team_context,
    }

