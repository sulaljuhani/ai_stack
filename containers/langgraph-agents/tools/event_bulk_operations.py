"""
Bulk operations for calendar events.

Enables efficient batch operations on multiple events at once.
"""

from typing import List, Dict, Any, Optional, Tuple
import json
from datetime import datetime, timedelta
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger
from .validation import validate_count, validate_iso_datetime
from .database import normalize_due_date
from utils.redis_client import get_redis_client
from services.google_calendar_sync import GoogleCalendarSyncService

logger = get_logger(__name__)

USER_ID = "00000000-0000-0000-0000-000000000001"
UNDO_KEY_TEMPLATE = "events:undo:{user_id}"
UNDO_TTL_SECONDS = 3600


def _validate_user(user_id: str) -> Tuple[bool, Optional[str]]:
    if not user_id:
        return False, "user_id is required"
    if user_id != USER_ID:
        return False, "Unauthorized user_id"
    return True, None


def _validate_ids(event_ids: List[str]) -> Tuple[bool, Optional[str]]:
    if not event_ids:
        return False, "event_ids is required"
    is_valid, error = validate_count(len(event_ids), min_val=1, max_val=200)
    if not is_valid:
        return False, error
    return True, None


async def _store_event_snapshot(user_id: str, action: str, events: List[Dict[str, Any]]) -> None:
    try:
        redis = await get_redis_client()
        key = UNDO_KEY_TEMPLATE.format(user_id=user_id)
        payload = json.dumps({"action": action, "events": events}, default=str)
        await redis.lpush(key, payload)
        await redis.ltrim(key, 0, 4)
        await redis.expire(key, UNDO_TTL_SECONDS)
    except Exception as e:
        logger.warning(f"Failed to store event undo snapshot: {e}")


async def _pop_event_snapshot(user_id: str) -> Optional[Dict[str, Any]]:
    redis = await get_redis_client()
    key = UNDO_KEY_TEMPLATE.format(user_id=user_id)
    data = await redis.lpop(key)
    if not data:
        return None
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return None


@tool
async def bulk_create_events(
    events: List[Dict[str, Any]],
    user_id: str = USER_ID
) -> Dict[str, Any]:
    """
    Create multiple calendar events at once.

    Useful for scheduling multiple meetings, blocking time, or creating event series.

    Args:
        events: List of event dicts with title, start_time, end_time, description, location
        user_id: User identifier

    Example:
        events = [
            {"title": "Team Meeting", "start_time": "2025-01-15 09:00", "end_time": "2025-01-15 10:00"},
            {"title": "Client Call", "start_time": "2025-01-15 14:00", "end_time": "2025-01-15 15:00"},
        ]

    Returns:
        Success status and created event IDs
    """
    is_valid_user, user_error = _validate_user(user_id)
    if not is_valid_user:
        return {"success": False, "error": user_error}

    if not events:
        return {"success": False, "error": "events is required"}

    is_valid_user, user_error = _validate_user(user_id)
    if not is_valid_user:
        return {"success": False, "error": user_error}

    is_valid_ids, id_error = _validate_ids(event_ids)
    if not is_valid_ids:
        return {"success": False, "error": id_error}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            created = []

            for event_data in events:
                title = event_data.get("title")
                start_time = event_data.get("start_time")
                end_time = event_data.get("end_time")

                if not title or not start_time or not end_time:
                    continue

                description = event_data.get("description")
                location = event_data.get("location")
                attendees = event_data.get("attendees")
                tags = event_data.get("tags", [])
                status = event_data.get("status", "confirmed")
                conference_link = event_data.get("conference_link")

                result = await conn.fetchrow(
                    """
                    INSERT INTO events (
                        user_id, title, description, start_time, end_time,
                        location, attendees, tags, status, conference_link
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING id, title, start_time, end_time
                    """,
                    user_id, title, description, start_time, end_time,
                    location, attendees, tags, status, conference_link
                )

                created.append({
                    "id": str(result["id"]),
                    "title": result["title"],
                    "start_time": result["start_time"].isoformat(),
                    "end_time": result["end_time"].isoformat()
                })

            logger.info(f"Bulk created {len(created)} events")

            return {
                "success": True,
                "created_count": len(created),
                "events": created
            }

    except Exception as e:
        logger.error(f"Error bulk creating events: {e}")
        return {"success": False, "error": "Failed to bulk create events"}


@tool
async def bulk_update_event_status(
    event_ids: List[str],
    new_status: str,
    user_id: str = USER_ID,
    enable_undo: bool = True
) -> Dict[str, Any]:
    """
    Update status for multiple events at once.

    Useful for canceling meetings when sick, confirming multiple events, etc.

    Args:
        event_ids: List of event IDs
        new_status: New status (confirmed, tentative, cancelled)
        user_id: User identifier

    Returns:
        Success status and count updated
    """
    is_valid_user, user_error = _validate_user(user_id)
    if not is_valid_user:
        return {"success": False, "error": user_error}

    is_valid_ids, id_error = _validate_ids(event_ids)
    if not is_valid_ids:
        return {"success": False, "error": id_error}

    if new_status not in ["confirmed", "tentative", "cancelled"]:
        return {"success": False, "error": "Status must be confirmed, tentative, or cancelled"}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            if enable_undo:
                existing = await conn.fetch(
                    """
                    SELECT id, status FROM events
                    WHERE id = ANY($1::uuid[]) AND user_id = $2
                    """,
                    event_ids,
                    user_id
                )
                await _store_event_snapshot(user_id, "status", [dict(row) for row in existing])

            result = await conn.execute(
                """
                UPDATE events
                SET status = $1, updated_at = NOW()
                WHERE id = ANY($2) AND user_id = $3
                """,
                new_status,
                event_ids,
                user_id
            )

            count = int(result.split()[-1]) if result else 0

            logger.info(f"Bulk updated {count} events to status '{new_status}'")

            return {
                "success": True,
                "updated_count": count,
                "new_status": new_status
            }

    except Exception as e:
        logger.error(f"Error bulk updating event status: {e}")
        return {"success": False, "error": str(e)}


@tool
async def bulk_reschedule_events(
    event_ids: List[str],
    time_delta_minutes: int,
    user_id: str = USER_ID,
    enable_undo: bool = True
) -> Dict[str, Any]:
    """
    Shift multiple events by a time delta.

    Useful for moving meetings when schedule changes.

    Args:
        event_ids: List of event IDs
        time_delta_minutes: Minutes to shift (positive = later, negative = earlier)
        user_id: User identifier

    Examples:
        - Move events 1 hour later: time_delta_minutes=60
        - Move events 1 day earlier: time_delta_minutes=-1440

    Returns:
        Success status and count updated
    """
    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            if enable_undo:
                existing = await conn.fetch(
                    """
                    SELECT id, start_time, end_time
                    FROM events
                    WHERE id = ANY($1::uuid[]) AND user_id = $2
                    """,
                    event_ids,
                    user_id
                )
                await _store_event_snapshot(user_id, "reschedule", [dict(row) for row in existing])

            result = await conn.execute(
                """
                UPDATE events
                SET
                    start_time = start_time + ($1 || ' minutes')::INTERVAL,
                    end_time = end_time + ($1 || ' minutes')::INTERVAL,
                    updated_at = NOW()
                WHERE id = ANY($2) AND user_id = $3
                """,
                time_delta_minutes,
                event_ids,
                user_id
            )

            count = int(result.split()[-1]) if result else 0

            direction = "later" if time_delta_minutes > 0 else "earlier"
            hours = abs(time_delta_minutes) / 60

            logger.info(f"Bulk rescheduled {count} events {hours} hours {direction}")

            return {
                "success": True,
                "updated_count": count,
                "time_delta_minutes": time_delta_minutes,
                "time_delta_display": f"{hours} hours {direction}"
            }

    except Exception as e:
        logger.error(f"Error bulk rescheduling events: {e}")
        return {"success": False, "error": str(e)}


@tool
async def bulk_add_attendees(
    event_ids: List[str],
    attendees: List[Dict[str, str]],
    user_id: str = USER_ID,
    enable_undo: bool = True
) -> Dict[str, Any]:
    """
    Add attendees to multiple events at once.

    Useful for adding team members to multiple meetings.

    Args:
        event_ids: List of event IDs
        attendees: List of attendee dicts with email, name, status
        user_id: User identifier

    Example:
        attendees = [
            {"email": "sarah@company.com", "name": "Sarah", "status": "needs-action"},
            {"email": "mike@company.com", "name": "Mike", "status": "needs-action"}
        ]

    Returns:
        Success status and count updated
    """
    is_valid_user, user_error = _validate_user(user_id)
    if not is_valid_user:
        return {"success": False, "error": user_error}

    is_valid_ids, id_error = _validate_ids(event_ids)
    if not is_valid_ids:
        return {"success": False, "error": id_error}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            if enable_undo:
                existing = await conn.fetch(
                    "SELECT id, attendees FROM events WHERE id = ANY($1::uuid[]) AND user_id = $2",
                    event_ids,
                    user_id
                )
                await _store_event_snapshot(user_id, "attendees", [dict(row) for row in existing])

            # PERFORMANCE FIX: Batch query instead of N+1
            # Get all events in one query
            events = await conn.fetch(
                "SELECT id, attendees FROM events WHERE id = ANY($1::uuid[]) AND user_id = $2",
                event_ids,
                user_id
            )

            # Build update cases in-memory
            updates = []
            for event in events:
                # Merge attendees (avoid duplicates by email)
                current_attendees = event["attendees"] or []
                existing_emails = {a.get("email") for a in current_attendees if isinstance(a, dict)}

                merged_attendees = list(current_attendees)
                for attendee in attendees:
                    if attendee.get("email") not in existing_emails:
                        merged_attendees.append(attendee)

                updates.append((merged_attendees, event["id"]))

            # Bulk update using prepared statement
            count = 0
            if updates:
                # Use executemany for batch update
                await conn.executemany(
                    """
                    UPDATE events
                    SET attendees = $1, updated_at = NOW()
                    WHERE id = $2 AND user_id = $3
                    """,
                    [(attendees, event_id, user_id) for attendees, event_id in updates]
                )
                count = len(updates)

            logger.info(f"Bulk added attendees to {count} events")

            return {
                "success": True,
                "updated_count": count,
                "attendees_added": len(attendees)
            }

    except Exception as e:
        logger.error(f"Error bulk adding attendees: {e}")
        return {"success": False, "error": str(e)}


@tool
async def bulk_delete_events(
    event_ids: Optional[List[str]] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: str = USER_ID,
    enable_undo: bool = True
) -> Dict[str, Any]:
    """
    Delete multiple events at once.

    WARNING: This permanently deletes events. Consider using bulk_update_event_status
    with status='cancelled' instead.

    Args:
        event_ids: List of event IDs to delete
        user_id: User identifier

    Returns:
        Success status and count deleted
    """
    is_valid_user, user_error = _validate_user(user_id)
    if not is_valid_user:
        return {"success": False, "error": user_error}

    if not event_ids and not start_date and not end_date:
        return {"success": False, "error": "Provide event_ids or a date range"}

    def _normalize_dt(value: Optional[str | datetime]) -> Optional[datetime]:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.replace(tzinfo=None)
        parsed = normalize_due_date(value)
        return parsed.replace(tzinfo=None) if parsed else None

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            where_clauses = ["user_id = $1"]
            params = [user_id]
            param_count = 1

            start_dt = _normalize_dt(start_date)
            end_dt = _normalize_dt(end_date)

            if event_ids:
                param_count += 1
                params.append(event_ids)
                where_clauses.append(f"id = ANY(${param_count}::uuid[])")

            if start_dt:
                param_count += 1
                params.append(start_dt)
                where_clauses.append(f"start_time >= ${param_count}")

            if end_dt:
                param_count += 1
                params.append(end_dt)
                where_clauses.append(f"end_time <= ${param_count}")

            where_sql = " AND ".join(where_clauses)

            existing = await conn.fetch(
                f"""
                SELECT *
                FROM events
                WHERE {where_sql}
                """,
                *params
            )
            event_ids = [str(row["id"]) for row in existing]
            google_events = [
                {
                    "google_event_id": row.get("google_event_id"),
                    "google_calendar_id": row.get("google_calendar_id") or "primary",
                }
                for row in existing
                if row.get("google_event_id")
            ]

            if not event_ids:
                return {"success": False, "error": "No events matched the provided criteria"}

            is_valid_ids, id_error = _validate_ids(event_ids)
            if not is_valid_ids:
                return {"success": False, "error": id_error}

            if enable_undo:
                await _store_event_snapshot(user_id, "delete", [dict(row) for row in existing])

            result = await conn.execute(
                "DELETE FROM events WHERE id = ANY($1) AND user_id = $2",
                event_ids,
                user_id
            )

            count = int(result.split()[-1]) if result else 0
            google_deleted = 0

            # Propagate deletions to Google Calendar so they don't reappear on next sync
            try:
                google_service = GoogleCalendarSyncService(pool)
                if google_service.service and google_events:
                    for ge in google_events:
                        try:
                            google_service.service.events().delete(
                                calendarId=ge["google_calendar_id"],
                                eventId=ge["google_event_id"],
                                sendUpdates='all'
                            ).execute()
                            google_deleted += 1
                        except Exception as e:
                            logger.warning(f"Failed to delete Google event {ge['google_event_id']}: {e}")
            except Exception as e:
                logger.warning(f"Google deletion step failed: {e}")

            logger.warning(f"Bulk deleted {count} events")

            return {
                "success": True,
                "deleted_count": count,
                "google_deleted": google_deleted,
                "warning": "Events permanently deleted"
            }

    except Exception as e:
        logger.error(f"Error bulk deleting events: {e}")
        return {"success": False, "error": str(e)}


@tool
async def undo_last_event_action(user_id: str = USER_ID) -> Dict[str, Any]:
    """
    Undo the most recent bulk event action (status/reschedule/delete/attendees).
    """
    snapshot = await _pop_event_snapshot(user_id)
    if not snapshot:
        return {"success": False, "error": "No undo actions available"}

    action = snapshot.get("action")
    events = snapshot.get("events", [])
    if not events:
        return {"success": False, "error": "Undo snapshot empty"}

    pool = await get_db_pool()

    try:
        async with pool.acquire() as conn:
            if action == "status":
                for ev in events:
                    await conn.execute(
                        "UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
                        ev.get("status"),
                        ev.get("id"),
                        user_id
                    )
            elif action == "reschedule":
                for ev in events:
                    await conn.execute(
                        """
                        UPDATE events
                        SET start_time = $1, end_time = $2, updated_at = NOW()
                        WHERE id = $3 AND user_id = $4
                        """,
                        ev.get("start_time"),
                        ev.get("end_time"),
                        ev.get("id"),
                        user_id
                    )
            elif action == "attendees":
                for ev in events:
                    await conn.execute(
                        """
                        UPDATE events
                        SET attendees = $1, updated_at = NOW()
                        WHERE id = $2 AND user_id = $3
                        """,
                        ev.get("attendees"),
                        ev.get("id"),
                        user_id
                    )
            elif action == "delete":
                for ev in events:
                    await conn.execute(
                        """
                        INSERT INTO events (
                            id, user_id, title, description, start_time, end_time,
                            location, attendees, tags, status, conference_link,
                            created_at, updated_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6,
                            $7, $8, $9, $10, $11,
                            $12, $13
                        )
                        ON CONFLICT (id) DO NOTHING
                        """,
                        ev.get("id"),
                        user_id,
                        ev.get("title"),
                        ev.get("description"),
                        ev.get("start_time"),
                        ev.get("end_time"),
                        ev.get("location"),
                        ev.get("attendees"),
                        ev.get("tags"),
                        ev.get("status", "confirmed"),
                        ev.get("conference_link"),
                        ev.get("created_at"),
                        ev.get("updated_at"),
                    )
            else:
                return {"success": False, "error": f"Unsupported undo action '{action}'"}

        return {"success": True, "restored": len(events), "action": action}

    except Exception as e:
        logger.error(f"Error undoing event action: {e}", exc_info=True)
        return {"success": False, "error": "Failed to undo last event action"}
