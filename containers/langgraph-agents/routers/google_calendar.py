"""
Google Calendar API Router

Endpoints for calendar event CRUD operations.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Header
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from typing import Optional, List
import os

from services.google_calendar_sync import GoogleCalendarSyncService
from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class CreateEventRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    start_time: datetime
    end_time: datetime
    description: str = Field(default="")
    location: str = Field(default="")
    is_all_day: bool = Field(default=False)


class UpdateEventRequest(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None


@router.get("/api/calendar/calendars")
async def list_calendars():
    """
    List all available Google Calendars for the authenticated user.
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        result = await service.list_calendars()

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        return {
            "success": True,
            "calendars": result.get("calendars", [])
        }

    except Exception as e:
        logger.error(f"Failed to list calendars: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/calendar/sync")
async def trigger_calendar_sync(
    force_full: bool = False,
    calendar_ids: Optional[List[str]] = None
):
    """
    Manually trigger a calendar sync.

    Args:
        force_full: Force a full sync, ignoring sync tokens
        calendar_ids: List of calendar IDs to sync (default: ['primary'])
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        result = await service.sync(force_full=force_full, calendar_ids=calendar_ids)

        return {
            "success": result.get("success", False),
            "stats": {
                "fetched": result.get("fetched", 0),
                "created": result.get("created", 0),
                "updated": result.get("updated", 0),
                "deleted": result.get("deleted", 0),
                "local_pushed": result.get("local_pushed", 0),
                "calendars_synced": result.get("calendars_synced", [])
            },
            "error": result.get("error")
        }

    except Exception as e:
        logger.error(f"Failed to sync calendars: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/calendar/create")
async def create_calendar_event(
    request: CreateEventRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a new calendar event in Google Calendar and sync to local DB.
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        result = await service.create_event(
            title=request.title,
            start_time=request.start_time,
            end_time=request.end_time,
            description=request.description,
            location=request.location,
            is_all_day=request.is_all_day
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        # Trigger background sync
        background_tasks.add_task(service.sync, force_full=False)

        return {
            "success": True,
            "event": result["event"],
            "message": "Event created in Google Calendar"
        }

    except Exception as e:
        logger.error(f"Failed to create calendar event: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/calendar/events")
async def get_calendar_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Get calendar events from local database.

    Query params:
        start_date: ISO format date (default: 30 days ago)
        end_date: ISO format date (default: 90 days from now)
    """
    try:
        pool = await get_db_pool()

        # Default date range
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
        if not end_date:
            end_date = (datetime.utcnow() + timedelta(days=90)).isoformat()

        async with pool.acquire() as conn:
            events = await conn.fetch("""
                SELECT id, title, description, location, start_time, end_time,
                       is_all_day, recurrence_rule, attendees, status,
                       google_event_id, google_calendar_id, created_at, updated_at
                FROM events
                WHERE start_time >= $1 AND end_time <= $2
                  AND status != 'cancelled'
                ORDER BY start_time ASC
            """, start_date, end_date)

        return [dict(event) for event in events]

    except Exception as e:
        logger.error(f"Failed to fetch calendar events: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/calendar/events/{event_id}")
async def update_calendar_event(
    event_id: str,
    request: UpdateEventRequest,
    background_tasks: BackgroundTasks
):
    """
    Update an existing calendar event and push changes to Google Calendar.
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        # Prepare update kwargs
        update_kwargs = {}
        if request.title:
            update_kwargs['title'] = request.title
        if request.start_time:
            update_kwargs['start_time'] = request.start_time
        if request.end_time:
            update_kwargs['end_time'] = request.end_time
        if request.description is not None:
            update_kwargs['description'] = request.description
        if request.location is not None:
            update_kwargs['location'] = request.location

        if not update_kwargs:
            raise HTTPException(status_code=400, detail="No fields to update")

        # Update in Google Calendar and sync to local DB
        result = await service.update_event(event_id, **update_kwargs)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        return {
            "success": True,
            "message": "Event updated in Google Calendar",
            "event": result.get("event")
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update event: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str):
    """
    Delete a calendar event from Google Calendar and local DB.
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        # Delete from Google Calendar and mark as cancelled in local DB
        result = await service.delete_event(event_id)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        return {
            "success": True,
            "message": result.get("message", "Event deleted successfully")
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete event: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/calendar/webhook/setup")
async def setup_webhook(calendar_id: str = 'primary', webhook_url: Optional[str] = None):
    """
    Setup a webhook for real-time calendar updates.

    Args:
        calendar_id: The calendar ID to watch (default: 'primary')
        webhook_url: The webhook URL (optional, uses env variable if not provided)
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        result = await service.setup_webhook(calendar_id=calendar_id, webhook_url=webhook_url)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        return {
            "success": True,
            "channel_id": result.get("channel_id"),
            "expiration": result.get("expiration"),
            "message": "Webhook setup successful"
        }

    except Exception as e:
        logger.error(f"Failed to setup webhook: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/calendar/webhook/stop")
async def stop_webhook(calendar_id: str = 'primary'):
    """
    Stop a webhook channel for a calendar.

    Args:
        calendar_id: The calendar ID (default: 'primary')
    """
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)

        result = await service.stop_webhook(calendar_id=calendar_id)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        return {
            "success": True,
            "message": result.get("message", "Webhook stopped successfully")
        }

    except Exception as e:
        logger.error(f"Failed to stop webhook: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/calendar/webhook/notifications")
async def handle_webhook_notification(
    request: Request,
    x_goog_channel_id: Optional[str] = Header(None),
    x_goog_resource_state: Optional[str] = Header(None),
    x_goog_resource_id: Optional[str] = Header(None)
):
    """
    Receives webhook notifications from Google Calendar.

    This endpoint is called by Google when a calendar event changes.
    It triggers an incremental sync for the affected calendar.
    """
    try:
        # Log the notification
        logger.info(f"Webhook notification received: channel_id={x_goog_channel_id}, state={x_goog_resource_state}")

        # If it's a sync notification (not just a setup verification)
        if x_goog_resource_state == 'sync':
            # Initial sync message, acknowledge and return
            return {"success": True, "message": "Sync acknowledged"}

        if x_goog_resource_state in ['exists', 'not_exists']:
            # Event was created, updated, or deleted
            # Find which calendar this notification is for
            pool = await get_db_pool()

            async with pool.acquire() as conn:
                channel = await conn.fetchrow("""
                    SELECT calendar_id FROM calendar_webhook_channels
                    WHERE channel_id = $1
                """, x_goog_channel_id)

            if channel:
                calendar_id = channel['calendar_id']
                logger.info(f"Triggering incremental sync for calendar: {calendar_id}")

                # Trigger background sync for this calendar
                service = GoogleCalendarSyncService(pool)
                sync_result = await service.sync(force_full=False, calendar_ids=[calendar_id])

                return {
                    "success": True,
                    "message": "Sync triggered",
                    "stats": sync_result
                }
            else:
                logger.warning(f"Received notification for unknown channel: {x_goog_channel_id}")

        return {"success": True, "message": "Notification received"}

    except Exception as e:
        logger.error(f"Error handling webhook notification: {e}", exc_info=True)
        # Return 200 anyway to avoid Google retrying
        return {"success": False, "error": str(e)}
