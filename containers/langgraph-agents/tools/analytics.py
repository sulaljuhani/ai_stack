"""
Analytics and insights tools for tasks, reminders, and events.
"""

from datetime import datetime, timedelta
from typing import Dict, Any
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger
from .validation import validate_count

logger = get_logger(__name__)

USER_ID = "00000000-0000-0000-0000-000000000001"


def _validate_lookback(lookback_days: int) -> tuple[bool, str | None, int]:
    is_valid, error = validate_count(lookback_days, min_val=1, max_val=365)
    if not is_valid:
        return False, error, lookback_days
    return True, None, int(lookback_days)


@tool
async def task_insights(user_id: str = USER_ID, lookback_days: int = 30) -> Dict[str, Any]:
    """
    Get task productivity insights for a lookback period (default 30 days).
    """
    valid, error, lookback = _validate_lookback(lookback_days)
    if not valid:
        return {"success": False, "error": error}

    start = datetime.utcnow() - timedelta(days=lookback)
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            status_counts = await conn.fetch(
                """
                SELECT status, COUNT(*) as count
                FROM tasks
                WHERE user_id = $1 AND created_at >= $2
                GROUP BY status
                """,
                user_id, start
            )

            completed = await conn.fetchval(
                """
                SELECT COUNT(*) FROM tasks
                WHERE user_id = $1 AND status = 'done' AND completed_at >= $2
                """,
                user_id, start
            )

            overdue = await conn.fetchval(
                """
                SELECT COUNT(*) FROM tasks
                WHERE user_id = $1 AND status != 'done' AND due_date IS NOT NULL AND due_date < NOW()
                """,
                user_id
            )

            upcoming = await conn.fetchval(
                """
                SELECT COUNT(*) FROM tasks
                WHERE user_id = $1 AND status != 'done' AND due_date >= NOW() AND due_date < NOW() + INTERVAL '7 days'
                """,
                user_id
            )

        status_map = {row["status"]: row["count"] for row in status_counts}
        open_tasks = status_map.get("todo", 0) + status_map.get("in_progress", 0)
        completion_rate = round(completed / max(1, (completed + open_tasks)), 3)

        return {
            "success": True,
            "period_start": start.isoformat(),
            "status_counts": status_map,
            "completed_last_period": completed,
            "overdue": int(overdue or 0),
            "due_next_7_days": int(upcoming or 0),
            "completion_rate": completion_rate,
        }

    except Exception as e:
        logger.error(f"Error generating task insights: {e}", exc_info=True)
        return {"success": False, "error": "Failed to generate task insights"}


@tool
async def reminder_insights(user_id: str = USER_ID, lookback_days: int = 30) -> Dict[str, Any]:
    """
    Get reminder insights for a lookback period (default 30 days).
    """
    valid, error, lookback = _validate_lookback(lookback_days)
    if not valid:
        return {"success": False, "error": error}

    start = datetime.utcnow() - timedelta(days=lookback)
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            status_counts = await conn.fetch(
                """
                SELECT status, COUNT(*) as count
                FROM reminders
                WHERE user_id = $1 AND created_at >= $2
                GROUP BY status
                """,
                user_id, start
            )

            fired_recent = await conn.fetchval(
                """
                SELECT COUNT(*) FROM reminders
                WHERE user_id = $1 AND status = 'fired' AND remind_at >= $2
                """,
                user_id, start
            )

            snoozed = await conn.fetchval(
                """
                SELECT COUNT(*) FROM reminders
                WHERE user_id = $1 AND status = 'snoozed'
                """,
                user_id
            )

        status_map = {row["status"]: row["count"] for row in status_counts}
        return {
            "success": True,
            "period_start": start.isoformat(),
            "status_counts": status_map,
            "fired_last_period": int(fired_recent or 0),
            "snoozed": int(snoozed or 0),
        }

    except Exception as e:
        logger.error(f"Error generating reminder insights: {e}", exc_info=True)
        return {"success": False, "error": "Failed to generate reminder insights"}


@tool
async def event_insights(user_id: str = USER_ID, lookback_days: int = 30) -> Dict[str, Any]:
    """
    Summarize calendar activity for a lookback period (default 30 days).
    """
    valid, error, lookback = _validate_lookback(lookback_days)
    if not valid:
        return {"success": False, "error": error}

    start = datetime.utcnow() - timedelta(days=lookback)
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            counts = await conn.fetchrow(
                """
                SELECT
                    COUNT(*) as total,
                    SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) as hours
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND status != 'cancelled'
                """,
                user_id, start
            )

            by_status = await conn.fetch(
                """
                SELECT status, COUNT(*) as count
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                GROUP BY status
                """,
                user_id, start
            )

        return {
            "success": True,
            "period_start": start.isoformat(),
            "total_events": int(counts["total"] or 0),
            "total_hours": round(float(counts["hours"] or 0), 1),
            "status_counts": {row["status"]: row["count"] for row in by_status},
        }

    except Exception as e:
        logger.error(f"Error generating event insights: {e}", exc_info=True)
        return {"success": False, "error": "Failed to generate event insights"}
