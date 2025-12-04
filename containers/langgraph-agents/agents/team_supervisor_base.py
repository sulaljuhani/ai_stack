"""
Base template for team supervisor agents (Phase 3 placeholder).

Supervisors currently delegate to the first configured agent in their team.
Later phases will add richer routing and validation logic.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from langchain_core.messages import AIMessage

from agents.team_registry import get_team_config, load_teams
from graph.state import MultiAgentState
from utils.logging import get_logger

logger = get_logger(__name__)


def create_team_supervisor_node(team_name: str):
    """Factory to create a placeholder team supervisor node."""
    load_teams()

    async def team_supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
        team_config = get_team_config(team_name)
        supervisor_name = team_config.supervisor if team_config else f"{team_name}_supervisor"

        if not team_config:
            msg = AIMessage(content=f"Team '{team_name}' is not configured.")
            return {
                "messages": [msg],
                "current_team": team_name,
                "current_agent": supervisor_name,
            }

        target_agent = team_config.agent_names[0] if team_config.agent_names else None
        if not target_agent:
            msg = AIMessage(content=f"Team '{team_name}' has no agents configured.")
            return {
                "messages": [msg],
                "current_team": team_name,
                "current_agent": supervisor_name,
            }

        logger.info("Team Supervisor [%s] delegating to %s", team_name, target_agent)

        team_context = {
            **state.get("team_context", {}),
            team_name: {
                "activated_at": datetime.utcnow().isoformat(),
                "supervisor_action": "delegated_to_agent",
                "target_agent": target_agent,
            },
        }

        return {
            "current_team": team_name,
            "previous_team": state.get("current_team"),
            "current_agent": supervisor_name,
            "target_agent": target_agent,
            "team_context": team_context,
        }

    return team_supervisor_node
