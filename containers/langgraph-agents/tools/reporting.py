from typing import Dict, Any, Optional, List
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
    table_name: str
) -> Dict[str, Any]:
    """
    Get the schema for a specific table to help construct queries.
    """
    pool = await get_db_pool()
    query = """
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1;
    """
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, table_name)
            results = [dict(row) for row in rows]
            return {"success": True, "schema": results}
    except Exception as e:
        logger.error(f"Error getting schema: {e}")
        return {"success": False, "error": str(e)}
