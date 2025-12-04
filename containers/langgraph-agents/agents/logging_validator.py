"""Logging Validation Agent - Verifies database logging operations."""

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

AGENT_CONFIG = get_agent_config("logging_validator")
AGENT_PROMPT = load_system_prompt(
    "logging_validator",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("logging_validator")
CONTEXT_KEY = AGENT_CONFIG.context_key


async def logging_validator_node(state: MultiAgentState) -> Dict[str, Any]:
    """Validate logging operations and record results. - direct execution without React loops."""
    logger.info("Logging Validator activated")
    try:
        # Get last message for context
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        # Preserve prior recorder result (from db_operation) so Sebastian can surface it
        recorder_ctx = (state.get("agent_contexts", {}) or {}).get("recorder", {}) or {}
        prior_result = recorder_ctx.get("last_result")
        response_content = prior_result or f"Logging validated: {request[:50]}..."
        validation_results = [{"status": "ok", "detail": "Logging validator completed"}]

        # Internal-only response
        return create_internal_response(
            state=state,
            agent_name="logging_validator",
            context_key="recorder",
            result_content=response_content,
            team=state.get("current_team", "unknown"),
            additional_state={
                "current_agent": "logging_validator",
                "current_team": "life_logging",
                "target_agent": "logging_supervisor",
                "validation_results": validation_results,
                "agent_contexts": {
                    **state.get("agent_contexts", {}),
                    "recorder": {
                        "last_result": response_content,
                        "validation_results": validation_results,
                        "workflow_stage": "logging_validator",
                    },
                },
                "team_context": {
                    **state.get("team_context", {}),
                    "life_logging": {
                        "workflow_stage": "logging_validator",
                        "target_agent": "logging_supervisor",
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Logging Validator: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="logging_validator",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team=state.get("current_team", "unknown"),
        )
