"""Sebastian - Main Supervisor Agent.

Sole user-facing entry point; routes to team supervisors and wraps responses.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from langchain_core.messages import AIMessage

from agents.base import simple_llm_call
from agents.team_registry import get_team_config
from graph.state import MultiAgentState
from graph.team_routing import route_to_team
from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)


async def sebastian_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Sebastian routes user requests to the appropriate team supervisor."""
    logger.info("Sebastian (main supervisor) activated")

    # If a team handed back a summary message, surface it to the user
    team_ctx = state.get("team_context", {}) or {}
    for team_name, ctx in team_ctx.items():
        msg = ctx.get("handoff_message")
        if msg:
            # Use LLM to polish any raw payload before showing the user
            try:
                polished = await simple_llm_call(
                    prompt=f"Summarize this tool result for a user in one concise sentence, no JSON: {msg}",
                    system_prompt="You are Sebastian, responding to the user. Be concise, direct, and friendly.",
                    temperature=0.1,
                )
                wrapped = AIMessage(content=polished)
            except Exception:
                wrapped = AIMessage(content=msg)
            return {
                "messages": [wrapped],
                "current_team": None,
                "previous_team": state.get("current_team"),
                "current_agent": "sebastian_supervisor",
                "previous_agent": state.get("previous_agent"),
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }

    # If returning from a team workflow with a recorder result, present it to the user
    agent_contexts = state.get("agent_contexts", {}) or {}
    recorder_ctx = agent_contexts.get("recorder", {}) or {}
    last_result = recorder_ctx.get("last_result")
    current_team = state.get("current_team")
    previous_agent = state.get("previous_agent")
    if last_result and not state.get("target_agent"):
        wrapped = AIMessage(content=f"Logged entry: {last_result}")
        return {
            "messages": [wrapped],
            "current_team": None,
            "current_agent": "sebastian_supervisor",
            "previous_agent": previous_agent,
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
            "target_agent": None,
            "target_team": None,
            "team_context": {
                **state.get("team_context", {}),
                current_team: {"workflow_stage": "complete"} if current_team else {},
            },
        }

    # Quick handling: answer simple food log recap without running full pipeline
    if state.get("messages"):
        last_msg = state["messages"][-1]
        content = last_msg.content if hasattr(last_msg, "content") else ""
        msg_lower = content.lower()
        if "last food" in msg_lower or "food i logged" in msg_lower or "last meal" in msg_lower:
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT id, food_name, consumed_at, preference FROM food_log ORDER BY id DESC LIMIT 1"
                )
            if row:
                pref = row["preference"] or "unspecified"
                consumed = row["consumed_at"].isoformat() if row["consumed_at"] else "unspecified time"
                wrapped = AIMessage(content=f"Last logged food: {row['food_name']} (preference: {pref}) at {consumed}.")
            else:
                wrapped = AIMessage(content="No food log entries found.")
            return {
                "messages": [wrapped],
                "current_team": None,
                "current_agent": "sebastian_supervisor",
                "previous_agent": previous_agent,
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }

    # Check if ANY team has a completed workflow with a result to return
    team_context = state.get("team_context", {})
    for team_name, team_ctx in team_context.items():
        if team_ctx.get("workflow_stage") == "complete" and team_ctx.get("last_result"):
            # Found a completed team with a result—surface it to user
            last_result = team_ctx.get("last_result")
            logger.info("Found completed workflow for team %s, surfacing result", team_name)
            try:
                polished = await simple_llm_call(
                    prompt=f"Summarize this tool result for a user in one concise sentence, no JSON: {last_result}",
                    system_prompt="You are Sebastian, responding to the user. Be concise, direct, and friendly.",
                    temperature=0.1,
                )
                wrapped = AIMessage(content=polished)
            except Exception:
                wrapped = AIMessage(content=last_result)
            return {
                "messages": [wrapped],
                "current_team": None,
                "previous_team": state.get("previous_team"),
                "current_agent": "sebastian_supervisor",
                "previous_agent": state.get("previous_agent"),
                "turn_count": state.get("turn_count", 0) + 1,
                "updated_at": datetime.utcnow().isoformat(),
            }

    # Choose team via routing
    team = await route_to_team(state)

    # Handle routing errors - inform user and wait for clarification
    if team == "__routing_error__":
        error_msg = AIMessage(
            content="I'm having trouble understanding your request. The routing system couldn't "
                    "determine which team should handle this. Could you please rephrase your "
                    "request or provide more specific details about what you need help with?"
        )
        return {
            "messages": [error_msg],
            "current_agent": "sebastian_supervisor",
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    team_config = get_team_config(team) if team else None
    if not team_config:
        fallback = AIMessage(
            content="I am unsure which team should handle that. Could you clarify what you need?"
        )
        return {
            "messages": [fallback],
            "current_agent": "sebastian_supervisor",
            "turn_count": state.get("turn_count", 0) + 1,
            "updated_at": datetime.utcnow().isoformat(),
        }

    logger.info("Sebastian routing to team %s -> supervisor %s", team, team_config.supervisor)

    return {
        "current_team": team,
        "previous_team": state.get("current_team"),
        "current_agent": "sebastian_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": team_config.supervisor,
        "target_team": None,
        "handoff_reason": "team_routing",
        "updated_at": datetime.utcnow().isoformat(),
    }
