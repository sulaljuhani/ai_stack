"""
Google Calendar Agent Tools

LangChain tools for AI agents to manipulate calendar events.
"""

from langchain.tools import tool
from datetime import datetime, timedelta
from typing import Dict, Any
import os

from services.google_calendar_sync import GoogleCalendarSyncService
from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)


@tool
async def create_calendar_event(
    title: str,
    start_time: str,
    end_time: str,
    description: str = "",
    location: str = ""
) -> str:
    """
    Create a new calendar event in Google Calendar.

    This tool creates events in Google Calendar which sync to all devices.

    Args:
        title: Event title (required)
        start_time: Start time in ISO format (e.g., "2025-12-01T14:00:00")
        end_time: End time in ISO format
        description: Optional event description
        location: Optional location (address, place name, etc.)

    Returns:
        JSON string with event details or error

    Examples:
        - create_calendar_event("Team Meeting", "2025-12-01T14:00:00", "2025-12-01T15:00:00")
        - create_calendar_event("Dentist Appointment", "2025-12-05T10:00:00", "2025-12-05T11:00:00", location="123 Main St")
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        start_dt = datetime.fromisoformat(start_time)
        end_dt = datetime.fromisoformat(end_time)

        result = await service.create_event(
            title=title,
            start_time=start_dt,
            end_time=end_dt,
            description=description,
            location=location
        )

        if result.get("success"):
            event = result["event"]
            return f'{{"success": true, "event_id": "{event["google_event_id"]}", "title": "{title}"}}'
        else:
            return f'{{"success": false, "error": "{result.get("error")}"}}'

    except Exception as e:
        logger.error(f"Agent tool create_calendar_event failed: {e}", exc_info=True)
        return f'{{"success": false, "error": "{str(e)}"}}'


@tool
async def get_upcoming_events(days_ahead: int = 7) -> str:
    """
    Get upcoming calendar events for the next N days.

    Args:
        days_ahead: Number of days to look ahead (default: 7)

    Returns:
        JSON string with list of events

    Examples:
        - get_upcoming_events() → Next 7 days
        - get_upcoming_events(30) → Next 30 days
    """
    try:
        pool = await get_db_pool()

        start_time = datetime.utcnow()
        end_time = start_time + timedelta(days=days_ahead)

        async with pool.acquire() as conn:
            events = await conn.fetch("""
                SELECT title, start_time, end_time, location, description
                FROM events
                WHERE start_time >= $1 AND start_time <= $2
                  AND status != 'cancelled'
                ORDER BY start_time ASC
                LIMIT 50
            """, start_time, end_time)

        events_list = [
            {
                "title": e["title"],
                "start": e["start_time"].isoformat(),
                "end": e["end_time"].isoformat(),
                "location": e.get("location", "")
            }
            for e in events
        ]

        return f'{{"success": true, "count": {len(events_list)}, "events": {str(events_list)}}}'

    except Exception as e:
        logger.error(f"Agent tool get_upcoming_events failed: {e}", exc_info=True)
        return f'{{"success": false, "error": "{str(e)}"}}'


@tool
async def find_free_time(
    date: str,
    duration_minutes: int = 60,
    start_hour: int = 9,
    end_hour: int = 17
) -> str:
    """
    Find available time slots on a given date.

    Args:
        date: Date in YYYY-MM-DD format
        duration_minutes: Required duration in minutes (default: 60)
        start_hour: Start of work day (default: 9)
        end_hour: End of work day (default: 17)

    Returns:
        JSON string with available time slots

    Examples:
        - find_free_time("2025-12-01") → Find 1-hour slots on Dec 1
        - find_free_time("2025-12-05", 30, 8, 20) → 30-min slots, 8am-8pm
    """
    try:
        pool = await get_db_pool()

        target_date = datetime.fromisoformat(date)
        day_start = target_date.replace(hour=start_hour, minute=0, second=0)
        day_end = target_date.replace(hour=end_hour, minute=0, second=0)

        # Get all events on that date
        async with pool.acquire() as conn:
            events = await conn.fetch("""
                SELECT start_time, end_time
                FROM events
                WHERE DATE(start_time) = $1
                  AND status != 'cancelled'
                ORDER BY start_time ASC
            """, target_date.date())

        # Find gaps between events
        free_slots = []
        current_time = day_start

        for event in events:
            event_start = event["start_time"]
            event_end = event["end_time"]

            # If there's a gap before this event
            if current_time < event_start:
                gap_duration = (event_start - current_time).total_seconds() / 60
                if gap_duration >= duration_minutes:
                    free_slots.append({
                        "start": current_time.isoformat(),
                        "end": event_start.isoformat(),
                        "duration_minutes": int(gap_duration)
                    })

            current_time = max(current_time, event_end)

        # Check for gap after last event
        if current_time < day_end:
            gap_duration = (day_end - current_time).total_seconds() / 60
            if gap_duration >= duration_minutes:
                free_slots.append({
                    "start": current_time.isoformat(),
                    "end": day_end.isoformat(),
                    "duration_minutes": int(gap_duration)
                })

        return f'{{"success": true, "date": "{date}", "free_slots": {str(free_slots)}}}'

    except Exception as e:
        logger.error(f"Agent tool find_free_time failed: {e}", exc_info=True)
        return f'{{"success": false, "error": "{str(e)}"}}'
