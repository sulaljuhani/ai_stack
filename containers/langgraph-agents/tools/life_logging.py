from typing import Dict, Any, Optional, List
from datetime import datetime
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)

@tool
async def log_menstrual_cycle(
    start_date: str,
    user_id: str = "00000000-0000-0000-0000-000000000001",
    end_date: Optional[str] = None,
    flow_intensity: Optional[str] = None,
    symptoms: Optional[List[str]] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Log or update a menstrual cycle entry.
    start_date: YYYY-MM-DD
    end_date: YYYY-MM-DD (optional)
    flow_intensity: "Light", "Medium", "Heavy" (optional)
    symptoms: List of strings e.g. ["Cramps", "Headache"] (optional)
    """
    pool = await get_db_pool()
    
    query = """
    INSERT INTO menstrual_cycles (user_id, start_date, end_date, flow_intensity, symptoms, notes)
    VALUES ($1, $2::date, $3::date, $4, $5::jsonb, $6)
    RETURNING id;
    """
    import json
    symptoms_json = json.dumps(symptoms) if symptoms else '[]'
    
    try:
        async with pool.acquire() as conn:
            result = await conn.fetchrow(query, user_id, start_date, end_date, flow_intensity, symptoms_json, notes)
            return {"success": True, "id": str(result['id']), "message": f"Logged menstrual cycle starting {start_date}"}
    except Exception as e:
        logger.error(f"Error logging menstrual cycle: {e}")
        return {"success": False, "error": str(e)}

@tool
async def log_intimate_activity(
    user_id: str = "00000000-0000-0000-0000-000000000001",
    partner_id: Optional[str] = None,
    protection_used: Optional[bool] = None,
    notes: Optional[str] = None,
    occurred_at: Optional[str] = None
) -> Dict[str, Any]:
    """
    Log an intimate activity/sex.
    occurred_at: ISO timestamp (defaults to now)
    """
    pool = await get_db_pool()
    query = """
    INSERT INTO activities_sex (user_id, partner_id, protection_used, notes, occurred_at)
    VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()))
    RETURNING id;
    """
    try:
        async with pool.acquire() as conn:
            result = await conn.fetchrow(query, user_id, partner_id, protection_used, notes, occurred_at)
            return {"success": True, "id": str(result['id']), "message": "Logged intimate activity"}
    except Exception as e:
        logger.error(f"Error logging intimate activity: {e}")
        return {"success": False, "error": str(e)}

@tool
async def log_misc_event(
    category: str,
    user_id: str = "00000000-0000-0000-0000-000000000001",
    cost: Optional[float] = None,
    location: Optional[str] = None,
    notes: Optional[str] = None,
    occurred_at: Optional[str] = None
) -> Dict[str, Any]:
    """
    Log a miscellaneous life event like "Haircut", "Dentist", etc.
    category: The type of event (e.g. "Haircut")
    cost: The cost if any
    """
    pool = await get_db_pool()
    query = """
    INSERT INTO events_misc (user_id, category, cost, location, notes, occurred_at)
    VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()))
    RETURNING id;
    """
    try:
        async with pool.acquire() as conn:
            result = await conn.fetchrow(query, user_id, category, cost, location, notes, occurred_at)
            return {"success": True, "id": str(result['id']), "message": f"Logged {category}"}
    except Exception as e:
        logger.error(f"Error logging misc event: {e}")
        return {"success": False, "error": str(e)}
