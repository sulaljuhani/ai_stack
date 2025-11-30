"""
Service for bidirectional synchronization between local DB and Google Calendar.

- Fetches events from Google Calendar
- Creates, updates, and deletes events in local DB
- Pushes local changes (creates, updates, deletes) to Google Calendar
- Manages sync tokens to avoid full scans
"""

import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
import json
import uuid
from config import settings

from googleapiclient.discovery import build, Resource
from google.oauth2.credentials import Credentials
from asyncpg.pool import Pool

from .google_auth import GoogleCalendarAuth
from utils.logging import get_logger

logger = get_logger(__name__)

class GoogleCalendarSyncService:
    """Manages the synchronization of events with Google Calendar."""

    def __init__(self, pool: Pool, user_id: str = settings.default_user_id):
        """
        Initializes the sync service.

        Args:
            pool: Database connection pool.
            user_id: The user for whom to sync (for multi-user support in future).
        """
        self.pool = pool
        self.user_id = user_id
        self.auth = GoogleCalendarAuth()
        self.service = self._get_calendar_service()

    def _get_calendar_service(self) -> Optional[Resource]:
        """Builds and returns the Google Calendar API service resource."""
        creds = self.auth.authenticate()
        if not creds:
            logger.error("Failed to authenticate with Google Calendar. Sync will be skipped.")
            return None
        try:
            return build('calendar', 'v3', credentials=creds, cache_discovery=False)
        except Exception as e:
            logger.error(f"Failed to build Google Calendar service: {e}", exc_info=True)
            return None

    async def list_calendars(self) -> Dict[str, Any]:
        """
        Lists all calendars available in the user's Google Calendar account.

        Returns:
            Dictionary with success status and list of calendars
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        try:
            calendars = []
            page_token = None

            while True:
                calendar_list = self.service.calendarList().list(
                    pageToken=page_token
                ).execute()

                for calendar in calendar_list.get('items', []):
                    calendars.append({
                        'id': calendar['id'],
                        'name': calendar['summary'],
                        'description': calendar.get('description', ''),
                        'backgroundColor': calendar.get('backgroundColor', '#3b82f6'),
                        'foregroundColor': calendar.get('foregroundColor', '#ffffff'),
                        'primary': calendar.get('primary', False),
                        'accessRole': calendar.get('accessRole', 'reader')
                    })

                page_token = calendar_list.get('nextPageToken')
                if not page_token:
                    break

            logger.info(f"Found {len(calendars)} calendars in Google Calendar")
            return {"success": True, "calendars": calendars}

        except Exception as e:
            logger.error(f"Failed to list Google Calendars: {e}", exc_info=True)
            return {"success": False, "error": str(e)}

    async def sync(self, force_full: bool = False, calendar_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Performs a bidirectional sync for one or more calendars.

        1. Fetches remote changes from Google Calendar.
        2. Applies remote changes to the local database.
        3. Pushes local changes to Google Calendar.

        Args:
            force_full: If True, ignores sync token and performs a full sync.
            calendar_ids: List of calendar IDs to sync (default: ['primary'])

        Returns:
            A dictionary summarizing the sync results.
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        if not calendar_ids:
            calendar_ids = ['primary']

        logger.info(f"Starting Google Calendar sync for {len(calendar_ids)} calendars...")
        results = {
            "success": True,
            "fetched": 0,
            "created": 0,
            "updated": 0,
            "deleted": 0,
            "local_pushed": 0,
            "reminders_pushed": 0,
            "calendars_synced": [],
            "error": None
        }

        try:
            # Sync each calendar
            for calendar_id in calendar_ids:
                try:
                    # Step 1: Fetch and apply remote changes
                    remote_sync_result = await self._sync_from_google(
                        calendar_id=calendar_id,
                        force_full=force_full
                    )
                    results["fetched"] += remote_sync_result.get("fetched", 0)
                    results["created"] += remote_sync_result.get("created", 0)
                    results["updated"] += remote_sync_result.get("updated", 0)
                    results["deleted"] += remote_sync_result.get("deleted", 0)
                    results["calendars_synced"].append(calendar_id)

                except Exception as e:
                    logger.error(f"Failed to sync calendar {calendar_id}: {e}")
                    continue

            # Step 2: Push local changes to Google Calendar (only to primary for now)
            local_sync_result = await self._sync_to_google('primary')
            results["local_pushed"] = local_sync_result.get("pushed", 0)

            # Step 3: Push reminders to Google Calendar
            reminders_sync_result = await self._sync_reminders_to_google('primary')
            results["reminders_pushed"] = reminders_sync_result.get("pushed", 0)

        except Exception as e:
            logger.error(f"An error occurred during Google Calendar sync: {e}", exc_info=True)
            results["success"] = False
            results["error"] = str(e)

        logger.info(f"Google Calendar sync finished. Results: {results}")
        return results

    async def _get_sync_token(self, calendar_id: str) -> Optional[str]:
        """Retrieves the sync token for a calendar from the database."""
        async with self.pool.acquire() as conn:
            return await conn.fetchval(
                "SELECT sync_token FROM calendar_sync_state WHERE calendar_id = $1",
                calendar_id
            )

    async def _save_sync_token(self, calendar_id: str, sync_token: str):
        """Saves or updates the sync token for a calendar."""
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO calendar_sync_state (calendar_id, sync_token, last_sync_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (calendar_id) DO UPDATE
                SET sync_token = $2, last_sync_at = NOW();
                """,
                calendar_id, sync_token
            )

    async def _sync_to_google(self, calendar_id: str = 'primary') -> Dict[str, Any]:
        """
        Pushes local events that haven't been synced to Google Calendar yet.

        This handles events created locally (with source='manual' or source='agent')
        that don't have a google_event_id yet.

        Args:
            calendar_id: The Google Calendar ID to sync to (default: 'primary')

        Returns:
            Dictionary with sync statistics
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available.", "pushed": 0}

        pushed_count = 0

        try:
            # Find local events that haven't been synced to Google Calendar
            async with self.pool.acquire() as conn:
                local_events = await conn.fetch("""
                    SELECT id, title, description, location, start_time, end_time,
                           is_all_day, status
                    FROM events
                    WHERE user_id = $1
                      AND (google_event_id IS NULL OR google_event_id = '')
                      AND status != 'cancelled'
                      AND source IN ('manual', 'agent')
                    ORDER BY created_at ASC
                    LIMIT 100
                """, self.user_id)

            logger.info(f"Found {len(local_events)} local events to push to Google Calendar")

            for event in local_events:
                try:
                    # Prepare event body for Google Calendar
                    event_body = {
                        'summary': event['title'],
                        'description': event.get('description', ''),
                        'location': event.get('location', ''),
                        'start': {
                            'dateTime': event['start_time'].isoformat(),
                            'timeZone': 'UTC',
                        },
                        'end': {
                            'dateTime': event['end_time'].isoformat(),
                            'timeZone': 'UTC',
                        },
                        'reminders': {
                            'useDefault': True,
                        },
                    }

                    # Create event in Google Calendar
                    created_event = self.service.events().insert(
                        calendarId=calendar_id,
                        body=event_body,
                        sendUpdates='none'  # Don't send notifications for bulk sync
                    ).execute()

                    # Update local event with Google event ID
                    async with self.pool.acquire() as conn:
                        await conn.execute("""
                            UPDATE events
                            SET google_event_id = $1,
                                google_calendar_id = $2,
                                google_sync_at = NOW(),
                                source = 'google'
                            WHERE id = $3
                        """, created_event['id'], calendar_id, event['id'])

                    pushed_count += 1
                    logger.info(f"Pushed local event to Google Calendar: {event['title']} -> {created_event['id']}")

                except Exception as e:
                    logger.error(f"Failed to push event {event['id']} to Google Calendar: {e}")
                    continue

            return {"success": True, "pushed": pushed_count}

        except Exception as e:
            logger.error(f"Error in _sync_to_google: {e}", exc_info=True)
            return {"success": False, "error": str(e), "pushed": pushed_count}

    async def _sync_reminders_to_google(self, calendar_id: str = 'primary') -> Dict[str, Any]:
        """
        Push reminders to Google Calendar as short events (DB is source of truth).

        Reminders are tagged with extendedProperties.private.source='reminder' so
        event sync can ignore them when pulling from Google.
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available.", "pushed": 0}

        pushed = 0
        failed = 0

        try:
            async with self.pool.acquire() as conn:
                reminders = await conn.fetch(
                    """
                    SELECT id, title, description, remind_at, timezone,
                           google_event_id, google_calendar_id, updated_at, google_sync_at
                    FROM reminders
                    WHERE user_id = $1
                      AND is_completed = FALSE
                      AND (google_event_id IS NULL OR updated_at > COALESCE(google_sync_at, 'epoch'))
                    """,
                    self.user_id
                )

            for reminder in reminders:
                remind_at = reminder["remind_at"]
                tz = reminder["timezone"] or "UTC"
                end_time = remind_at + timedelta(minutes=15)  # short duration block

                body = {
                    "summary": reminder["title"],
                    "description": reminder.get("description") or "",
                    "start": {"dateTime": remind_at.isoformat(), "timeZone": tz},
                    "end": {"dateTime": end_time.isoformat(), "timeZone": tz},
                    "extendedProperties": {
                        "private": {
                            "source": "reminder",
                            "local_id": str(reminder["id"]),
                        }
                    }
                }

                google_event_id = reminder.get("google_event_id")

                try:
                    if google_event_id:
                        updated = self.service.events().update(
                            calendarId=reminder.get("google_calendar_id") or calendar_id,
                            eventId=google_event_id,
                            body=body,
                            sendUpdates='none'
                        ).execute()
                    else:
                        updated = self.service.events().insert(
                            calendarId=calendar_id,
                            body=body,
                            sendUpdates='none'
                        ).execute()

                    google_id = updated.get("id")
                    async with self.pool.acquire() as conn:
                        await conn.execute(
                            """
                            UPDATE reminders
                            SET google_event_id = $1,
                                google_calendar_id = $2,
                                google_sync_at = NOW()
                            WHERE id = $3
                            """,
                            google_id,
                            calendar_id,
                            reminder["id"]
                        )
                    pushed += 1
                except Exception as e:
                    failed += 1
                    logger.warning(f"Failed to sync reminder {reminder['id']} to Google: {e}")

            return {"success": failed == 0, "pushed": pushed, "failed": failed}

        except Exception as e:
            logger.error(f"Error syncing reminders to Google: {e}", exc_info=True)
            return {"success": False, "error": str(e), "pushed": pushed, "failed": failed}

    async def _sync_from_google(self, calendar_id: str = 'primary', force_full: bool = False) -> Dict[str, Any]:
        """Fetches updates from a single Google Calendar and applies them locally."""
        sync_token = await self._get_sync_token(calendar_id)
        if force_full or not sync_token:
            logger.info(f"Performing full sync for calendar: {calendar_id}")
            sync_token = None

        page_token = None
        created_count = 0
        updated_count = 0
        deleted_count = 0

        while True:
            try:
                events_resource = self.service.events()
                request = events_resource.list(
                    calendarId=calendar_id,
                    pageToken=page_token,
                    syncToken=sync_token,
                    showDeleted=True
                )
                events_result = request.execute()
                
            except Exception as e:
                if '410' in str(e): # Sync token is invalid
                    logger.warning("Sync token is invalid. Clearing token and forcing full sync.")
                    await self._save_sync_token(calendar_id, None)
                    return await self._sync_from_google(calendar_id, force_full=True)
                else:
                    raise e
            
            items = events_result.get('items', [])
            for event_data in items:
                # Skip events that were created to mirror local reminders
                ext_props = event_data.get('extendedProperties', {}).get('private', {}) if event_data.get('extendedProperties') else {}
                if ext_props.get('source') == 'reminder':
                    logger.debug(f"Skipping reminder mirror event {event_data.get('id')} in event sync")
                    continue

                status = event_data.get('status')
                if status == 'cancelled':
                    deleted_count += await self._handle_deleted_event(event_data)
                else:
                    is_new = await self._handle_updated_event(calendar_id, event_data)
                    if is_new:
                        created_count += 1
                    else:
                        updated_count += 1

            page_token = events_result.get('nextPageToken')
            if not page_token:
                next_sync_token = events_result.get('nextSyncToken')
                await self._save_sync_token(calendar_id, next_sync_token)
                break
        
        return {
            "fetched": created_count + updated_count + deleted_count,
            "created": created_count,
            "updated": updated_count,
            "deleted": deleted_count,
        }
    
    def _parse_google_event(self, calendar_id: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parses a Google Calendar API event resource into a database-compatible dictionary."""
        start = event_data.get('start', {})
        end = event_data.get('end', {})

        # Get organizer email
        organizer_data = event_data.get('organizer', {})
        organizer_email = organizer_data.get('email', '')

        # Parse datetime strings to datetime objects
        is_all_day = 'date' in start

        if is_all_day:
            # All-day events use 'date' field (YYYY-MM-DD)
            start_time = datetime.fromisoformat(start['date'] + 'T00:00:00')
            end_time = datetime.fromisoformat(end['date'] + 'T23:59:59')
        else:
            # Timed events use 'dateTime' field (ISO 8601)
            start_time_str = start.get('dateTime')
            end_time_str = end.get('dateTime')

            # Parse ISO 8601 datetime strings (remove timezone info for now)
            if start_time_str:
                # Convert to datetime object, removing timezone
                start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00')).replace(tzinfo=None)
            else:
                start_time = datetime.now()

            if end_time_str:
                end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00')).replace(tzinfo=None)
            else:
                end_time = start_time

        return {
            "google_event_id": event_data['id'],
            "google_calendar_id": calendar_id,
            "title": event_data.get('summary', 'No Title'),
            "description": event_data.get('description', ''),
            "location": event_data.get('location', ''),
            "start_time": start_time,
            "end_time": end_time,
            "is_all_day": is_all_day,
            "status": event_data['status'],
            "attendees": json.dumps(event_data.get('attendees', [])),
            "organizer": organizer_email,
            "recurrence_rule": '\n'.join(event_data.get('recurrence', [])) if event_data.get('recurrence') else None,
            "conference_data": json.dumps(event_data.get('conferenceData')) if event_data.get('conferenceData') else None,
            "color_id": event_data.get('colorId'),
            "visibility": event_data.get('visibility', 'default'),
            "hangout_link": event_data.get('hangoutLink'),
            "source": 'google',
        }

    async def _handle_updated_event(self, calendar_id: str, event_data: Dict[str, Any]) -> bool:
        """
        Creates or updates an event in the local database based on Google Calendar data.
        Returns True if the event was created, False if updated.
        """
        parsed_event = self._parse_google_event(calendar_id, event_data)

        async with self.pool.acquire() as conn:
            # Check if event exists
            existing_event_id = await conn.fetchval(
                "SELECT id FROM events WHERE google_event_id = $1",
                parsed_event['google_event_id']
            )

            if existing_event_id:
                # Update existing event
                update_fields = ", ".join([f"{key} = ${i+2}" for i, key in enumerate(parsed_event.keys())])
                query = f"UPDATE events SET {update_fields}, updated_at = NOW() WHERE id = $1"
                await conn.execute(query, existing_event_id, *parsed_event.values())
                return False
            else:
                # Insert new event - need to add user_id
                user_id = self.user_id

                # Add user_id to parsed_event
                parsed_event_with_user = {"user_id": user_id, **parsed_event}

                columns = ", ".join(parsed_event_with_user.keys())
                placeholders = ", ".join([f"${i+1}" for i in range(len(parsed_event_with_user))])
                query = f"INSERT INTO events ({columns}) VALUES ({placeholders})"
                await conn.execute(query, *parsed_event_with_user.values())
                return True

    async def _handle_deleted_event(self, event_data: Dict[str, Any]) -> int:
        """
        Marks an event as 'cancelled' in the local database. Returns 1 if updated, 0 if not found.
        """
        google_event_id = event_data['id']
        async with self.pool.acquire() as conn:
            result = await conn.execute(
                "UPDATE events SET status = 'cancelled' WHERE google_event_id = $1 AND status != 'cancelled'",
                google_event_id
            )
            return 1 if result.endswith('1') else 0

    async def create_event(self, **kwargs) -> Dict[str, Any]:
        """
        Creates an event in Google Calendar and then syncs it to the local DB.
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        # Prepare event body
        event_body = {
            'summary': kwargs.get('title'),
            'location': kwargs.get('location'),
            'description': kwargs.get('description'),
            'start': {
                'dateTime': kwargs.get('start_time').isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': kwargs.get('end_time').isoformat(),
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': True,
            },
        }

        try:
            created_event = self.service.events().insert(
                calendarId='primary',
                body=event_body,
                sendUpdates='all'
            ).execute()

            # Immediately process this new event
            await self._handle_updated_event('primary', created_event)

            return {"success": True, "event": self._parse_google_event('primary', created_event)}
        except Exception as e:
            logger.error(f"Failed to create Google Calendar event: {e}", exc_info=True)
            return {"success": False, "error": str(e)}

    async def update_event(self, event_id: str, **kwargs) -> Dict[str, Any]:
        """
        Updates an event in Google Calendar and syncs the changes to the local DB.

        Args:
            event_id: Local database event ID
            **kwargs: Fields to update (title, description, location, start_time, end_time)

        Returns:
            Dictionary with success status and updated event data or error message
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        try:
            # Get the event from local DB to find its Google event ID
            async with self.pool.acquire() as conn:
                event_record = await conn.fetchrow(
                    "SELECT google_event_id, google_calendar_id FROM events WHERE id = $1",
                    event_id
                )

            if not event_record or not event_record['google_event_id']:
                return {"success": False, "error": "Event not found or not synced with Google Calendar"}

            google_event_id = event_record['google_event_id']
            calendar_id = event_record['google_calendar_id'] or 'primary'

            # Fetch the current event from Google Calendar
            current_event = self.service.events().get(
                calendarId=calendar_id,
                eventId=google_event_id
            ).execute()

            # Update only the provided fields
            if 'title' in kwargs:
                current_event['summary'] = kwargs['title']
            if 'description' in kwargs:
                current_event['description'] = kwargs['description']
            if 'location' in kwargs:
                current_event['location'] = kwargs['location']
            if 'start_time' in kwargs:
                current_event['start'] = {
                    'dateTime': kwargs['start_time'].isoformat(),
                    'timeZone': 'UTC'
                }
            if 'end_time' in kwargs:
                current_event['end'] = {
                    'dateTime': kwargs['end_time'].isoformat(),
                    'timeZone': 'UTC'
                }

            # Update the event in Google Calendar
            updated_event = self.service.events().update(
                calendarId=calendar_id,
                eventId=google_event_id,
                body=current_event,
                sendUpdates='all'
            ).execute()

            # Sync the updated event back to local DB
            await self._handle_updated_event(calendar_id, updated_event)

            logger.info(f"Successfully updated Google Calendar event: {google_event_id}")
            return {"success": True, "event": self._parse_google_event(calendar_id, updated_event)}

        except Exception as e:
            logger.error(f"Failed to update Google Calendar event: {e}", exc_info=True)
            return {"success": False, "error": str(e)}

    async def setup_webhook(self, calendar_id: str = 'primary', webhook_url: str = None) -> Dict[str, Any]:
        """
        Sets up a webhook (push notification channel) for a Google Calendar.

        Args:
            calendar_id: The calendar ID to watch
            webhook_url: The HTTPS URL to receive notifications (must be publicly accessible)

        Returns:
            Dictionary with channel information or error
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        if not webhook_url:
            # Get webhook URL from environment or configuration
            webhook_url = os.getenv('GOOGLE_CALENDAR_WEBHOOK_URL')
            if not webhook_url:
                return {"success": False, "error": "Webhook URL not configured"}

        try:
            # Generate a unique channel ID
            channel_id = str(uuid.uuid4())

            # Set expiration to 7 days from now (max allowed by Google)
            expiration = int((datetime.now(timezone.utc) + timedelta(days=7)).timestamp() * 1000)

            # Create watch channel
            body = {
                'id': channel_id,
                'type': 'web_hook',
                'address': webhook_url,
                'expiration': expiration
            }

            watch_result = self.service.events().watch(
                calendarId=calendar_id,
                body=body
            ).execute()

            # Store channel information in database
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO calendar_webhook_channels
                    (channel_id, calendar_id, resource_id, webhook_url, expiration)
                    VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0))
                    ON CONFLICT (calendar_id) DO UPDATE
                    SET channel_id = $1, resource_id = $3, webhook_url = $4,
                        expiration = to_timestamp($5 / 1000.0), created_at = NOW()
                """, channel_id, calendar_id, watch_result['resourceId'],
                    webhook_url, expiration)

            logger.info(f"Webhook setup successful for calendar {calendar_id}: {channel_id}")
            return {
                "success": True,
                "channel_id": channel_id,
                "resource_id": watch_result['resourceId'],
                "expiration": expiration
            }

        except Exception as e:
            logger.error(f"Failed to setup webhook: {e}", exc_info=True)
            return {"success": False, "error": str(e)}

    async def stop_webhook(self, calendar_id: str = 'primary') -> Dict[str, Any]:
        """
        Stops a webhook channel for a calendar.

        Args:
            calendar_id: The calendar ID

        Returns:
            Dictionary with success status
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        try:
            # Get channel information from database
            async with self.pool.acquire() as conn:
                channel = await conn.fetchrow("""
                    SELECT channel_id, resource_id FROM calendar_webhook_channels
                    WHERE calendar_id = $1
                """, calendar_id)

            if not channel:
                return {"success": False, "error": "No active webhook found for this calendar"}

            # Stop the channel
            self.service.channels().stop(body={
                'id': channel['channel_id'],
                'resourceId': channel['resource_id']
            }).execute()

            # Remove from database
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    DELETE FROM calendar_webhook_channels WHERE calendar_id = $1
                """, calendar_id)

            logger.info(f"Webhook stopped for calendar {calendar_id}")
            return {"success": True, "message": "Webhook stopped"}

        except Exception as e:
            logger.error(f"Failed to stop webhook: {e}", exc_info=True)
            return {"success": False, "error": str(e)}

    async def renew_webhooks(self) -> Dict[str, Any]:
        """
        Renews all webhook channels that are about to expire (within 24 hours).

        This should be called periodically (e.g., daily) to maintain active webhooks.

        Returns:
            Dictionary with renewal statistics
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        try:
            # Find channels expiring soon
            async with self.pool.acquire() as conn:
                expiring_channels = await conn.fetch("""
                    SELECT calendar_id, webhook_url FROM calendar_webhook_channels
                    WHERE expiration < NOW() + INTERVAL '24 hours'
                """)

            renewed_count = 0
            failed_count = 0

            for channel in expiring_channels:
                result = await self.setup_webhook(
                    calendar_id=channel['calendar_id'],
                    webhook_url=channel['webhook_url']
                )

                if result.get('success'):
                    renewed_count += 1
                else:
                    failed_count += 1
                    logger.error(f"Failed to renew webhook for {channel['calendar_id']}: {result.get('error')}")

            logger.info(f"Webhook renewal complete: {renewed_count} renewed, {failed_count} failed")
            return {
                "success": True,
                "renewed": renewed_count,
                "failed": failed_count
            }

        except Exception as e:
            logger.error(f"Failed to renew webhooks: {e}", exc_info=True)
            return {"success": False, "error": str(e)}

    async def delete_event(self, event_id: str) -> Dict[str, Any]:
        """
        Deletes an event from Google Calendar and marks it as cancelled in the local DB.

        Args:
            event_id: Local database event ID

        Returns:
            Dictionary with success status or error message
        """
        if not self.service:
            return {"success": False, "error": "Google Calendar service not available."}

        try:
            # Get the event from local DB to find its Google event ID
            async with self.pool.acquire() as conn:
                event_record = await conn.fetchrow(
                    "SELECT google_event_id, google_calendar_id FROM events WHERE id = $1",
                    event_id
                )

            if not event_record:
                return {"success": False, "error": "Event not found"}

            google_event_id = event_record['google_event_id']
            calendar_id = event_record['google_calendar_id'] or 'primary'

            # Delete from Google Calendar (if it exists in Google)
            if google_event_id:
                try:
                    self.service.events().delete(
                        calendarId=calendar_id,
                        eventId=google_event_id,
                        sendUpdates='all'
                    ).execute()
                    logger.info(f"Deleted event from Google Calendar: {google_event_id}")
                except Exception as e:
                    # Event might not exist in Google Calendar, log but continue
                    logger.warning(f"Could not delete from Google Calendar (might not exist): {e}")

            # Mark as cancelled in local DB
            async with self.pool.acquire() as conn:
                await conn.execute(
                    "UPDATE events SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
                    event_id
                )

            return {"success": True, "message": "Event deleted successfully"}

        except Exception as e:
            logger.error(f"Failed to delete Google Calendar event: {e}", exc_info=True)
            return {"success": False, "error": str(e)}
