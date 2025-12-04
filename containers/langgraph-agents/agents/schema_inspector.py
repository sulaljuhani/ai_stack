"""Schema Inspector Agent - inspects target table structure."""

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
from tools.reporting import get_table_schema

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("schema_inspector")
AGENT_PROMPT = load_system_prompt(
    "schema_inspector",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("schema_inspector")
CONTEXT_KEY = AGENT_CONFIG.context_key


async def schema_inspector_node(state: MultiAgentState) -> Dict[str, Any]:
    """Inspect schema and hand off to db operation. - direct execution without React loops."""
    logger.info("Schema Inspector activated")
    try:
        # Get last message for context
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        team_ctx = state.get("team_context", {}).get("life_logging", {}) or {}
        target_table = team_ctx.get("target_table") or "food_log"

        # Fetch schema for the chosen table
        schema_resp = await get_table_schema.ainvoke({"table_name": target_table})
        response_content = f"Schema Inspector: table={target_table}, columns={len(schema_resp.get('schema', [])) if isinstance(schema_resp, dict) else 'n/a'}"

        # Internal-only response
        return create_internal_response(
            state=state,
            agent_name="schema_inspector",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team=state.get("current_team", "unknown"),
            additional_state={
                "current_agent": "schema_inspector",
                "current_team": "life_logging",
                "target_agent": "db_operation",
                "agent_contexts": {
                    **state.get("agent_contexts", {}),
                    "recorder": {
                        "last_table": target_table,
                        "schema": schema_resp.get("schema") if isinstance(schema_resp, dict) else None,
                        "last_result": response_content,
                    }
                },
                "team_context": {
                    **state.get("team_context", {}),
                    "life_logging": {
                        "workflow_stage": "schema_inspector",
                        "target_agent": "db_operation",
                        "target_table": target_table,
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Schema Inspector: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="schema_inspector",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team=state.get("current_team", "unknown"),
        )
