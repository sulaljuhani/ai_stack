"""
Scheduling helper tools for finding available time slots.

Provides smart scheduling assistance and conflict checking.
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger
from .validation import (
    validate_business_hours,
    validate_count,
    validate_date_range,
    validate_duration_minutes,
    validate_iso_datetime,
)

logger = get_logger(__name__)

USER_ID = "00000000-0000-0000-0000-000000000001"


def _validate_user(user_id: str) -> Tuple[bool, Optional[str]]:
    """Ensure scheduling calls are scoped to the single supported user."""
    if not user_id:
        return False, "user_id is required"
    if user_id != USER_ID:
        return False, "Unauthorized user_id"
    return True, None


def is_business_hours(dt: datetime, start_hour: int = 9, end_hour: int = 17) -> bool:
    """
    Check if datetime is within business hours.

    Calendar context:
    - Week starts on Sunday (weekday() + 1) % 7 = 0
    - Weekend days are Friday (5) and Saturday (6)
    - Business days are Sunday (0) through Thursday (4)
    """
    # Convert Python weekday (Mon=0) to our calendar (Sun=0)
    calendar_weekday = (dt.weekday() + 1) % 7
    # Business days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu (exclude 5=Fri, 6=Sat)
    is_business_day = calendar_weekday not in [5, 6]
    return start_hour <= dt.hour < end_hour and is_business_day


@tool
async def find_available_slots(
    start_date: str,
    end_date: str,
    duration_minutes: int,
    user_id: str = USER_ID,
    business_hours_only: bool = True,
    business_start_hour: int = 9,
    business_end_hour: int = 17
) -> Dict[str, Any]:
    """
    Find available time slots in the calendar.

    Args:
        start_date: Start of search period (ISO format)
        end_date: End of search period (ISO format)
        duration_minutes: Required slot duration in minutes
        user_id: User identifier
        business_hours_only: Only search during business hours (default True)
        business_start_hour: Business day start (default 9)
        business_end_hour: Business day end (default 17)

    Returns:
        Dict with success flag and list of available time slots
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error, "slots": []}

        is_valid_duration, duration_error = validate_duration_minutes(duration_minutes)
        if not is_valid_duration:
            return {"success": False, "error": duration_error, "slots": []}

        is_valid_start, start_error = validate_iso_datetime(start_date)
        if not is_valid_start:
            return {"success": False, "error": start_error, "slots": []}

        is_valid_end, end_error = validate_iso_datetime(end_date)
        if not is_valid_end:
            return {"success": False, "error": end_error, "slots": []}

        is_valid_range, range_error = validate_date_range(start_date, end_date)
        if not is_valid_range:
            return {"success": False, "error": range_error, "slots": []}

        is_valid_hours, hours_error = validate_business_hours(business_start_hour, business_end_hour)
        if not is_valid_hours:
            return {"success": False, "error": hours_error, "slots": []}

        async with pool.acquire() as conn:
            events = await conn.fetch(
                """
                SELECT start_time, end_time
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND start_time < $3
                  AND status != 'cancelled'
                ORDER BY start_time
                """,
                user_id, start_date, end_date
            )

        busy_slots = []
        for event in events:
            busy_slots.append({
                "start": event["start_time"],
                "end": event["end_time"]
            })

        available = []
        current = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        slot_duration = timedelta(minutes=int(duration_minutes))

        while current + slot_duration <= end:
            if business_hours_only and not is_business_hours(current, business_start_hour, business_end_hour):
                current += timedelta(minutes=30)
                continue

            slot_end = current + slot_duration
            is_available = True

            for busy in busy_slots:
                if not (slot_end <= busy["start"] or current >= busy["end"]):
                    is_available = False
                    break

            if is_available:
                available.append({
                    "start": current.isoformat(),
                    "end": slot_end.isoformat()
                })

            current += timedelta(minutes=30)

        logger.info(f"Found {len(available)} available slots")
        return {"success": True, "slots": available, "count": len(available)}

    except Exception as e:
        logger.error(f"Error finding available slots: {e}", exc_info=True)
        return {"success": False, "error": "Failed to find available slots", "slots": []}


@tool
async def suggest_meeting_times(
    duration_minutes: int,
    user_id: str = USER_ID,
    days_ahead: int = 7,
    preferred_time: str = "morning",
    max_suggestions: int = 5
) -> Dict[str, Any]:
    """
    Suggest optimal meeting times based on calendar availability.

    Args:
        duration_minutes: Meeting duration in minutes
        user_id: User identifier
        days_ahead: How many days to look ahead (default 7)
        preferred_time: Preference (morning, afternoon, anytime)
        max_suggestions: Maximum suggestions to return

    Returns:
        Dict with success flag and suggested time slots with reasoning
    """
    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error, "suggestions": []}

        is_valid_duration, duration_error = validate_duration_minutes(duration_minutes)
        if not is_valid_duration:
            return {"success": False, "error": duration_error, "suggestions": []}

        is_valid_days, days_error = validate_count(days_ahead, min_val=1, max_val=30)
        if not is_valid_days:
            return {"success": False, "error": days_error, "suggestions": []}

        is_valid_max, max_error = validate_count(max_suggestions, min_val=1, max_val=20)
        if not is_valid_max:
            return {"success": False, "error": max_error, "suggestions": []}

        preferred_time_normalized = preferred_time.lower()
        if preferred_time_normalized not in {"morning", "afternoon", "anytime"}:
            return {
                "success": False,
                "error": "preferred_time must be morning, afternoon, or anytime",
                "suggestions": []
            }

        start_date = datetime.now().isoformat()
        end_date = (datetime.now() + timedelta(days=days_ahead)).isoformat()

        available_slots_result = await find_available_slots(
            start_date=start_date,
            end_date=end_date,
            duration_minutes=duration_minutes,
            user_id=user_id,
            business_hours_only=True
        )

        if not available_slots_result.get("success"):
            return {
                "success": False,
                "error": available_slots_result.get("error", "Failed to retrieve available slots"),
                "suggestions": []
            }

        available_slots = available_slots_result.get("slots", [])
        if not available_slots:
            return {"success": True, "suggestions": []}

        scored_slots = []

        for slot in available_slots:
            slot_start = datetime.fromisoformat(slot["start"])
            hour = slot_start.hour
            score = 0
            reasons = []

            if preferred_time_normalized == "morning" and 9 <= hour < 12:
                score += 10
                reasons.append("Morning slot as preferred")
            elif preferred_time_normalized == "afternoon" and 13 <= hour < 17:
                score += 10
                reasons.append("Afternoon slot as preferred")

            if hour < 9 or hour >= 16:
                score -= 5
                reasons.append("Outside prime hours")

            if slot_start.weekday() in [1, 2, 3]:
                score += 5
                reasons.append("Mid-week timing")

            scored_slots.append({
                "start": slot["start"],
                "end": slot["end"],
                "score": score,
                "day_of_week": slot_start.strftime("%A"),
                "time_of_day": "morning" if hour < 12 else "afternoon",
                "reasons": reasons
            })

        scored_slots.sort(key=lambda x: x["score"], reverse=True)

        suggestions = scored_slots[:max_suggestions]
        logger.info(f"Generated {len(suggestions)} meeting suggestions")
        return {"success": True, "suggestions": suggestions}

    except Exception as e:
        logger.error(f"Error suggesting meeting times: {e}", exc_info=True)
        return {"success": False, "error": "Failed to suggest meeting times", "suggestions": []}


@tool
async def bulk_check_conflicts(
    proposed_slots: List[Dict[str, str]],
    user_id: str = USER_ID
) -> Dict[str, Any]:
    """
    Check multiple proposed time slots for conflicts.

    Useful for meeting polls or finding which times work.

    Args:
        proposed_slots: List of slots with start and end times
        user_id: User identifier

    Example:
        proposed_slots = [
            {"start": "2025-01-15 09:00", "end": "2025-01-15 10:00"},
            {"start": "2025-01-15 14:00", "end": "2025-01-15 15:00"},
        ]

    Returns:
        Dict with success flag and results showing availability/conflicts
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error, "results": []}

        if not proposed_slots:
            return {"success": False, "error": "proposed_slots is required", "results": []}

        results = []

        async with pool.acquire() as conn:
            for idx, slot in enumerate(proposed_slots):
                start_time = slot.get("start")
                end_time = slot.get("end")

                if not start_time or not end_time:
                    return {
                        "success": False,
                        "error": f"Slot at index {idx} is missing start or end time",
                        "results": []
                    }

                is_valid_start, start_error = validate_iso_datetime(start_time)
                if not is_valid_start:
                    return {"success": False, "error": f"Slot {idx} start: {start_error}", "results": []}

                is_valid_end, end_error = validate_iso_datetime(end_time)
                if not is_valid_end:
                    return {"success": False, "error": f"Slot {idx} end: {end_error}", "results": []}

                is_valid_range, range_error = validate_date_range(start_time, end_time)
                if not is_valid_range:
                    return {"success": False, "error": f"Slot {idx}: {range_error}", "results": []}

                conflicts = await conn.fetch(
                    """
                    SELECT id, title, start_time, end_time
                    FROM events
                    WHERE user_id = $1
                      AND status != 'cancelled'
                      AND (
                          (start_time <= $2 AND end_time > $2)
                          OR (start_time < $3 AND end_time >= $3)
                          OR (start_time >= $2 AND end_time <= $3)
                      )
                    """,
                    user_id, start_time, end_time
                )

                conflict_list = []
                for conflict in conflicts:
                    conflict_list.append({
                        "id": str(conflict["id"]),
                        "title": conflict["title"],
                        "start": conflict["start_time"].isoformat(),
                        "end": conflict["end_time"].isoformat()
                    })

                results.append({
                    "slot_index": idx,
                    "proposed_start": start_time,
                    "proposed_end": end_time,
                    "available": len(conflict_list) == 0,
                    "conflict_count": len(conflict_list),
                    "conflicts": conflict_list
                })

        available_count = sum(1 for r in results if r["available"])
        logger.info(f"Checked {len(results)} slots: {available_count} available")

        return {"success": True, "results": results, "available_count": available_count}

    except Exception as e:
        logger.error(f"Error checking bulk conflicts: {e}", exc_info=True)
        return {"success": False, "error": "Failed to check conflicts", "results": []}


@tool
async def get_busy_free_times(
    start_date: str,
    end_date: str,
    user_id: str = USER_ID,
    granularity_minutes: int = 30
) -> Dict[str, Any]:
    """
    Get busy and free time blocks for a date range.

    Similar to Google Calendar's free/busy view.

    Args:
        start_date: Start of period (ISO format)
        end_date: End of period (ISO format)
        user_id: User identifier
        granularity_minutes: Time block size (default 30)

    Returns:
        Dict with success flag plus busy/free arrays of time blocks
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error, "busy": [], "free": []}

        is_valid_start, start_error = validate_iso_datetime(start_date)
        if not is_valid_start:
            return {"success": False, "error": start_error, "busy": [], "free": []}

        is_valid_end, end_error = validate_iso_datetime(end_date)
        if not is_valid_end:
            return {"success": False, "error": end_error, "busy": [], "free": []}

        is_valid_range, range_error = validate_date_range(start_date, end_date)
        if not is_valid_range:
            return {"success": False, "error": range_error, "busy": [], "free": []}

        is_valid_granularity, granularity_error = validate_duration_minutes(granularity_minutes)
        if not is_valid_granularity:
            return {"success": False, "error": granularity_error, "busy": [], "free": []}

        async with pool.acquire() as conn:
            events = await conn.fetch(
                """
                SELECT start_time, end_time, title
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND end_time <= $3
                  AND status != 'cancelled'
                ORDER BY start_time
                """,
                user_id, start_date, end_date
            )

        busy_blocks = []
        for event in events:
            busy_blocks.append({
                "start": event["start_time"].isoformat(),
                "end": event["end_time"].isoformat(),
                "title": event["title"]
            })

        free_blocks = []

        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        if not busy_blocks:
            free_blocks.append({
                "start": start_dt.isoformat(),
                "end": end_dt.isoformat()
            })
        else:
            first_event_start = datetime.fromisoformat(busy_blocks[0]["start"])
            if start_dt < first_event_start:
                free_blocks.append({
                    "start": start_dt.isoformat(),
                    "end": first_event_start.isoformat()
                })

            for i in range(len(busy_blocks) - 1):
                current_end = datetime.fromisoformat(busy_blocks[i]["end"])
                next_start = datetime.fromisoformat(busy_blocks[i + 1]["start"])

                if current_end < next_start:
                    free_blocks.append({
                        "start": current_end.isoformat(),
                        "end": next_start.isoformat()
                    })

            last_event_end = datetime.fromisoformat(busy_blocks[-1]["end"])
            if last_event_end < end_dt:
                free_blocks.append({
                    "start": last_event_end.isoformat(),
                    "end": end_dt.isoformat()
                })

        result = {
            "period": {
                "start": start_date,
                "end": end_date
            },
            "busy": busy_blocks,
            "free": free_blocks,
            "summary": {
                "total_busy_blocks": len(busy_blocks),
                "total_free_blocks": len(free_blocks),
                "granularity_minutes": int(granularity_minutes)
            }
        }

        logger.info(f"Generated busy/free report: {len(busy_blocks)} busy, {len(free_blocks)} free")
        return {"success": True, **result}

    except Exception as e:
        logger.error(f"Error getting busy/free times: {e}", exc_info=True)
        return {"success": False, "error": "Failed to get busy/free times", "busy": [], "free": []}


@tool
async def smart_schedule_day(
    user_id: str = USER_ID,
    date: Optional[str] = None,
    work_hours: int = 8,
    max_tasks: int = 5
) -> Dict[str, Any]:
    """
    Create a smart day schedule by combining calendar events and top tasks.

    Args:
        user_id: User identifier
        date: Target date (ISO). Defaults to today.
        work_hours: Workday length (1-16 hours)
        max_tasks: Maximum tasks to schedule
    """
    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error}

        if date:
            is_valid_date, date_error = validate_iso_datetime(date)
            if not is_valid_date:
                return {"success": False, "error": date_error}
            target_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
        else:
            target_date = datetime.utcnow()

        is_valid_hours, hours_error = validate_count(work_hours, min_val=1, max_val=16)
        if not is_valid_hours:
            return {"success": False, "error": hours_error}

        is_valid_max, max_error = validate_count(max_tasks, min_val=1, max_val=20)
        if not is_valid_max:
            return {"success": False, "error": max_error}

        day_start = target_date.replace(hour=9, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(hours=int(work_hours))

        pool = await get_db_pool()

        async with pool.acquire() as conn:
            events = await conn.fetch(
                """
                SELECT title, start_time, end_time
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND start_time < $3
                  AND status != 'cancelled'
                ORDER BY start_time
                """,
                user_id, day_start, day_end
            )

            tasks = await conn.fetch(
                """
                SELECT id, title, priority, due_date, metadata, depends_on
                FROM tasks
                WHERE user_id = $1
                  AND status = 'todo'
                  AND (depends_on IS NULL OR depends_on = '{}')
                ORDER BY priority DESC, due_date NULLS LAST
                LIMIT $2
                """,
                user_id, max_tasks
            )

        # Build busy blocks from events
        blocks: List[Dict[str, Any]] = []
        current = day_start

        for event in events:
            event_start = event["start_time"]
            event_end = event["end_time"]

            if current < event_start:
                blocks.append({
                    "type": "work",
                    "start": current.isoformat(),
                    "end": event_start.isoformat(),
                    "duration_minutes": int((event_start - current).total_seconds() / 60)
                })

            blocks.append({
                "type": "event",
                "title": event["title"],
                "start": event_start.isoformat(),
                "end": event_end.isoformat(),
                "duration_minutes": int((event_end - event_start).total_seconds() / 60)
            })

            current = event_end

        if current < day_end:
            blocks.append({
                "type": "work",
                "start": current.isoformat(),
                "end": day_end.isoformat(),
                "duration_minutes": int((day_end - current).total_seconds() / 60)
            })

        # Allocate tasks into work blocks
        schedule: List[Dict[str, Any]] = []
        task_index = 0

        for block in blocks:
            if block["type"] == "event":
                schedule.append(block)
                continue

            available_minutes = block["duration_minutes"]
            start_pointer = datetime.fromisoformat(block["start"])

            while available_minutes > 0 and task_index < len(tasks):
                task = tasks[task_index]
                metadata = task["metadata"] or {}
                estimated_raw = metadata.get("estimated_minutes", 60) if isinstance(metadata, dict) else 60
                try:
                    estimated = int(estimated_raw)
                except (TypeError, ValueError):
                    estimated = 60

                estimated = max(15, min(estimated, available_minutes))

                end_pointer = start_pointer + timedelta(minutes=estimated)
                schedule.append({
                    "type": "task",
                    "task_id": str(task["id"]),
                    "title": task["title"],
                    "priority": task["priority"],
                    "start": start_pointer.isoformat(),
                    "end": end_pointer.isoformat(),
                    "duration_minutes": estimated,
                    "is_due_today": bool(task["due_date"] and task["due_date"].date() == day_start.date()),
                })

                available_minutes -= estimated
                start_pointer = end_pointer
                task_index += 1

            if available_minutes > 0:
                schedule.append({
                    "type": "buffer",
                    "start": start_pointer.isoformat(),
                    "end": (start_pointer + timedelta(minutes=available_minutes)).isoformat(),
                    "duration_minutes": available_minutes,
                })

        return {
            "success": True,
            "date": day_start.date().isoformat(),
            "work_hours": int(work_hours),
            "scheduled_items": schedule,
            "tasks_scheduled": task_index,
            "tasks_remaining": max(0, len(tasks) - task_index),
        }

    except Exception as e:
        logger.error(f"Error building smart schedule: {e}", exc_info=True)
        return {"success": False, "error": "Failed to build smart schedule"}
