from typing import Dict, Any, Optional, List
import json
import re
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)

@tool
async def run_read_only_sql(
    query: str,
) -> Dict[str, Any]:
    """
    Run a read-only SQL query to answer complex questions about the user's data.
    Only SELECT statements are allowed.
    The user_id is '00000000-0000-0000-0000-000000000001'.
    Tables available: 
    - menstrual_cycles (user_id, start_date, end_date, flow_intensity, symptoms, notes)
    - activities_sex (user_id, occurred_at, partner_id, protection_used, notes)
    - events_misc (user_id, category, cost, location, notes, occurred_at)
    - food_log (user_id, food_name, rating, location, cost, etc.)
    - tasks (user_id, title, status, etc.)
    - events (user_id, title, start_time, etc.)
    """
    # Security check: simple keyword blocking for modification commands
    forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE']
    if any(cmd in query.upper() for cmd in forbidden):
        return {"success": False, "error": "Only read-only queries are allowed."}
    
    pool = await get_db_pool()
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query)
            results = [dict(row) for row in rows]
            return {"success": True, "count": len(results), "results": results}
    except Exception as e:
        logger.error(f"Error running SQL: {e}")
        return {"success": False, "error": str(e)}

@tool
async def get_table_schema(
    table_name: str,
    schema: str = "public"
) -> Dict[str, Any]:
    """
    Get the schema for a specific table to help construct queries.
    """
    pool = await get_db_pool()
    query = """
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = $2;
    """
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, table_name, schema)
            results = [dict(row) for row in rows]
            return {"success": True, "schema": results}
    except Exception as e:
        logger.error(f"Error getting schema: {e}")
        return {"success": False, "error": str(e)}

@tool
async def list_tables(schema: str = "public") -> Dict[str, Any]:
    """List base tables in a given schema."""
    pool = await get_db_pool()
    query = """
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $1 AND table_type = 'BASE TABLE'
    ORDER BY table_name;
    """
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, schema)
            return {"success": True, "tables": [r["table_name"] for r in rows]}
    except Exception as e:
        logger.error(f"Error listing tables: {e}")
        return {"success": False, "error": str(e)}


@tool
async def insert_table_row(
    table_name: str,
    data: Dict[str, Any],
    schema: str = "public",
) -> Dict[str, Any]:
    """Insert a row into any table using provided column->value mapping."""
    if not table_name or not re.match(r"^[A-Za-z0-9_]+$", table_name):
        return {"success": False, "error": "Invalid table name"}
    if not isinstance(data, dict) or not data:
        return {"success": False, "error": "data must be a non-empty object"}

    pool = await get_db_pool()
    try:
        async with pool.acquire() as conn:
            cols_rows = await conn.fetch(
                """SELECT column_name FROM information_schema.columns
                    WHERE table_schema = $1 AND table_name = $2""",
                schema, table_name,
            )
            allowed_cols = {r["column_name"] for r in cols_rows}
            payload = {k: v for k, v in data.items() if k in allowed_cols}
            if not payload:
                return {"success": False, "error": "No columns match table schema"}

            cols = sorted(payload.keys())
            values = []
            for col in cols:
                val = payload[col]
                if isinstance(val, (dict, list)):
                    val = json.dumps(val)
                values.append(val)

            placeholders = ", ".join(f"${i+1}" for i in range(len(cols)))
            cols_sql = ", ".join(f'"{c}"' for c in cols)
            query = f'INSERT INTO "{schema}"."{table_name}" ({cols_sql}) VALUES ({placeholders}) RETURNING *;'
            row = await conn.fetchrow(query, *values)
            return {"success": True, "row": dict(row)}
    except Exception as e:
        logger.error(f"Error inserting into {table_name}: {e}")
        return {"success": False, "error": str(e)}
