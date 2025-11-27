"""
External Sync Service

Scheduled jobs for external synchronization (legacy Google Calendar hook).
"""

from datetime import datetime
from typing import Dict, Any
import os

from utils.logging import get_logger

logger = get_logger(__name__)


# ============================================================================
# Google Calendar Sync (Workflow 14)
# Schedule: Every 15 minutes (if enabled)
# ============================================================================

async def sync_google_calendar() -> Dict[str, Any]:
    """
    Bidirectional sync with Google Calendar.

    Replaces n8n workflow: 14-google-calendar-sync.json

    Logic:
    1. Authenticate with Google Calendar API (OAuth2)
    2. Fetch calendar events (next 30 days)
    3. For each Google event:
       - Check if exists locally (by google_event_id)
       - If not, create local event
       - If exists and modified, update local event
    4. Fetch local events modified since last sync
    5. For each modified local event:
       - Push to Google Calendar API
       - Update google_event_id mapping
    6. Return sync statistics

    Returns:
        Dict with sync statistics
    """
    try:
        # Check if Google Calendar sync is enabled
        gcal_enabled = os.getenv("GOOGLE_CALENDAR_SYNC_ENABLED", "false").lower() == "true"
        credentials_path = os.getenv("GOOGLE_CALENDAR_CREDENTIALS_PATH", "")

        if not gcal_enabled:
            logger.debug("Google Calendar sync is disabled")
            return {
                "success": True,
                "enabled": False,
                "message": "Google Calendar sync is disabled"
            }

        if not credentials_path or not os.path.exists(credentials_path):
            logger.error("Google Calendar credentials not found")
            return {
                "success": False,
                "error": "Google Calendar credentials not configured"
            }

        # Note: Full Google Calendar integration requires:
        # - google-auth, google-auth-oauthlib, google-auth-httplib2, google-api-python-client
        # - OAuth2 flow for token generation
        # - Token refresh logic
        #
        # This is a simplified implementation that would need the above dependencies.
        # For now, we'll return a placeholder indicating the feature is not fully implemented.

        logger.warning("Google Calendar sync requires additional setup (OAuth2 credentials)")

        return {
            "success": False,
            "error": "Google Calendar sync requires OAuth2 setup and additional dependencies",
            "message": "Install google-auth libraries and configure OAuth2 credentials",
            "timestamp": datetime.now().isoformat()
        }

        # TODO: Implement full Google Calendar sync when dependencies are available
        # The logic would be similar to Todoist sync:
        # 1. Use google.oauth2.credentials to authenticate
        # 2. Use googleapiclient.discovery to build calendar service
        # 3. Fetch events with calendar.events().list()
        # 4. Sync bidirectionally similar to Todoist

    except Exception as e:
        logger.error(f"Error during Google Calendar sync: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
