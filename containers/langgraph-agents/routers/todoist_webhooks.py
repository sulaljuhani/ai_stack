"""
Todoist webhook ingestion with orphan buffering.

Endpoint: POST /api/webhooks/todoist
"""

from __future__ import annotations

import asyncio
import os
from collections import deque
from datetime import datetime
from typing import Any, Deque, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

from services.todoist_sync import TodoistSyncService
from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/webhooks/todoist", tags=["todoist"])

ORPHAN_BUFFER: Deque[Dict[str, Any]] = deque(maxlen=200)
ORPHAN_RETRY_SECONDS = 5
ORPHAN_MAX_ATTEMPTS = 3
_retry_in_progress = False
_buffer_lock = asyncio.Lock()


class TodoistWebhookPayload(BaseModel):
    """Minimal Todoist webhook payload."""

    event_name: str = Field(..., description="Todoist event name, e.g., item:added")
    event_data: Dict[str, Any] = Field(default_factory=dict, description="Raw event payload from Todoist")
    user_id: Optional[str] = None
    initiator: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"


class TodoistWebhookResponse(BaseModel):
    """Response contract for webhook ingestion."""

    accepted: bool
    buffered: bool = False
    message: Optional[str] = None
    created: int = 0
    updated: int = 0


async def _parent_exists(parent_id: str) -> bool:
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        exists = await conn.fetchval(
            "SELECT 1 FROM tasks WHERE todoist_id = $1 LIMIT 1",
            parent_id,
        )
        return bool(exists)


async def _buffer_if_orphan(item: Dict[str, Any]) -> bool:
    parent_id = item.get("parent_id")
    if not parent_id:
        return False

    if await _parent_exists(parent_id):
        return False

    async with _buffer_lock:
        ORPHAN_BUFFER.append({"item": item, "attempts": 0, "timestamp": datetime.utcnow().isoformat()})

    logger.debug("Buffered Todoist item %s waiting for parent %s", item.get("id"), parent_id)
    return True


async def _retry_buffered_items():
    global _retry_in_progress
    await asyncio.sleep(ORPHAN_RETRY_SECONDS)

    async with _buffer_lock:
        pending = list(ORPHAN_BUFFER)
        ORPHAN_BUFFER.clear()
        _retry_in_progress = False

    if not pending:
        return

    logger.debug("Retrying %s buffered Todoist webhook items", len(pending))

    api_token = os.getenv("TODOIST_API_TOKEN") or os.getenv("TODOIST_API_KEY") or ""
    service = TodoistSyncService(api_token, await get_db_pool())
    retry_queue: List[Dict[str, Any]] = []
    process_now: List[Dict[str, Any]] = []

    for entry in pending:
        item = entry.get("item", {})
        parent_id = item.get("parent_id")
        attempts = entry.get("attempts", 0) + 1

        if parent_id and not await _parent_exists(parent_id):
            if attempts < ORPHAN_MAX_ATTEMPTS:
                retry_queue.append({"item": item, "attempts": attempts, "timestamp": entry.get("timestamp")})
            else:
                logger.warning(
                    "Dropping Todoist item %s after %s attempts (missing parent %s)",
                    item.get("id"),
                    attempts,
                    parent_id,
                )
            continue

        process_now.append(item)

    if retry_queue:
        async with _buffer_lock:
            for entry in retry_queue:
                ORPHAN_BUFFER.append(entry)
            if not _retry_in_progress:
                _retry_in_progress = True
                asyncio.create_task(_retry_buffered_items())

    if process_now:
        await service.upsert_items(process_now)


@router.post("", response_model=TodoistWebhookResponse)
async def ingest_todoist_webhook(payload: TodoistWebhookPayload, background_tasks: BackgroundTasks):
    todoist_enabled = os.getenv("TODOIST_SYNC_ENABLED", "false").lower() == "true"
    if not todoist_enabled:
        raise HTTPException(status_code=503, detail="Todoist sync disabled")

    item = payload.event_data.get("item") or payload.event_data
    if not item:
        raise HTTPException(status_code=400, detail="Missing Todoist item payload")

    buffered = await _buffer_if_orphan(item)
    if buffered:
        global _retry_in_progress
        if not _retry_in_progress:
            _retry_in_progress = True
            background_tasks.add_task(_retry_buffered_items)
        return TodoistWebhookResponse(accepted=True, buffered=True, message="Parent not yet available; queued for retry")

    api_token = os.getenv("TODOIST_API_TOKEN") or os.getenv("TODOIST_API_KEY") or ""
    service = TodoistSyncService(api_token, await get_db_pool())
    created, updated = await service.upsert_items([item])

    return TodoistWebhookResponse(
        accepted=True,
        buffered=False,
        created=created,
        updated=updated,
        message=f"Processed event {payload.event_name}",
    )
