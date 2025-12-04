"""Database Operation Agent - executes INSERT/UPDATE/DELETE based on logging intent."""

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
from tools.reporting import list_tables, get_table_schema, insert_table_row
import json

logger = get_logger(__name__)

AGENT_CONFIG = get_agent_config("db_operation")
AGENT_PROMPT = load_system_prompt(
    "db_operation",
    prompt_file=AGENT_CONFIG.prompt_file,
    partial_files=AGENT_CONFIG.partials,
)
AGENT_TOOLS = get_agent_tools("db_operation")
CONTEXT_KEY = AGENT_CONFIG.context_key


async def db_operation_node(state: MultiAgentState) -> Dict[str, Any]:
    """Execute DB operation and hand off to validator. - direct execution without React loops."""
    logger.info("Db Operation activated")
    try:
        # Get last message for context
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        # Determine target table from team context (set by schema_inspector/table_discovery)
        team_ctx = state.get("team_context", {}).get("life_logging", {}) or {}
        table_name = team_ctx.get("target_table") or "food_log"

        # Inspect schema to filter payload
        allowed_cols = set()
        schema = None
        try:
            schema_resp = await get_table_schema.ainvoke({"table_name": table_name})
            schema = schema_resp.get("schema") if isinstance(schema_resp, dict) else None
            if schema:
                allowed_cols = {col.get("column_name") for col in schema if col.get("column_name")}
        except Exception as e:
            logger.warning("Schema inspect failed for %s: %s", table_name, e)

        # Use LLM to extract structured data
        extracted_data = {}
        if allowed_cols:
            extraction_system_prompt = f"""You are a database entry specialist.
Target Table: {table_name}
Allowed Columns: {', '.join(sorted(allowed_cols))}

Your task is to extract values from the user request to populate these columns.
- Extract the core entity (e.g., 'jawi') for the main text column (food_name, title, etc.).
- Map sentiment to preference/rating if applicable (e.g., "didn't like" -> 0, "liked" -> 1).
- Output ONLY valid JSON.
"""
            extraction_user_prompt = f"User Request: {request}\n\nExtract JSON payload:"
            
            try:
                llm_response = await simple_llm_call(
                    prompt=extraction_user_prompt,
                    system_prompt=extraction_system_prompt,
                    temperature=0.0
                )
                # Clean up code blocks if present
                llm_response = llm_response.replace("```json", "").replace("```", "").strip()
                if llm_response.startswith("{"):
                    extracted_data = json.loads(llm_response)
            except Exception as e:
                logger.warning(f"LLM extraction failed: {e}")

        # Build payload using available columns only
        user_id = state.get("user_id") or "00000000-0000-0000-0000-000000000001"
        payload = {}

        # 1. Use extracted data first
        for col, val in extracted_data.items():
            if col in allowed_cols:
                payload[col] = val

        # 2. Apply defaults and fallbacks
        if "user_id" in allowed_cols and "user_id" not in payload:
            payload["user_id"] = user_id
        
        # Timestamps
        now = datetime.utcnow()
        if "consumed_at" in allowed_cols and "consumed_at" not in payload:
            payload["consumed_at"] = now
        if "logged_at" in allowed_cols and "logged_at" not in payload:
            payload["logged_at"] = now
        if "occurred_at" in allowed_cols and "occurred_at" not in payload:
            payload["occurred_at"] = now
            
        # Location default if not extracted
        if "location" in allowed_cols and "location" not in payload:
            payload["location"] = "home"

        # Fallback: if payload is empty (extraction failed), use previous naive logic
        if not any(k for k in payload if k not in ["user_id", "consumed_at", "logged_at", "occurred_at", "location"]):
             if not allowed_cols or "food_name" in allowed_cols:
                payload["food_name"] = request[:200]
             elif "description" in allowed_cols:
                payload["description"] = request[:500]
             elif "notes" in allowed_cols:
                payload["notes"] = request[:500]
             
             if "preference" in allowed_cols:
                payload["preference"] = 1 # Default fallback (will be converted if schema requires text)

        # Type enforcement based on schema
        if schema and payload:
             for col_def in schema:
                col_name = col_def.get("column_name")
                data_type = col_def.get("data_type")
                
                if col_name in payload:
                    val = payload[col_name]
                    
                    # Enforce Integer
                    if data_type in ["integer", "numeric", "bigint", "smallint"]:
                        if isinstance(val, str):
                            # Try to convert string sentiment to int
                            if val.lower() in ["liked", "positive", "good", "yes", "true"]:
                                payload[col_name] = 1
                            elif val.lower() in ["disliked", "negative", "bad", "no", "false"]:
                                payload[col_name] = 0
                            else:
                                # Try direct int conversion
                                try:
                                    payload[col_name] = int(val)
                                except:
                                    pass # Keep as is
                    
                    # Enforce String
                    elif data_type in ["text", "character varying", "character"]:
                        if not isinstance(val, str):
                            if col_name == "preference" and isinstance(val, int):
                                # Map 1/0 back to strings for preference if it is text
                                if val == 1: payload[col_name] = "liked"
                                elif val == 0: payload[col_name] = "disliked"
                                else: payload[col_name] = str(val)
                            else:
                                payload[col_name] = str(val)

        # Insert row
        insert_result = await insert_table_row.ainvoke({"table_name": table_name, "data": payload})

        # Build a concise natural-language summary for Sebastian to surface
        if insert_result.get("success") and insert_result.get("row"):
            row = insert_result["row"]
            row_id = row.get("id")
            food_name = row.get("food_name") or row.get("description") or row.get("notes")
            consumed_at = row.get("consumed_at") or row.get("logged_at") or row.get("occurred_at")
            summary = f"Logged to {table_name}"
            if row_id is not None:
                summary += f" (id {row_id})"
            if food_name:
                summary += f": {food_name}"
            if consumed_at:
                summary += f" at {consumed_at}"
            response_content = summary[:500]
        else:
            error_msg = insert_result.get("error") or "unknown error"
            response_content = f"Failed to log to {table_name}: {error_msg}"[:500]

        # Internal-only response
        return create_internal_response(
            state=state,
            agent_name="db_operation",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team=state.get("current_team", "unknown"),
            additional_state={
                "current_agent": "db_operation",
                "current_team": "life_logging",
                "target_agent": "logging_validator",
                "team_context": {
                    **state.get("team_context", {}),
                    "life_logging": {
                        "workflow_stage": "db_operation",
                        "target_agent": "logging_validator",
                    },
                }
            },
        )
    except Exception as e:
        logger.error("Error in Db Operation: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="db_operation",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team=state.get("current_team", "unknown"),
        )
