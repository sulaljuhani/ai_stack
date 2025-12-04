"""Table Discovery Agent - identifies target table for logging requests."""

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
from tools.reporting import list_tables

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("table_discovery")
AGENT_PROMPT = load_system_prompt(
    "table_discovery",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("table_discovery")
CONTEXT_KEY = AGENT_CONFIG.context_key


async def table_discovery_node(state: MultiAgentState) -> Dict[str, Any]:
    """Discover appropriate table for the logging request. - direct execution without React loops."""
    logger.info("Table Discovery activated")
    try:
        # Get last message for context
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        # Get available tables
        target_table = "food_log"
        tables = []
        try:
            tables_resp = await list_tables.ainvoke({})
            tables = tables_resp.get("tables") if isinstance(tables_resp, dict) else None
        except Exception as e:
            logger.warning("Table discovery failed, defaulting to food_log: %s", e)

        # LLM chooses the table name from available list
        if tables:
            prompt = f"""Available tables: {', '.join(tables)}
User request: {request}
Pick the single best table name from the list above for this request. Respond with ONLY the table name."""
            try:
                llm_choice = await simple_llm_call(prompt, temperature=0.0)
                llm_choice_clean = (llm_choice or "").strip().split()[0]
                if llm_choice_clean in tables:
                    target_table = llm_choice_clean
                else:
                    # fallback heuristic: prefer food-like tables, else first
                    food_like = [t for t in tables if "food" in t.lower()]
                    target_table = food_like[0] if food_like else tables[0]
            except Exception as e:
                logger.warning("LLM table pick failed, falling back: %s", e)
                food_like = [t for t in tables if "food" in t.lower()]
                target_table = food_like[0] if food_like else tables[0]

        response_content = f"Table Discovery selected table: {target_table}"

        # Internal-only response
        return create_internal_response(
            state=state,
            agent_name="table_discovery",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team=state.get("current_team", "unknown"),
            additional_state={
                "current_agent": "table_discovery",
                "current_team": "life_logging",
                "target_agent": "schema_inspector",
                "team_context": {
                    **state.get("team_context", {}),
                    "life_logging": {
                        "workflow_stage": "table_discovery",
                        "target_agent": "schema_inspector",
                        "target_table": target_table,
                    },
                },
            },
        )
    except Exception as e:
        logger.error("Error in Table Discovery: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="table_discovery",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team=state.get("current_team", "unknown"),
        )
