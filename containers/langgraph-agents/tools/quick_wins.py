"""
Quick win tools for improved user experience.

These tools provide high-value convenience features.
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger
from .validation import (
    sanitize_string,
    validate_count,
    validate_iso_datetime,
)

logger = get_logger(__name__)

USER_ID = "00000000-0000-0000-0000-000000000001"


def _validate_user(user_id: str) -> Tuple[bool, Optional[str]]:
    """Ensure tools are scoped to the single supported user."""
    if not user_id:
        return False, "user_id is required"
    if user_id != USER_ID:
        return False, "Unauthorized user_id"
    return True, None


@tool
async def get_task_summary(user_id: str = USER_ID) -> Dict[str, Any]:
    """
    Get a comprehensive summary of the user's tasks.

    Provides quick overview of:
    - Total tasks by status
    - High priority items
    - Due today/tomorrow/this week
    - Overdue tasks
    - Available tasks (no blockers)

    Args:
        user_id: User identifier

    Returns:
        Comprehensive task summary

    Example:
        User: "What's on my plate today?"
        Agent: [Call get_task_summary] "You have 3 tasks due today..."
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error}

        async with pool.acquire() as conn:
            now = datetime.utcnow()
            today_end = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_end = today_end + timedelta(days=1)
            week_end = today_end + timedelta(days=7)

            # Total tasks by status
            status_counts = await conn.fetch(
                """
                SELECT status, COUNT(*) as count
                FROM tasks
                WHERE user_id = $1
                GROUP BY status
                """,
                user_id
            )

            # High priority tasks (not done)
            high_priority = await conn.fetch(
                """
                SELECT id, title, due_date, status
                FROM tasks
                WHERE user_id = $1 AND priority >= 3 AND status != 'done'
                ORDER BY priority DESC, due_date NULLS LAST
                LIMIT 5
                """,
                user_id
            )

            # Due today
            due_today = await conn.fetch(
                """
                SELECT id, title, priority, status
                FROM tasks
                WHERE user_id = $1 AND status != 'done'
                  AND due_date >= $2 AND due_date < $3
                ORDER BY priority DESC
                """,
                user_id, now, today_end
            )

            # Due tomorrow
            due_tomorrow = await conn.fetch(
                """
                SELECT id, title, priority
                FROM tasks
                WHERE user_id = $1 AND status != 'done'
                  AND due_date >= $2 AND due_date < $3
                ORDER BY priority DESC
                """,
                user_id, today_end, tomorrow_end
            )

            # Due this week
            due_this_week = await conn.fetchval(
                """
                SELECT COUNT(*)
                FROM tasks
                WHERE user_id = $1 AND status != 'done'
                  AND due_date >= $2 AND due_date < $3
                """,
                user_id, tomorrow_end, week_end
            )

            # Overdue
            overdue = await conn.fetch(
                """
                SELECT id, title, due_date, priority
                FROM tasks
                WHERE user_id = $1 AND status != 'done'
                  AND due_date < $2
                ORDER BY due_date, priority DESC
                LIMIT 10
                """,
                user_id, now
            )

            # Available tasks (no blockers)
            available = await conn.fetch(
                """
                SELECT id, title, priority, due_date
                FROM tasks
                WHERE user_id = $1 AND status = 'todo'
                  AND (depends_on IS NULL OR depends_on = '{}')
                ORDER BY priority DESC, due_date NULLS LAST
                LIMIT 10
                """,
                user_id
            )

            # Build summary
            summary = {
                "generated_at": now.isoformat(),
                "status_breakdown": {row["status"]: row["count"] for row in status_counts},
                "high_priority_count": len(high_priority),
                "high_priority_tasks": [
                    {
                        "title": row["title"],
                        "due_date": row["due_date"].isoformat() if row["due_date"] else None,
                        "status": row["status"]
                    }
                    for row in high_priority
                ],
                "due_today_count": len(due_today),
                "due_today": [
                    {
                        "title": row["title"],
                        "priority": row["priority"],
                        "status": row["status"]
                    }
                    for row in due_today
                ],
                "due_tomorrow_count": len(due_tomorrow),
                "due_tomorrow": [row["title"] for row in due_tomorrow],
                "due_this_week_count": due_this_week,
                "overdue_count": len(overdue),
                "overdue": [
                    {
                        "title": row["title"],
                        "due_date": row["due_date"].isoformat() if row["due_date"] else None,
                        "priority": row["priority"]
                    }
                    for row in overdue
                ],
                "available_to_work_count": len(available),
                "available_tasks": [
                    {
                        "title": row["title"],
                        "priority": row["priority"],
                        "due_date": row["due_date"].isoformat() if row["due_date"] else None
                    }
                    for row in available
                ]
            }

            return {"success": True, "summary": summary}

    except Exception as e:
        logger.error(f"Error getting task summary: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@tool
async def suggest_next_task(
    user_id: str = USER_ID,
    prefer_urgent: bool = True,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Suggest what task the user should work on next.

    Uses smart algorithm considering:
    - Task priority
    - Due dates (urgency)
    - Dependencies (what's available)
    - User context/preferences

    Args:
        user_id: User identifier
        prefer_urgent: Prioritize urgent tasks over high-priority tasks
        context: Optional context (e.g., "I have 2 hours", "quick tasks only")

    Returns:
        Suggested task with reasoning

    Example:
        User: "What should I work on next?"
        Agent: [Call suggest_next_task] "I suggest tackling 'Finish report' - it's high priority, due tomorrow..."
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error}

        sanitized_context = sanitize_string(context, max_length=500) if context else None

        async with pool.acquire() as conn:
            now = datetime.utcnow()
            tomorrow = now + timedelta(days=1)

            # Get available tasks (no blockers)
            available_tasks = await conn.fetch(
                """
                SELECT
                    id,
                    title,
                    description,
                    priority,
                    due_date,
                    tags,
                    metadata
                FROM tasks
                WHERE user_id = $1
                  AND status = 'todo'
                  AND (depends_on IS NULL OR depends_on = '{}')
                ORDER BY
                    CASE WHEN $2 THEN
                        CASE
                            WHEN due_date < $3 THEN 1  -- Overdue
                            WHEN due_date < $4 THEN 2  -- Due today/tomorrow
                            ELSE 3
                        END
                    ELSE priority
                    END,
                    priority DESC,
                    due_date NULLS LAST
                LIMIT 5
                """,
                user_id, prefer_urgent, now, tomorrow
            )

            if not available_tasks:
                # Check if user has tasks but all blocked
                blocked_count = await conn.fetchval(
                    """
                    SELECT COUNT(*)
                    FROM tasks
                    WHERE user_id = $1
                      AND status = 'todo'
                      AND depends_on IS NOT NULL
                      AND depends_on != '{}'
                    """,
                    user_id
                )

                if blocked_count > 0:
                    return {
                        "success": True,
                        "suggestion": None,
                        "reason": f"You have {blocked_count} tasks waiting on dependencies. Consider completing blocker tasks first.",
                        "blocked_count": blocked_count
                    }
                else:
                    return {
                        "success": True,
                        "suggestion": None,
                        "reason": "No pending tasks found. Great job staying on top of things!",
                        "blocked_count": 0
                    }

            # Take top suggestion
            top_task = available_tasks[0]

            # Build reasoning
            reasons = []
            if top_task["priority"] >= 3:
                reasons.append(f"high priority ({top_task['priority']}/4)")

            if top_task["due_date"]:
                if top_task["due_date"] < now:
                    reasons.append("overdue")
                elif top_task["due_date"] < tomorrow:
                    reasons.append("due soon")

            if len(reasons) == 0:
                reasons.append("available to work on")

            suggestion = {
                "task_id": str(top_task["id"]),
                "title": top_task["title"],
                "description": top_task["description"],
                "priority": top_task["priority"],
                "due_date": top_task["due_date"].isoformat() if top_task["due_date"] else None,
                "tags": top_task["tags"],
                "reason": f"This task is {', '.join(reasons)}",
                "context_used": sanitized_context,
                "alternatives_count": len(available_tasks) - 1,
                "alternatives": [
                    {"title": t["title"], "priority": t["priority"]}
                    for t in available_tasks[1:3]
                ]
            }

            return {"success": True, "suggestion": suggestion}

    except Exception as e:
        logger.error(f"Error suggesting next task: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@tool
async def time_block_planning(
    user_id: str = USER_ID,
    date: Optional[str] = None,
    work_hours: int = 8
) -> Dict[str, Any]:
    """
    Create a time-blocked plan for the day.

    Suggests how to schedule tasks throughout the day considering:
    - Task priorities and due dates
    - Estimated durations (from metadata if available)
    - Available work hours
    - Existing calendar events

    Args:
        user_id: User identifier
        date: Target date (ISO format, defaults to today)
        work_hours: Available work hours (default 8)

    Returns:
        Time-blocked schedule suggestion

    Example:
        User: "Help me plan my day"
        Agent: [Call time_block_planning] "Here's a suggested schedule: 9-11am: Finish report, 11am-12pm: Review PRs..."
    """
    pool = await get_db_pool()

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

        # Parse target date
        day_start = target_date.replace(hour=9, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(hours=int(work_hours))

        async with pool.acquire() as conn:
            # Get tasks due today or overdue
            tasks = await conn.fetch(
                """
                SELECT
                    id,
                    title,
                    priority,
                    due_date,
                    metadata,
                    depends_on
                FROM tasks
                WHERE user_id = $1
                  AND status = 'todo'
                  AND (
                      due_date < $2
                      OR (due_date >= $3 AND due_date < $4)
                  )
                ORDER BY
                    CASE WHEN due_date < $3 THEN 0 ELSE 1 END,  -- Overdue first
                    priority DESC,
                    due_date
                """,
                user_id,
                day_end,
                day_start,
                day_end
            )

            # Get calendar events for the day
            events = await conn.fetch(
                """
                SELECT start_time, end_time, title
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND start_time < $3
                  AND status != 'cancelled'
                ORDER BY start_time
                """,
                user_id, day_start, day_end
            )

            # Build time blocks
            time_blocks = []
            current_time = day_start

            # Add scheduled events first
            for event in events:
                if current_time < event["start_time"]:
                    # Add work block before event
                    time_blocks.append({
                        "type": "work",
                        "start": current_time.isoformat(),
                        "end": event["start_time"].isoformat(),
                        "duration_minutes": int((event["start_time"] - current_time).total_seconds() / 60)
                    })

                # Add event block
                time_blocks.append({
                    "type": "event",
                    "start": event["start_time"].isoformat(),
                    "end": event["end_time"].isoformat(),
                    "title": event["title"],
                    "duration_minutes": int((event["end_time"] - event["start_time"]).total_seconds() / 60)
                })

                current_time = event["end_time"]

            # Add remaining work time
            if current_time < day_end:
                time_blocks.append({
                    "type": "work",
                    "start": current_time.isoformat(),
                    "end": day_end.isoformat(),
                    "duration_minutes": int((day_end - current_time).total_seconds() / 60)
                })

            # Calculate available work minutes
            available_minutes = sum(
                block["duration_minutes"]
                for block in time_blocks
                if block["type"] == "work"
            )

            # Suggest task allocation
            task_allocations = []
            remaining_minutes = available_minutes

            for task in tasks:
                if remaining_minutes <= 0:
                    break

                # Check if task is available (no blockers)
                is_available = not task["depends_on"] or task["depends_on"] == []

                if not is_available:
                    continue

                # Estimate duration (from metadata or default)
                metadata = task["metadata"] or {}
                estimated_minutes_raw = metadata.get("estimated_minutes", 60) if isinstance(metadata, dict) else 60
                try:
                    estimated_minutes = int(estimated_minutes_raw)
                except (TypeError, ValueError):
                    estimated_minutes = 60  # Safe default

                # Cap between 15 minutes and remaining time
                estimated_minutes = max(15, min(estimated_minutes, remaining_minutes))

                task_allocations.append({
                    "title": task["title"],
                    "priority": task["priority"],
                    "estimated_minutes": estimated_minutes,
                    "is_overdue": task["due_date"] < day_start if task["due_date"] else False
                })

                remaining_minutes -= estimated_minutes

            return {
                "success": True,
                "date": day_start.isoformat(),
                "total_work_minutes": available_minutes,
                "scheduled_events_count": len([b for b in time_blocks if b["type"] == "event"]),
                "time_blocks": time_blocks,
                "suggested_tasks": task_allocations,
                "tasks_scheduled": len(task_allocations),
                "tasks_skipped": len(tasks) - len(task_allocations),
                "remaining_minutes": max(0, remaining_minutes)
            }

    except Exception as e:
        logger.error(f"Error creating time block plan: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
