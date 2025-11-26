"""
Advanced search and analytics for calendar events.

Leverages full-text search, JSONB queries, and aggregations.
"""

import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from langchain_core.tools import tool
from utils.db import get_db_pool
from utils.logging import get_logger
from .validation import (
    sanitize_string,
    validate_count,
    validate_date_range,
    validate_email,
    validate_iso_datetime,
)

logger = get_logger(__name__)

USER_ID = "00000000-0000-0000-0000-000000000001"


def _validate_user(user_id: str) -> Tuple[bool, Optional[str]]:
    """Ensure calls are scoped to the single supported user."""
    if not user_id:
        return False, "user_id is required"
    if user_id != USER_ID:
        return False, "Unauthorized user_id"
    return True, None


def _validate_limit(limit: int, max_limit: int = 100) -> Tuple[bool, Optional[str], int]:
    """Validate and normalize limit/count values."""
    is_valid, error = validate_count(limit, min_val=1, max_val=max_limit)
    if not is_valid:
        return False, error, limit
    return True, None, int(limit)


@tool
async def search_by_attendees(
    attendee_emails: List[str],
    user_id: str = USER_ID,
    match_all: bool = False,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Find events by attendee email addresses.

    Args:
        attendee_emails: List of email addresses to search for
        user_id: User identifier
        match_all: If True, event must have ALL attendees. If False, ANY attendee.
        limit: Maximum results (default 20, max 100)

    Examples:
        - Find events with John: ["john@company.com"]
        - Find events with both Sarah AND Mike: ["sarah@", "mike@"], match_all=True

    Returns:
        Dict with success flag and matching events with attendee details
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error, "results": []}

        is_valid_limit, limit_error, normalized_limit = _validate_limit(limit, max_limit=100)
        if not is_valid_limit:
            return {"success": False, "error": limit_error, "results": []}

        if not attendee_emails:
            return {"success": False, "error": "attendee_emails is required", "results": []}

        validated_emails = []
        email_params = []
        for email in attendee_emails:
            sanitized_email = sanitize_string(email, max_length=254)
            if not sanitized_email:
                return {
                    "success": False,
                    "error": "Attendee email cannot be empty",
                    "results": []
                }
            is_valid_email, email_error = validate_email(sanitized_email)
            if not is_valid_email:
                return {
                    "success": False,
                    "error": f"Invalid attendee email '{email}': {email_error}",
                    "results": []
                }
            validated_emails.append(sanitized_email)
            email_params.append(json.dumps([{"email": sanitized_email}]))

        async with pool.acquire() as conn:
            if match_all:
                conditions = []
                params = [user_id]

                for email_json in email_params:
                    param_idx = len(params) + 1
                    conditions.append(f"attendees @> ${param_idx}::jsonb")
                    params.append(email_json)

                where_clause = " AND ".join(conditions) if conditions else "TRUE"
                params.append(normalized_limit)

                query = f"""
                    SELECT
                        id, title, description, start_time, end_time,
                        location, attendees, status
                    FROM events
                    WHERE user_id = $1 AND {where_clause}
                    ORDER BY start_time ASC
                    LIMIT ${len(params)}
                """
            else:
                query = """
                    SELECT DISTINCT
                        e.id, e.title, e.description, e.start_time, e.end_time,
                        e.location, e.attendees, e.status
                    FROM events e,
                         jsonb_array_elements(e.attendees) AS attendee
                    WHERE e.user_id = $1
                      AND attendee->>'email' = ANY($2)
                    ORDER BY e.start_time ASC
                    LIMIT $3
                """
                params = [user_id, validated_emails, normalized_limit]

            rows = await conn.fetch(query, *params)

            results = []
            for row in rows:
                results.append({
                    "id": str(row["id"]),
                    "title": row["title"],
                    "description": row["description"],
                    "start_time": row["start_time"].isoformat(),
                    "end_time": row["end_time"].isoformat(),
                    "location": row["location"],
                    "attendees": row["attendees"],
                    "status": row["status"]
                })

            logger.info(f"Found {len(results)} events with attendees")
            return {"success": True, "results": results, "count": len(results)}

    except Exception as e:
        logger.error(f"Error searching by attendees: {e}", exc_info=True)
        return {"success": False, "error": "Failed to search attendees", "results": []}


@tool
async def search_by_location(
    location_query: str,
    user_id: str = USER_ID,
    include_conference_links: bool = True,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Find events by location or conference link.

    Args:
        location_query: Location search term (supports partial matches)
        user_id: User identifier
        include_conference_links: Also search conference_link field
        limit: Maximum results (default 20)

    Examples:
        - "Conference Room A" - finds all events in that room
        - "Zoom" - finds all Zoom meetings
        - "Downtown" - finds events at downtown locations

    Returns:
        Dict with success flag and matching events
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error, "results": []}

        sanitized_location = sanitize_string(location_query, max_length=255)
        if not sanitized_location:
            return {"success": False, "error": "location_query is required", "results": []}

        is_valid_limit, limit_error, normalized_limit = _validate_limit(limit, max_limit=100)
        if not is_valid_limit:
            return {"success": False, "error": limit_error, "results": []}

        pattern = f"%{sanitized_location}%"

        async with pool.acquire() as conn:
            if include_conference_links:
                query = """
                    SELECT
                        id, title, start_time, end_time, location,
                        conference_link, attendees, status
                    FROM events
                    WHERE user_id = $1
                      AND (location ILIKE $2 OR conference_link ILIKE $2)
                      AND status != 'cancelled'
                    ORDER BY start_time ASC
                    LIMIT $3
                """
            else:
                query = """
                    SELECT
                        id, title, start_time, end_time, location,
                        conference_link, attendees, status
                    FROM events
                    WHERE user_id = $1
                      AND location ILIKE $2
                      AND status != 'cancelled'
                    ORDER BY start_time ASC
                    LIMIT $3
                """

            rows = await conn.fetch(query, user_id, pattern, normalized_limit)

        results = []
        for row in rows:
            results.append({
                "id": str(row["id"]),
                "title": row["title"],
                "start_time": row["start_time"].isoformat(),
                "end_time": row["end_time"].isoformat(),
                "location": row["location"],
                "conference_link": row["conference_link"],
                "attendees_count": len(row["attendees"]) if row["attendees"] else 0,
                "status": row["status"]
            })

        logger.info(f"Found {len(results)} events matching location '{sanitized_location}'")
        return {"success": True, "results": results, "count": len(results)}

    except Exception as e:
        logger.error(f"Error searching by location: {e}", exc_info=True)
        return {"success": False, "error": "Failed to search by location", "results": []}


@tool
async def advanced_event_filter(
    user_id: str = USER_ID,
    status: Optional[List[str]] = None,
    tags: Optional[List[str]] = None,
    has_attendees: Optional[bool] = None,
    has_location: Optional[bool] = None,
    is_all_day: Optional[bool] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    location_contains: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Advanced multi-criteria event filtering.

    Supports complex queries with multiple filters.

    Args:
        user_id: User identifier
        status: Filter by status (confirmed, tentative, cancelled)
        tags: Filter by tags (event must have ANY of these tags)
        has_attendees: Filter events with/without attendees
        has_location: Filter events with/without location
        is_all_day: Filter all-day events
        start_date: Events starting after this date (ISO format)
        end_date: Events starting before this date (ISO format)
        location_contains: Location text search
        limit: Maximum results (default 50, max 100)

    Returns:
        Dict with success flag and matching events
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error, "results": []}

        is_valid_limit, limit_error, normalized_limit = _validate_limit(limit, max_limit=100)
        if not is_valid_limit:
            return {"success": False, "error": limit_error, "results": []}

        allowed_statuses = {"confirmed", "tentative", "cancelled"}
        if status:
            invalid_statuses = [s for s in status if s not in allowed_statuses]
            if invalid_statuses:
                return {
                    "success": False,
                    "error": f"Invalid status values: {', '.join(invalid_statuses)}",
                    "results": []
                }

        sanitized_tags = [t for t in (sanitize_string(tag, max_length=50) for tag in tags)] if tags else []
        sanitized_tags = [t for t in sanitized_tags if t]

        if start_date:
            is_valid_start, start_error = validate_iso_datetime(start_date)
            if not is_valid_start:
                return {"success": False, "error": start_error, "results": []}

        if end_date:
            is_valid_end, end_error = validate_iso_datetime(end_date)
            if not is_valid_end:
                return {"success": False, "error": end_error, "results": []}

        if start_date and end_date:
            is_valid_range, range_error = validate_date_range(start_date, end_date)
            if not is_valid_range:
                return {"success": False, "error": range_error, "results": []}

        sanitized_location = sanitize_string(location_contains, max_length=255) if location_contains else None

        conditions = ["user_id = $1"]
        params = [user_id]
        param_idx = 2

        if status:
            conditions.append(f"status = ANY(${param_idx})")
            params.append(status)
            param_idx += 1

        if sanitized_tags:
            conditions.append(f"tags && ${param_idx}")
            params.append(sanitized_tags)
            param_idx += 1

        if has_attendees is not None:
            if has_attendees:
                conditions.append("attendees IS NOT NULL AND jsonb_array_length(attendees) > 0")
            else:
                conditions.append("(attendees IS NULL OR jsonb_array_length(attendees) = 0)")

        if has_location is not None:
            if has_location:
                conditions.append("location IS NOT NULL AND location != ''")
            else:
                conditions.append("(location IS NULL OR location = '')")

        if is_all_day is not None:
            conditions.append(f"is_all_day = ${param_idx}")
            params.append(is_all_day)
            param_idx += 1

        if start_date:
            conditions.append(f"start_time >= ${param_idx}")
            params.append(start_date)
            param_idx += 1

        if end_date:
            conditions.append(f"start_time <= ${param_idx}")
            params.append(end_date)
            param_idx += 1

        if sanitized_location:
            conditions.append(f"location ILIKE ${param_idx}")
            params.append(f"%{sanitized_location}%")
            param_idx += 1

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT
                id, title, description, start_time, end_time,
                location, attendees, status, tags, is_all_day
            FROM events
            WHERE {where_clause}
            ORDER BY start_time ASC
            LIMIT ${param_idx}
        """
        params.append(normalized_limit)

        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)

        results = []
        for row in rows:
            results.append({
                "id": str(row["id"]),
                "title": row["title"],
                "description": row["description"],
                "start_time": row["start_time"].isoformat(),
                "end_time": row["end_time"].isoformat(),
                "location": row["location"],
                "attendees_count": len(row["attendees"]) if row["attendees"] else 0,
                "status": row["status"],
                "tags": row["tags"],
                "is_all_day": row["is_all_day"]
            })

        logger.info(f"Advanced filter found {len(results)} events")
        return {"success": True, "results": results, "count": len(results)}

    except Exception as e:
        logger.error(f"Error in advanced event filter: {e}", exc_info=True)
        return {"success": False, "error": "Failed to run advanced event filter", "results": []}


@tool
async def get_event_statistics(
    user_id: str = USER_ID,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get comprehensive statistics about calendar events.

    Args:
        user_id: User identifier
        start_date: Start of analysis period (default: 30 days ago)
        end_date: End of analysis period (default: today)

    Returns:
        Dict with success flag and statistics payload
    """
    pool = await get_db_pool()

    try:
        is_valid_user, user_error = _validate_user(user_id)
        if not is_valid_user:
            return {"success": False, "error": user_error}

        if start_date:
            is_valid_start, start_error = validate_iso_datetime(start_date)
            if not is_valid_start:
                return {"success": False, "error": start_error}
        if end_date:
            is_valid_end, end_error = validate_iso_datetime(end_date)
            if not is_valid_end:
                return {"success": False, "error": end_error}
        if start_date and end_date:
            is_valid_range, range_error = validate_date_range(start_date, end_date)
            if not is_valid_range:
                return {"success": False, "error": range_error}

        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).isoformat()
        if not end_date:
            end_date = datetime.now().isoformat()

        async with pool.acquire() as conn:
            totals = await conn.fetchrow(
                """
                SELECT
                    COUNT(*) as total_events,
                    SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) as total_hours,
                    AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) as avg_minutes
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND start_time <= $3
                  AND status != 'cancelled'
                """,
                user_id, start_date, end_date
            )

            by_status = await conn.fetch(
                """
                SELECT status, COUNT(*) as count
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND start_time <= $3
                GROUP BY status
                ORDER BY count DESC
                """,
                user_id, start_date, end_date
            )

            by_day = await conn.fetch(
                """
                SELECT
                    TO_CHAR(start_time, 'Day') as day_name,
                    COUNT(*) as count
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND start_time <= $3
                  AND status != 'cancelled'
                GROUP BY TO_CHAR(start_time, 'Day'), EXTRACT(DOW FROM start_time)
                ORDER BY EXTRACT(DOW FROM start_time)
                """,
                user_id, start_date, end_date
            )

            by_location = await conn.fetch(
                """
                SELECT location, COUNT(*) as count
                FROM events
                WHERE user_id = $1
                  AND start_time >= $2
                  AND start_time <= $3
                  AND status != 'cancelled'
                  AND location IS NOT NULL
                  AND location != ''
                GROUP BY location
                ORDER BY count DESC
                LIMIT 10
                """,
                user_id, start_date, end_date
            )

        result = {
            "period": {
                "start": start_date,
                "end": end_date
            },
            "totals": {
                "total_events": int(totals["total_events"] or 0),
                "total_hours": round(float(totals["total_hours"] or 0), 1),
                "avg_meeting_minutes": round(float(totals["avg_minutes"] or 0), 1)
            },
            "by_status": {row["status"]: int(row["count"]) for row in by_status},
            "by_day_of_week": {row["day_name"].strip(): int(row["count"]) for row in by_day},
            "by_location": {row["location"]: int(row["count"]) for row in by_location}
        }

        if result["by_day_of_week"]:
            result["busiest_day"] = max(
                result["by_day_of_week"],
                key=result["by_day_of_week"].get
            )
        else:
            result["busiest_day"] = None

        logger.info(f"Generated event statistics: {result['totals']['total_events']} events")
        return {"success": True, "statistics": result}

    except Exception as e:
        logger.error(f"Error getting event statistics: {e}", exc_info=True)
        return {"success": False, "error": "Failed to calculate event statistics"}
