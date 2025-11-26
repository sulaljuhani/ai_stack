"""
Bulk operations for reminders, with optional undo support.
"""

import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import timedelta
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger
from utils.redis_client import get_redis_client
from .reminders import VALID_STATUSES, DEFAULT_USER_ID, _normalize_remind_at
from .validation import validate_count, validate_duration_minutes

logger = get_logger(__name__)

UNDO_KEY_TEMPLATE = "reminder:undo:{user_id}"
UNDO_TTL_SECONDS = 3600  # 1 hour undo window


async def _store_undo_snapshot(user_id: str, action: str, reminders: List[Dict[str, Any]]) -> None:
    """Persist a snapshot of reminders before mutation to allow undo."""
    try:
        redis = await get_redis_client()
        key = UNDO_KEY_TEMPLATE.format(user_id=user_id)
        payload = json.dumps({
            "action": action,
            "reminders": reminders,
        }, default=str)
        await redis.lpush(key, payload)
        await redis.ltrim(key, 0, 4)  # keep last 5 actions
        await redis.expire(key, UNDO_TTL_SECONDS)
    except Exception as e:
        logger.warning(f"Failed to store undo snapshot: {e}")


async def _pop_undo_snapshot(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve and remove the most recent undo snapshot."""
    redis = await get_redis_client()
    key = UNDO_KEY_TEMPLATE.format(user_id=user_id)
    data = await redis.lpop(key)
    if not data:
        return None
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return None


def _validate_ids(reminder_ids: List[str]) -> Tuple[bool, Optional[str]]:
    if not reminder_ids:
        return False, "reminder_ids is required"
    is_valid, error = validate_count(len(reminder_ids), min_val=1, max_val=200)
    if not is_valid:
        return False, error
    return True, None


@tool
async def bulk_update_reminder_status(
    reminder_ids: List[str],
    new_status: str,
    user_id: str = DEFAULT_USER_ID,
    enable_undo: bool = True
) -> Dict[str, Any]:
    """
    Bulk update reminder statuses.

    Args:
        reminder_ids: List of reminder UUIDs
        new_status: New status value (pending, fired, completed, snoozed, cancelled)
        user_id: User identifier
        enable_undo: Persist snapshot to allow undo_last_reminder_action
    """
    is_valid_ids, id_error = _validate_ids(reminder_ids)
    if not is_valid_ids:
        return {"success": False, "error": id_error}

    if new_status not in VALID_STATUSES:
        return {"success": False, "error": f"Invalid status '{new_status}'"}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            # Fetch existing rows for undo
            if enable_undo:
                existing = await conn.fetch(
                    """
                    SELECT id, status, remind_at
                    FROM reminders
                    WHERE user_id = $1 AND id = ANY($2::uuid[])
                    """,
                    user_id, reminder_ids
                )
                await _store_undo_snapshot(
                    user_id,
                    action="status_update",
                    reminders=[dict(row) for row in existing],
                )

            updated = await conn.fetch(
                """
                UPDATE reminders
                SET status = $1, updated_at = NOW()
                WHERE user_id = $2 AND id = ANY($3::uuid[])
                RETURNING id, status, remind_at
                """,
                new_status, user_id, reminder_ids
            )

        return {
            "success": True,
            "updated_count": len(updated),
            "updated": [dict(row) for row in updated],
        }

    except Exception as e:
        logger.error(f"Error in bulk_update_reminder_status: {e}", exc_info=True)
        return {"success": False, "error": "Failed to update reminders"}


@tool
async def bulk_snooze_reminders(
    reminder_ids: List[str],
    snooze_minutes: int = 30,
    user_id: str = DEFAULT_USER_ID,
    enable_undo: bool = True
) -> Dict[str, Any]:
    """
    Snooze reminders by a given number of minutes and mark as snoozed.
    """
    is_valid_ids, id_error = _validate_ids(reminder_ids)
    if not is_valid_ids:
        return {"success": False, "error": id_error}

    is_valid_duration, duration_error = validate_duration_minutes(snooze_minutes)
    if not is_valid_duration:
        return {"success": False, "error": duration_error}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            if enable_undo:
                existing = await conn.fetch(
                    """
                    SELECT id, status, remind_at
                    FROM reminders
                    WHERE user_id = $1 AND id = ANY($2::uuid[])
                    """,
                    user_id, reminder_ids
                )
                await _store_undo_snapshot(
                    user_id,
                    action="snooze",
                    reminders=[dict(row) for row in existing],
                )

            updated = await conn.fetch(
                """
                UPDATE reminders
                SET remind_at = remind_at + ($1 || ' minutes')::interval,
                    status = 'snoozed',
                    updated_at = NOW()
                WHERE user_id = $2 AND id = ANY($3::uuid[])
                RETURNING id, status, remind_at
                """,
                snooze_minutes, user_id, reminder_ids
            )

        return {
            "success": True,
            "snoozed_count": len(updated),
            "snoozed": [dict(row) for row in updated],
        }

    except Exception as e:
        logger.error(f"Error in bulk_snooze_reminders: {e}", exc_info=True)
        return {"success": False, "error": "Failed to snooze reminders"}


@tool
async def bulk_delete_reminders(
    reminder_ids: List[str],
    user_id: str = DEFAULT_USER_ID,
    enable_undo: bool = True
) -> Dict[str, Any]:
    """
    Delete multiple reminders.
    """
    is_valid_ids, id_error = _validate_ids(reminder_ids)
    if not is_valid_ids:
        return {"success": False, "error": id_error}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            if enable_undo:
                existing = await conn.fetch(
                    """
                    SELECT
                        id, user_id, title, description, remind_at, priority,
                        category_id, is_recurring, recurrence_rule, status,
                        tags, completed_at, created_at, updated_at
                    FROM reminders
                    WHERE user_id = $1 AND id = ANY($2::uuid[])
                    """,
                    user_id, reminder_ids
                )
                await _store_undo_snapshot(
                    user_id,
                    action="delete",
                    reminders=[dict(row) for row in existing],
                )

            deleted = await conn.fetch(
                """
                DELETE FROM reminders
                WHERE user_id = $1 AND id = ANY($2::uuid[])
                RETURNING id
                """,
                user_id, reminder_ids
            )

        return {
            "success": True,
            "deleted_count": len(deleted),
            "deleted_ids": [str(row["id"]) for row in deleted],
        }

    except Exception as e:
        logger.error(f"Error in bulk_delete_reminders: {e}", exc_info=True)
        return {"success": False, "error": "Failed to delete reminders"}


@tool
async def undo_last_reminder_action(user_id: str = DEFAULT_USER_ID) -> Dict[str, Any]:
    """
    Undo the most recent bulk reminder action (status/snooze/delete).
    """
    snapshot = await _pop_undo_snapshot(user_id)
    if not snapshot:
        return {"success": False, "error": "No undo actions available"}

    action = snapshot.get("action")
    reminders = snapshot.get("reminders", [])

    if not reminders:
        return {"success": False, "error": "Undo snapshot was empty"}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            if action in {"status_update", "snooze"}:
                # Restore status/remind_at
                for rem in reminders:
                    await conn.execute(
                        """
                        UPDATE reminders
                        SET status = $1,
                            remind_at = $2,
                            updated_at = NOW()
                        WHERE user_id = $3 AND id = $4
                        """,
                        rem.get("status"),
                        _normalize_remind_at(rem.get("remind_at")) if rem.get("remind_at") else None,
                        user_id,
                        rem.get("id"),
                    )
            elif action == "delete":
                # Reinsert deleted reminders
                for rem in reminders:
                    await conn.execute(
                        """
                        INSERT INTO reminders (
                            id, user_id, title, description, remind_at, priority,
                            category_id, is_recurring, recurrence_rule, status,
                            tags, completed_at, created_at, updated_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6,
                            $7, $8, $9, $10,
                            $11, $12, $13, $14
                        )
                        ON CONFLICT (id) DO NOTHING
                        """,
                        rem.get("id"),
                        rem.get("user_id", user_id),
                        rem.get("title"),
                        rem.get("description"),
                        _normalize_remind_at(rem.get("remind_at")),
                        rem.get("priority", 1),
                        rem.get("category_id"),
                        rem.get("is_recurring", False),
                        rem.get("recurrence_rule"),
                        rem.get("status", "pending"),
                        rem.get("tags", []),
                        rem.get("completed_at"),
                        rem.get("created_at"),
                        rem.get("updated_at"),
                    )
            else:
                return {"success": False, "error": f"Unsupported undo action '{action}'"}

        return {"success": True, "restored": len(reminders), "action": action}

    except Exception as e:
        logger.error(f"Error undoing reminder action: {e}", exc_info=True)
        return {"success": False, "error": "Failed to undo last action"}
