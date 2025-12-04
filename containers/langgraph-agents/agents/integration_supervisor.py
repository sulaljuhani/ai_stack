"""Integration Team Supervisor."""

from __future__ import annotations

from typing import Any, Dict

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from graph.state import MultiAgentState
from utils.llm import get_routing_llm
from utils.logging import get_logger

logger = get_logger(__name__)

TEAM_NAME = "integrations"


class InternalRoutingDecision(BaseModel):
    agent: str
    reason: str


async def _llm_internal_routing(message: str) -> str:
    """Use LLM to determine which integration agent to use."""
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are an internal routing agent for the Integrations Team.

Available agents:
- todoist_agent: Todoist project/label retrieval and task mirroring
- google_calendar_agent: Google Calendar sync and retrieval
- integration_health_agent: Integration status and health checks

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
        logger.error("Integration internal routing failed: %s", e)
        return "integration_health_agent"


async def integration_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Route integration requests to specialized integration agents."""
    logger.info("Integration Supervisor activated")

    last_message = state["messages"][-1]
    message_content = last_message.content if hasattr(last_message, "content") else ""
    message_lower = message_content.lower()

    if any(kw in message_lower for kw in ["todoist", "project", "label", "mirror tasks"]):
        target = "todoist_agent"
    elif any(kw in message_lower for kw in ["google calendar", "gcal", "calendar sync", "google events"]):
        target = "google_calendar_agent"
    elif any(kw in message_lower for kw in ["integration status", "health", "connection", "credentials"]):
        target = "integration_health_agent"
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
        "current_agent": "integration_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": target,
        "team_context": team_context,
    }

