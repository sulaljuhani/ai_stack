"""Analytics Team Supervisor."""

from __future__ import annotations

from typing import Any, Dict

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from graph.state import MultiAgentState
from utils.llm import get_routing_llm
from utils.logging import get_logger

logger = get_logger(__name__)

TEAM_NAME = "analytics"


class InternalRoutingDecision(BaseModel):
    agent: str
    reason: str


async def _llm_internal_routing(message: str) -> str:
    """Use LLM to determine which analyst to use."""
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are an internal routing agent for the Analytics Team.

Available agents:
- task_analyst: Task productivity, completion rates, task stats
- event_analyst: Calendar/time usage analysis
- life_analyst: Food/health/habits/expenses analysis via SQL
- reminder_analyst: Reminder completion and patterns

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
        logger.error("Analytics internal routing failed: %s", e)
        return "task_analyst"


async def analytics_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Route analytics requests to specialized analysts."""
    logger.info("Analytics Supervisor activated")

    last_message = state["messages"][-1]
    message_content = last_message.content if hasattr(last_message, "content") else ""
    message_lower = message_content.lower()

    if any(kw in message_lower for kw in ["task", "todo", "project", "productivity"]):
        target = "task_analyst"
    elif any(kw in message_lower for kw in ["event", "meeting", "calendar", "time usage", "schedule"]):
        target = "event_analyst"
    elif any(kw in message_lower for kw in ["log", "food", "health", "habit", "expense", "life data"]):
        target = "life_analyst"
    elif any(kw in message_lower for kw in ["reminder", "follow-up", "alerts"]):
        target = "reminder_analyst"
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
        "current_agent": "analytics_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": target,
        "team_context": team_context,
    }

