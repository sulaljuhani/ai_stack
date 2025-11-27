# Google Calendar + FullCalendar Implementation Plan

**Created:** 2025-11-27
**Status:** 📋 PLANNING
**Architecture Model:** Todoist-style bidirectional sync + FullCalendar UI

---

## Overview

Transform the calendar system from custom implementation to **Google Calendar sync** with **FullCalendar** frontend, following the successful Todoist integration pattern.

### Goals

1. **Full Google Calendar sync** (OAuth2, bidirectional, webhooks)
2. **FullCalendar UI** replacing custom calendar implementation
3. **Unified events + reminders** in calendar view
4. **Agent tools** for calendar manipulation
5. **Remove redundant Events page** (FullCalendar becomes primary view)

### Architecture Pattern (Proven from Todoist)

```
┌─────────────────────────────────────────────────────────────┐
│                     Google Calendar API                      │
│              (Single Source of Truth - Cloud)                │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
      Inbound (Webhooks/Sync)    Outbound (Background Tasks)
                │                         │
                ▼                         ▼
┌───────────────────────────────────────────────────────────────┐
│              FastAPI + PostgreSQL (Local Mirror)              │
│  • events table (Google event_id mapping)                    │
│  • reminders table (Linked or standalone)                    │
│  • GoogleCalendarSyncService (like TodoistSyncService)        │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│              SvelteKit + FullCalendar Frontend                │
│  • Monthly/Weekly/Daily views                                │
│  • Drag-and-drop event rescheduling                          │
│  • Reminders overlay on calendar                             │
│  • Event creation modal                                      │
└───────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Google Calendar OAuth2 & Sync Service

**Estimated Time:** 8-10 hours
**Pattern:** Mirror the Todoist sync implementation

### 1.1 Backend Dependencies

**Add to `requirements.txt`:**
```txt
google-auth>=2.28.0
google-auth-oauthlib>=1.2.0
google-auth-httplib2>=0.2.0
google-api-python-client>=2.119.0
```

**Install:**
```bash
cd /mnt/user/appdata/ai_stack/containers/langgraph-agents
pip install -r requirements.txt
```

---

### 1.2 OAuth2 Setup

**File:** `services/google_auth.py` (NEW)

```python
"""
Google Calendar OAuth2 Authentication

Handles OAuth2 flow, token storage, and refresh.
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

from utils.logging import get_logger

logger = get_logger(__name__)

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]


class GoogleCalendarAuth:
    """Manages Google Calendar OAuth2 authentication."""

    def __init__(self):
        self.credentials_path = os.getenv(
            "GOOGLE_CALENDAR_CREDENTIALS_PATH",
            "/app/config/google_credentials.json"
        )
        self.token_path = os.getenv(
            "GOOGLE_CALENDAR_TOKEN_PATH",
            "/app/data/google_token.json"
        )
        self.creds: Optional[Credentials] = None

    def authenticate(self) -> Credentials:
        """
        Authenticate with Google Calendar API.

        Returns:
            Credentials object for API calls

        Raises:
            FileNotFoundError: If credentials.json not found
            Exception: If OAuth flow fails
        """
        # Load existing token if available
        if os.path.exists(self.token_path):
            self.creds = Credentials.from_authorized_user_file(
                self.token_path, SCOPES
            )

        # Refresh or create new token
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                logger.info("Refreshing Google Calendar access token")
                self.creds.refresh(Request())
            else:
                logger.info("Starting OAuth2 flow for Google Calendar")
                if not os.path.exists(self.credentials_path):
                    raise FileNotFoundError(
                        f"Google credentials not found at {self.credentials_path}. "
                        "Download from Google Cloud Console."
                    )

                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES
                )
                self.creds = flow.run_local_server(port=0)

            # Save token for future use
            Path(self.token_path).parent.mkdir(parents=True, exist_ok=True)
            with open(self.token_path, 'w') as token:
                token.write(self.creds.to_json())

            logger.info("Google Calendar authentication successful")

        return self.creds

    def get_calendar_service(self):
        """Build and return Google Calendar API service."""
        if not self.creds or not self.creds.valid:
            self.authenticate()

        return build('calendar', 'v3', credentials=self.creds)

    def revoke(self) -> bool:
        """Revoke access and delete token."""
        if os.path.exists(self.token_path):
            os.remove(self.token_path)
            logger.info("Google Calendar token revoked")
            return True
        return False
```

**Setup Steps:**
1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create new project "AI Stack Calendar"
   - Enable Google Calendar API

2. **Create OAuth2 Credentials:**
   - OAuth consent screen → External → Add scopes (calendar)
   - Credentials → Create OAuth 2.0 Client ID → Desktop app
   - Download JSON as `google_credentials.json`

3. **Store credentials:**
   ```bash
   mkdir -p /mnt/user/appdata/ai_stack/config
   # Place google_credentials.json in config/
   ```

4. **Environment variables:**
   ```bash
   # Add to docker-compose.yml or .env
   GOOGLE_CALENDAR_SYNC_ENABLED=true
   GOOGLE_CALENDAR_CREDENTIALS_PATH=/app/config/google_credentials.json
   GOOGLE_CALENDAR_TOKEN_PATH=/app/data/google_token.json
   ```

---

### 1.3 Google Calendar Sync Service

**File:** `services/google_calendar_sync.py` (REPLACE external_sync.py stub)

```python
"""
Google Calendar Sync Service

Bidirectional sync between PostgreSQL and Google Calendar.
Mirrors the TodoistSyncService pattern.
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import deque

import httpx
from googleapiclient.errors import HttpError

from services.google_auth import GoogleCalendarAuth
from utils.logging import get_logger
from database import get_db_pool

logger = get_logger(__name__)

# Orphan event buffer (same pattern as Todoist)
ORPHAN_BUFFER = deque(maxlen=100)


class GoogleCalendarSyncService:
    """
    Bidirectional sync service for Google Calendar.

    Architecture:
    - PostgreSQL events table is the local mirror
    - Google Calendar is the source of truth
    - Sync runs every 15 minutes (APScheduler)
    - Webhooks for real-time inbound updates
    """

    def __init__(self, pool):
        self.pool = pool
        self.auth = GoogleCalendarAuth()
        self.service = None
        self.calendar_id = 'primary'  # Can be made configurable

    async def sync(self, force_full: bool = False) -> Dict[str, Any]:
        """
        Main sync function (called by APScheduler).

        Args:
            force_full: If True, fetch all events (ignores sync_token)

        Returns:
            Sync statistics
        """
        try:
            # Authenticate and build service
            if not self.service:
                self.service = self.auth.get_calendar_service()

            logger.info(f"Starting Google Calendar sync (force_full={force_full})")

            # Get sync state from database
            async with self.pool.acquire() as conn:
                sync_state = await conn.fetchrow("""
                    SELECT sync_token, last_sync_at
                    FROM calendar_sync_state
                    WHERE calendar_id = $1
                """, self.calendar_id)

                sync_token = None if force_full else sync_state.get('sync_token') if sync_state else None

            # Fetch events from Google Calendar
            events_created = 0
            events_updated = 0
            events_deleted = 0

            page_token = None
            while True:
                try:
                    if sync_token:
                        # Incremental sync
                        result = self.service.events().list(
                            calendarId=self.calendar_id,
                            syncToken=sync_token,
                            maxResults=250,
                            singleEvents=False  # Include recurring events
                        ).execute()
                    else:
                        # Full sync (next 90 days + past 30 days)
                        time_min = (datetime.utcnow() - timedelta(days=30)).isoformat() + 'Z'
                        time_max = (datetime.utcnow() + timedelta(days=90)).isoformat() + 'Z'

                        result = self.service.events().list(
                            calendarId=self.calendar_id,
                            timeMin=time_min,
                            timeMax=time_max,
                            pageToken=page_token,
                            maxResults=250,
                            singleEvents=False
                        ).execute()

                    events = result.get('items', [])

                    # Process each event
                    async with self.pool.acquire() as conn:
                        async with conn.transaction():
                            for event in events:
                                if event.get('status') == 'cancelled':
                                    deleted = await self._delete_event(conn, event['id'])
                                    if deleted:
                                        events_deleted += 1
                                else:
                                    created = await self._upsert_event(conn, event)
                                    if created:
                                        events_created += 1
                                    else:
                                        events_updated += 1

                    # Handle pagination
                    page_token = result.get('nextPageToken')
                    if not page_token:
                        break

                except HttpError as e:
                    if e.resp.status == 410:
                        # Sync token expired, do full sync
                        logger.warning("Google Calendar sync token expired, performing full sync")
                        return await self.sync(force_full=True)
                    else:
                        raise

            # Save new sync token
            new_sync_token = result.get('nextSyncToken')
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO calendar_sync_state (calendar_id, sync_token, last_sync_at)
                    VALUES ($1, $2, NOW())
                    ON CONFLICT (calendar_id)
                    DO UPDATE SET sync_token = $2, last_sync_at = NOW()
                """, self.calendar_id, new_sync_token)

            logger.info(f"Google Calendar sync complete: +{events_created} ~{events_updated} -{events_deleted}")

            return {
                "success": True,
                "events_created": events_created,
                "events_updated": events_updated,
                "events_deleted": events_deleted,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Google Calendar sync failed: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _upsert_event(self, conn, gcal_event: Dict[str, Any]) -> bool:
        """
        Upsert Google Calendar event to local database.

        Returns:
            True if created, False if updated
        """
        # Extract event data
        google_event_id = gcal_event['id']
        summary = gcal_event.get('summary', 'Untitled Event')
        description = gcal_event.get('description', '')
        location = gcal_event.get('location', '')

        # Parse start/end times
        start = gcal_event['start']
        end = gcal_event['end']

        is_all_day = 'date' in start  # All-day events use 'date', not 'dateTime'

        if is_all_day:
            start_time = datetime.fromisoformat(start['date'] + 'T00:00:00')
            end_time = datetime.fromisoformat(end['date'] + 'T23:59:59')
        else:
            start_time = datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end['dateTime'].replace('Z', '+00:00'))

        # Recurrence
        recurrence_rule = gcal_event.get('recurrence', [None])[0] if gcal_event.get('recurrence') else None

        # Attendees
        attendees_raw = gcal_event.get('attendees', [])
        attendees_json = [
            {
                "email": a.get('email'),
                "name": a.get('displayName', ''),
                "status": a.get('responseStatus', 'needsAction')
            }
            for a in attendees_raw
        ]

        # Check if event exists
        existing = await conn.fetchrow("""
            SELECT id FROM events WHERE google_event_id = $1
        """, google_event_id)

        if existing:
            # Update existing event
            await conn.execute("""
                UPDATE events
                SET title = $1, description = $2, location = $3,
                    start_time = $4, end_time = $5, is_all_day = $6,
                    recurrence_rule = $7, attendees = $8,
                    google_sync_at = NOW(), updated_at = NOW()
                WHERE google_event_id = $9
            """, summary, description, location, start_time, end_time, is_all_day,
                recurrence_rule, attendees_json, google_event_id)
            return False
        else:
            # Create new event
            # TODO: Get user_id from context or default user
            user_id = await conn.fetchval("SELECT id FROM users LIMIT 1")

            await conn.execute("""
                INSERT INTO events (
                    user_id, title, description, location,
                    start_time, end_time, is_all_day,
                    recurrence_rule, attendees, google_event_id,
                    google_calendar_id, google_sync_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            """, user_id, summary, description, location, start_time, end_time,
                is_all_day, recurrence_rule, attendees_json, google_event_id,
                self.calendar_id)
            return True

    async def _delete_event(self, conn, google_event_id: str) -> bool:
        """Delete event from local database."""
        result = await conn.execute("""
            DELETE FROM events WHERE google_event_id = $1
        """, google_event_id)
        return result != 'DELETE 0'

    async def create_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        description: str = "",
        location: str = "",
        is_all_day: bool = False
    ) -> Dict[str, Any]:
        """
        Create event in Google Calendar and sync to local DB.

        Returns:
            Created event data or error
        """
        try:
            if not self.service:
                self.service = self.auth.get_calendar_service()

            # Build Google Calendar event
            event_body = {
                'summary': title,
                'description': description,
                'location': location,
            }

            if is_all_day:
                event_body['start'] = {'date': start_time.strftime('%Y-%m-%d')}
                event_body['end'] = {'date': end_time.strftime('%Y-%m-%d')}
            else:
                event_body['start'] = {'dateTime': start_time.isoformat(), 'timeZone': 'UTC'}
                event_body['end'] = {'dateTime': end_time.isoformat(), 'timeZone': 'UTC'}

            # Create in Google Calendar
            created_event = self.service.events().insert(
                calendarId=self.calendar_id,
                body=event_body
            ).execute()

            # Sync to local DB
            async with self.pool.acquire() as conn:
                async with conn.transaction():
                    await self._upsert_event(conn, created_event)

            logger.info(f"Created Google Calendar event: {title}")

            return {
                "success": True,
                "event": {
                    "google_event_id": created_event['id'],
                    "title": title,
                    "start_time": start_time.isoformat(),
                    "end_time": end_time.isoformat()
                }
            }

        except Exception as e:
            logger.error(f"Failed to create Google Calendar event: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
```

---

### 1.4 APScheduler Integration

**File:** `services/scheduler.py` (ADD to existing jobs)

```python
# Add after Todoist sync job

# Google Calendar Sync (Every 15 minutes)
scheduler.add_job(
    func=lambda: asyncio.create_task(sync_google_calendar_job()),
    trigger='interval',
    minutes=15,
    id='google_calendar_sync',
    name='Google Calendar Bidirectional Sync',
    replace_existing=True
)

async def sync_google_calendar_job():
    """Background job for Google Calendar sync."""
    pool = await get_db_pool()
    service = GoogleCalendarSyncService(pool)
    result = await service.sync()
    logger.info(f"Google Calendar sync result: {result}")
```

---

## Phase 2: Database Schema Updates

**Estimated Time:** 2-3 hours

### 2.1 New Migration: Calendar Sync State

**File:** `migrations/014_google_calendar_sync_state.sql` (NEW)

```sql
-- Migration 014: Google Calendar Sync State
-- Stores sync tokens for incremental sync (like Todoist)

CREATE TABLE IF NOT EXISTS calendar_sync_state (
    calendar_id TEXT PRIMARY KEY,  -- 'primary', 'work@example.com', etc.
    sync_token TEXT,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE calendar_sync_state IS 'Google Calendar sync token storage for incremental sync';
```

---

### 2.2 Events Table Modifications

**File:** `migrations/015_events_google_calendar_updates.sql` (NEW)

```sql
-- Migration 015: Events Table Google Calendar Updates
-- Add missing fields for full Google Calendar compatibility

-- Add conferencing field (Google Meet links)
ALTER TABLE events ADD COLUMN IF NOT EXISTS conference_data JSONB;

-- Add color_id (Google Calendar color scheme)
ALTER TABLE events ADD COLUMN IF NOT EXISTS color_id TEXT;

-- Add visibility (default, public, private)
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'default';

-- Add hangout_link (deprecated but still used)
ALTER TABLE events ADD COLUMN IF NOT EXISTS hangout_link TEXT;

-- Add source (where event was created: 'google', 'agent', 'manual')
ALTER TABLE events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Index for source filtering
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);

COMMENT ON COLUMN events.conference_data IS 'Google Meet or other conference details (JSONB)';
COMMENT ON COLUMN events.source IS 'Event creation source: google, agent, manual';
```

**Verification:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```

---

### 2.3 Reminders Integration Decision

**Option A: Keep Reminders Separate (RECOMMENDED)**
- Reminders remain standalone (notifications, to-dos)
- Display as overlay on calendar view
- No schema changes needed

**Option B: Merge Reminders into Events**
- Migrate reminders to events table
- Use `event_type` field ('event', 'reminder', 'task')
- More complex but unified

**Decision Point:** Ask user preference or default to **Option A** (separate).

---

## Phase 3: FullCalendar Frontend Integration

**Estimated Time:** 6-8 hours

### 3.1 Install FullCalendar

**File:** `package.json` (open-webui-sebastian)

```bash
cd /mnt/user/appdata/open-webui-sebastian
npm install @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list
```

**Packages:**
- `@fullcalendar/core` - Core library
- `@fullcalendar/daygrid` - Month view
- `@fullcalendar/timegrid` - Week/Day view
- `@fullcalendar/interaction` - Drag-and-drop
- `@fullcalendar/list` - List view

---

### 3.2 Create FullCalendar Component

**File:** `src/lib/components/Calendar/FullCalendar.svelte` (NEW)

```svelte
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Calendar } from '@fullcalendar/core';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import interactionPlugin from '@fullcalendar/interaction';
    import listPlugin from '@fullcalendar/list';

    type CalendarEvent = {
        id: string;
        title: string;
        start: string;
        end: string;
        allDay?: boolean;
        backgroundColor?: string;
        borderColor?: string;
        extendedProps?: {
            description?: string;
            location?: string;
            type: 'event' | 'reminder';
        };
    };

    let {
        events = $bindable<CalendarEvent[]>([]),
        onEventClick = undefined as ((event: any) => void) | undefined,
        onDateClick = undefined as ((date: Date) => void) | undefined,
        onEventDrop = undefined as ((event: any) => Promise<void>) | undefined,
    } = $props();

    let calendarEl: HTMLElement;
    let calendar: Calendar;

    onMount(() => {
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],

            // Initial view
            initialView: 'dayGridMonth',

            // Header toolbar
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },

            // Event handling
            events: events,
            editable: true,
            droppable: true,

            // Callbacks
            eventClick: (info) => {
                if (onEventClick) {
                    onEventClick({
                        id: info.event.id,
                        title: info.event.title,
                        start: info.event.start,
                        end: info.event.end,
                        ...info.event.extendedProps
                    });
                }
            },

            dateClick: (info) => {
                if (onDateClick) {
                    onDateClick(info.date);
                }
            },

            eventDrop: async (info) => {
                if (onEventDrop) {
                    try {
                        await onEventDrop({
                            id: info.event.id,
                            start: info.event.start,
                            end: info.event.end
                        });
                    } catch (error) {
                        info.revert();
                        console.error('Failed to update event:', error);
                    }
                }
            },

            // Appearance
            height: 'auto',
            themeSystem: 'standard',

            // Time format
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
            }
        });

        calendar.render();
    });

    // Update events when they change
    $effect(() => {
        if (calendar && events) {
            calendar.removeAllEvents();
            calendar.addEventSource(events);
        }
    });

    onDestroy(() => {
        if (calendar) {
            calendar.destroy();
        }
    });
</script>

<div bind:this={calendarEl} class="fullcalendar-container"></div>

<style>
    .fullcalendar-container {
        padding: 1rem;
    }

    /* Dark mode support */
    :global(.dark) .fullcalendar-container {
        --fc-border-color: #374151;
        --fc-button-bg-color: #1f2937;
        --fc-button-border-color: #374151;
        --fc-button-hover-bg-color: #374151;
        --fc-button-hover-border-color: #4b5563;
        --fc-button-active-bg-color: #4b5563;
        --fc-button-active-border-color: #6b7280;
        --fc-event-bg-color: #3b82f6;
        --fc-event-border-color: #2563eb;
        --fc-event-text-color: #ffffff;
        --fc-page-bg-color: transparent;
        --fc-neutral-bg-color: #1f2937;
        --fc-neutral-text-color: #e5e7eb;
        --fc-list-event-hover-bg-color: #374151;
    }
</style>
```

---

### 3.3 Replace Calendar Page

**File:** `src/routes/(app)/calendar/+page.svelte` (REPLACE entire file)

```svelte
<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import { mobile, showSidebar, user } from '$lib/stores';
    import { WEBUI_API_BASE_URL } from '$lib/constants';

    import UserMenu from '$lib/components/layout/Sidebar/UserMenu.svelte';
    import Tooltip from '$lib/components/common/Tooltip.svelte';
    import Sidebar from '$lib/components/icons/Sidebar.svelte';
    import Spinner from '$lib/components/common/Spinner.svelte';
    import FullCalendar from '$lib/components/Calendar/FullCalendar.svelte';

    const i18n = getContext('i18n');

    let loaded = $state(false);
    let backendBaseUrl = $state('http://langgraph-agents:8000');
    let events = $state([]);
    let reminders = $state([]);

    const getHeaders = () => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (typeof localStorage !== 'undefined') {
            const apiKey = localStorage.getItem('backend_api_key');
            if (apiKey) headers['X-API-Key'] = apiKey;
        }
        return headers;
    };

    const fetchCalendarData = async () => {
        if (typeof localStorage !== 'undefined') {
            backendBaseUrl = localStorage.getItem('backend_url') || backendBaseUrl;
        }

        const opts = { method: 'GET', headers: getHeaders() };

        const [eventsRes, remindersRes] = await Promise.allSettled([
            fetch(`${backendBaseUrl}/api/events`, opts),
            fetch(`${backendBaseUrl}/api/reminders`, opts)
        ]);

        // Process events
        if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
            const rawEvents = await eventsRes.value.json();
            events = rawEvents.map((e: any) => ({
                id: e.id,
                title: e.title,
                start: e.start_time,
                end: e.end_time,
                allDay: e.is_all_day,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                extendedProps: {
                    description: e.description,
                    location: e.location,
                    type: 'event'
                }
            }));
        }

        // Process reminders (show as all-day events)
        if (remindersRes.status === 'fulfilled' && remindersRes.value.ok) {
            const rawReminders = await remindersRes.value.json();
            reminders = rawReminders
                .filter((r: any) => r.status === 'pending')
                .map((r: any) => ({
                    id: `reminder-${r.id}`,
                    title: `⏰ ${r.title}`,
                    start: r.remind_at,
                    allDay: false,
                    backgroundColor: '#f59e0b',
                    borderColor: '#d97706',
                    extendedProps: {
                        description: r.description,
                        type: 'reminder'
                    }
                }));
        }
    };

    const handleEventClick = (event: any) => {
        console.log('Event clicked:', event);
        // TODO: Open event details modal
    };

    const handleDateClick = (date: Date) => {
        console.log('Date clicked:', date);
        // TODO: Open create event modal
    };

    const handleEventDrop = async (event: any) => {
        // Update event times via API
        const response = await fetch(`${backendBaseUrl}/api/events/${event.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                start_time: event.start.toISOString(),
                end_time: event.end.toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update event');
        }

        await fetchCalendarData();
    };

    onMount(async () => {
        try {
            await fetchCalendarData();
        } catch (err) {
            console.error('Failed to fetch calendar data', err);
        } finally {
            loaded = true;
        }
    });

    // Combined events + reminders
    let allCalendarItems = $derived([...events, ...reminders]);
</script>

{#if loaded}
    <div class="flex flex-col w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out {$showSidebar ? 'md:max-w-[calc(100%-260px)]' : ''} max-w-full">
        <!-- Header (same as tasks page) -->
        <nav class="px-2 pt-1.5 backdrop-blur-xl w-full drag-region">
            <!-- ... copy from tasks page ... -->
        </nav>

        <div class="pb-1 flex-1 max-h-full overflow-y-auto @container p-6">
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Calendar</h1>
                    <button
                        class="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                        onclick={fetchCalendarData}
                    >
                        Refresh
                    </button>
                </div>

                <!-- FullCalendar Component -->
                <FullCalendar
                    bind:events={allCalendarItems}
                    onEventClick={handleEventClick}
                    onDateClick={handleDateClick}
                    onEventDrop={handleEventDrop}
                />
            </div>
        </div>
    </div>
{:else}
    <div class="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
    </div>
{/if}
```

---

### 3.4 Remove Events Page

**Action:**
```bash
# Remove the events page (no longer needed)
rm -rf /mnt/user/appdata/open-webui-sebastian/src/routes/\(app\)/events
```

**Update Navigation:**
- Remove "Events" link from sidebar/navigation if exists
- Calendar becomes the single view for all events

---

## Phase 4: API Endpoints & Agent Tools

**Estimated Time:** 4-5 hours

### 4.1 REST API Endpoints

**File:** `routers/google_calendar.py` (NEW)

```python
"""
Google Calendar API Router

Endpoints for calendar event CRUD operations.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
import os

from services.google_calendar_sync import GoogleCalendarSyncService
from database import get_db_pool
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
    Update an existing calendar event.

    TODO: Push changes to Google Calendar via API
    """
    try:
        pool = await get_db_pool()

        # Build update query dynamically
        updates = []
        values = []
        idx = 1

        if request.title:
            updates.append(f"title = ${idx}")
            values.append(request.title)
            idx += 1

        if request.start_time:
            updates.append(f"start_time = ${idx}")
            values.append(request.start_time)
            idx += 1

        if request.end_time:
            updates.append(f"end_time = ${idx}")
            values.append(request.end_time)
            idx += 1

        if request.description is not None:
            updates.append(f"description = ${idx}")
            values.append(request.description)
            idx += 1

        if request.location is not None:
            updates.append(f"location = ${idx}")
            values.append(request.location)
            idx += 1

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        updates.append("updated_at = NOW()")
        values.append(event_id)

        query = f"UPDATE events SET {', '.join(updates)} WHERE id = ${idx}"

        async with pool.acquire() as conn:
            result = await conn.execute(query, *values)

        if result == 'UPDATE 0':
            raise HTTPException(status_code=404, detail="Event not found")

        return {"success": True, "message": "Event updated"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update event: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str):
    """
    Delete a calendar event.

    TODO: Delete from Google Calendar via API
    """
    try:
        pool = await get_db_pool()

        async with pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE events SET status = 'cancelled', updated_at = NOW()
                WHERE id = $1
            """, event_id)

        if result == 'UPDATE 0':
            raise HTTPException(status_code=404, detail="Event not found")

        return {"success": True, "message": "Event deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete event: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
```

**Register router in `main.py`:**
```python
from routers import google_calendar

app.include_router(google_calendar.router, tags=["Google Calendar"])
```

---

### 4.2 Agent Tools

**File:** `tools/google_calendar.py` (NEW)

```python
"""
Google Calendar Agent Tools

LangChain tools for AI agents to manipulate calendar events.
"""

from langchain.tools import tool
from datetime import datetime, timedelta
from typing import Dict, Any
import os

from services.google_calendar_sync import GoogleCalendarSyncService
from database import get_db_pool
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
```

---

### 4.3 Tool Registration

**File:** `tools/tool_registry.py` (ADD)

```python
from . import google_calendar

# Inside _register_all_tools():
# Google Calendar Integration
register_tool("create_calendar_event", google_calendar.create_calendar_event, ["calendar", "scheduler", "tasks_core"])
register_tool("get_upcoming_events", google_calendar.get_upcoming_events, ["calendar", "scheduler"])
register_tool("find_free_time", google_calendar.find_free_time, ["calendar", "scheduler"])
```

---

## Phase 5: Testing & Deployment

**Estimated Time:** 3-4 hours

### 5.1 OAuth2 First-Time Setup

```bash
# 1. Start LangGraph agents container
docker-compose up -d langgraph-agents

# 2. Run OAuth2 flow (interactive)
docker exec -it langgraph-agents python3 -c "
from services.google_auth import GoogleCalendarAuth
auth = GoogleCalendarAuth()
creds = auth.authenticate()
print('OAuth2 setup complete!')
"

# This will open a browser window to authorize the app
# Token saved to /app/data/google_token.json
```

---

### 5.2 Test Sync

```bash
# Test full sync
curl -X POST http://langgraph-agents:8000/api/calendar/sync \
  -H "X-API-Key: YOUR_KEY"

# Check events table
psql -U postgres -d ai_stack -c "SELECT title, start_time, google_event_id FROM events LIMIT 10;"
```

---

### 5.3 Test FullCalendar UI

1. Navigate to `/calendar` in browser
2. Verify events display correctly
3. Test drag-and-drop event rescheduling
4. Click event to see details
5. Click date to create new event

---

### 5.4 Test Agent Tools

```python
# In agent conversation:
User: "What events do I have this week?"
Agent: *Uses get_upcoming_events(7)*

User: "Create a meeting with John tomorrow at 2pm for 1 hour"
Agent: *Uses create_calendar_event()*

User: "When am I free on Friday?"
Agent: *Uses find_free_time("2025-12-01")*
```

---

## Implementation Timeline

### Week 1: Google Calendar Sync (Phase 1)
- **Day 1-2:** OAuth2 setup + GoogleCalendarAuth class
- **Day 3-4:** GoogleCalendarSyncService implementation
- **Day 5:** APScheduler integration + testing

### Week 2: Database + Frontend (Phases 2-3)
- **Day 1:** Database migrations (sync_state + events updates)
- **Day 2:** Install FullCalendar + create component
- **Day 3-4:** Replace calendar page, integrate events + reminders
- **Day 5:** Remove events page, final UI polish

### Week 3: API + Agents (Phases 4-5)
- **Day 1-2:** REST API endpoints (routers/google_calendar.py)
- **Day 3:** Agent tools (tools/google_calendar.py)
- **Day 4:** End-to-end testing
- **Day 5:** Production deployment + monitoring

**Total Estimated Time:** 23-30 hours (3 weeks part-time)

---

## Success Criteria

- ✅ Google Calendar OAuth2 authentication working
- ✅ Bidirectional sync (local DB ↔ Google Calendar)
- ✅ FullCalendar displays events + reminders
- ✅ Drag-and-drop event rescheduling works
- ✅ Agents can create/read calendar events
- ✅ Events page removed (FullCalendar is primary)
- ✅ APScheduler runs sync every 15 minutes
- ✅ Zero data loss during sync
- ✅ Dark mode support in FullCalendar

---

## Rollback Plan

1. **If Google Calendar sync fails:**
   - Keep custom calendar implementation
   - Disable sync service
   - Events remain in local DB only

2. **If FullCalendar has issues:**
   - Revert to custom Svelte calendar
   - Keep Google Calendar sync working

3. **If OAuth2 setup blocked:**
   - Use local-only calendar
   - Add Google Calendar integration later

---

## Next Steps

**Ready to proceed?**

1. **Confirm architecture:** Is this plan aligned with your vision?
2. **Decide on reminders:** Keep separate or merge into events?
3. **Google credentials:** Do you have access to Google Cloud Console?
4. **Timeline:** Start with Phase 1 (Google sync) or Phase 3 (FullCalendar UI first)?

Let me know and I'll start implementation! 🚀
