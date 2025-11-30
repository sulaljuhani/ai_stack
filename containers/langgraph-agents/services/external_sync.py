"""
Unified service for synchronizing with external platforms like Todoist and Google Calendar.
"""

from utils.logging import get_logger
from utils.db import get_db_pool
# Removed direct import of sync_todoist to avoid circular dependency
# from .todoist_sync import sync_todoist 

logger = get_logger(__name__)

async def sync_google_calendar():
    """
    Background job for Google Calendar synchronization.
    """
    from .google_calendar_sync import GoogleCalendarSyncService
    
    logger.info("Starting scheduled Google Calendar sync job...")
    try:
        pool = await get_db_pool()
        service = GoogleCalendarSyncService(pool)
        result = await service.sync()
        logger.info(f"Google Calendar sync job finished. Result: {result}")
    except Exception as e:
        logger.error(f"Google Calendar sync job failed: {e}", exc_info=True)

async def sync_todoist_background():
    """
    Wrapper for running Todoist sync in the background.
    Needed to avoid circular import issues with scheduler.
    """
    from .todoist_sync import sync_todoist
    
    logger.info("Starting scheduled Todoist sync job...")
    try:
        await sync_todoist()
        logger.info("Todoist sync job finished successfully.")
    except Exception as e:
        logger.error(f"Todoist sync job failed: {e}", exc_info=True)