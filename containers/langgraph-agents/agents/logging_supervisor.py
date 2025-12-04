"""Life Logging Team Supervisor - sequential pipeline controller."""

from __future__ import annotations

from typing import Any, Dict

from langchain_core.messages import AIMessage

from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)

TEAM_NAME = "life_logging"
PIPELINE = ["table_discovery", "schema_inspector", "db_operation", "logging_validator"]


async def logging_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
    """Coordinate logging pipeline (discovery -> schema -> db op -> validation)."""
    team_ctx = state.get("team_context", {}).get(TEAM_NAME, {}) or {}
    logger.info(
        "Logging Supervisor activated (stage=%s, current_team=%s, target_agent=%s)",
        team_ctx.get("workflow_stage"),
        state.get("current_team"),
        state.get("target_agent"),
    )

    current_stage = team_ctx.get("workflow_stage")

    # If we already validated, finish and talk to user
    if current_stage == "logging_validator":
        agent_contexts = state.get("agent_contexts", {})
        recorder_ctx = agent_contexts.get("recorder", {}) or {}
        last_result = recorder_ctx.get("last_result", "Logging completed.")

        return {
            # Exit the team and hand back to Sebastian
            "current_team": None,
            "previous_team": TEAM_NAME,
            "current_agent": "logging_supervisor",
            "previous_agent": state.get("current_agent"),
            "target_agent": "sebastian_supervisor",
            "handoff_reason": "life_logging_complete",
            "team_context": {
                **state.get("team_context", {}),
                TEAM_NAME: {"workflow_stage": "complete"},
            },
            "agent_contexts": {
                **state.get("agent_contexts", {}),
                "recorder": {
                    **recorder_ctx,
                    "last_result": last_result,
                },
            },
        }

    # Otherwise, just keep the stage and let routing move forward
    return {
        "current_team": TEAM_NAME,
        "previous_team": state.get("current_team"),
        "current_agent": "logging_supervisor",
        "previous_agent": state.get("current_agent"),
        "target_agent": None,
        "team_context": {
            **state.get("team_context", {}),
            TEAM_NAME: {"workflow_stage": current_stage or "table_discovery"},
        },
    }
