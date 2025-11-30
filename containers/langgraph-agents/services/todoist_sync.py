"""
Todoist Mirror Sync Service

Keeps the local database as the single source of truth while mirroring Todoist.
Uses the Todoist Sync API (sync token) for full and incremental synchronization.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence, Tuple
from uuid import uuid4
from zoneinfo import ZoneInfo

import httpx

from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)
DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"

TODOIST_SYNC_URL = "https://api.todoist.com/sync/v9/sync"
# Include collaborators/user for completeness; expand as needed.
RESOURCE_TYPES = ["projects", "sections", "labels", "items", "collaborators", "user"]


@dataclass
class TodoistSyncResult:
    """Aggregate sync statistics."""

    projects: int = 0
    sections: int = 0
    labels: int = 0
    tasks: int = 0
    created: int = 0
    updated: int = 0
    commands_sent: int = 0
    sync_token: Optional[str] = None
    full_sync: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "projects": self.projects,
            "sections": self.sections,
            "labels": self.labels,
            "tasks": self.tasks,
            "created": self.created,
            "updated": self.updated,
            "commands_sent": self.commands_sent,
            "sync_token": self.sync_token,
            "full_sync": self.full_sync,
            "timestamp": datetime.utcnow().isoformat(),
        }


def parse_datetime(value: Optional[str], timezone: Optional[str] = None) -> Optional[datetime]:
    """Parse Todoist ISO timestamps safely, preserving timezone when provided."""
    if not value:
        return None
    try:
        if "T" in value or len(value) > 10:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        else:
            dt = datetime.fromisoformat(f"{value}T00:00:00+00:00")
        if timezone:
            try:
                dt = dt.astimezone(ZoneInfo(timezone))
            except Exception:
                pass
        # Normalize to naive UTC for DB storage (timestamp without timezone)
        if dt.tzinfo:
            dt = dt.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        else:
            dt = dt.replace(tzinfo=None)
        return dt
    except Exception:
        return None


class TodoistSyncService:
    """Encapsulates Todoist sync logic with sync-token support."""

    def __init__(self, api_token: str, pool):
        self.api_token = api_token
        self.pool = pool

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

    async def _get_state(self, conn) -> Optional[Dict[str, Any]]:
        return await conn.fetchrow(
            "SELECT sync_token, last_full_sync, last_incremental_sync FROM todoist_sync_state WHERE user_id = $1",
            DEFAULT_USER_ID,
        )

    async def _update_state(self, conn, sync_token: str, full_sync: bool) -> None:
        await conn.execute(
            """
            INSERT INTO todoist_sync_state (user_id, sync_token, last_full_sync, last_incremental_sync)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id) DO UPDATE
            SET
                sync_token = EXCLUDED.sync_token,
                last_full_sync = CASE WHEN EXCLUDED.last_full_sync IS NOT NULL THEN EXCLUDED.last_full_sync ELSE todoist_sync_state.last_full_sync END,
                last_incremental_sync = EXCLUDED.last_incremental_sync,
                updated_at = NOW()
            """,
            DEFAULT_USER_ID,
            sync_token,
            datetime.utcnow() if full_sync else None,
            datetime.utcnow(),
        )

    async def _fetch_sync_payload(self, sync_token: str, commands: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Call Todoist Sync API with provided token."""
        payload = {
            "sync_token": sync_token,
            "resource_types": json.dumps(RESOURCE_TYPES),
        }
        if commands:
            payload["commands"] = json.dumps(commands)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                TODOIST_SYNC_URL,
                headers=self.headers,
                data=payload,  # Sync API expects form-encoded data
            )

        if response.status_code != 200:
            raise RuntimeError(f"Todoist sync failed: {response.status_code} - {response.text}")

        data = response.json()
        if "sync_token" not in data:
            raise RuntimeError("Todoist sync response missing sync_token")

        return data

    async def _delete_project(self, conn, project_id: str) -> None:
        await conn.execute("DELETE FROM todoist_projects WHERE id = $1", project_id)

    async def _delete_section(self, conn, section_id: str) -> None:
        await conn.execute("DELETE FROM todoist_sections WHERE id = $1", section_id)

    async def _delete_label(self, conn, label_id: str) -> None:
        await conn.execute("DELETE FROM todoist_labels WHERE id = $1", label_id)

    async def _delete_task(self, conn, todoist_id: str) -> None:
        await conn.execute("DELETE FROM tasks WHERE todoist_id = $1", todoist_id)

    async def _prune_missing_projects(self, conn, live_ids: Sequence[str]) -> None:
        """Remove projects no longer returned by Todoist during a full sync."""
        ids = list(live_ids)
        if ids:
            await conn.execute(
                "DELETE FROM todoist_projects WHERE user_id = $1 AND NOT (id = ANY($2::text[]))",
                DEFAULT_USER_ID,
                ids,
            )
        else:
            await conn.execute("DELETE FROM todoist_projects WHERE user_id = $1", DEFAULT_USER_ID)

    async def _prune_missing_sections(self, conn, live_ids: Sequence[str]) -> None:
        """Remove sections no longer returned by Todoist during a full sync."""
        ids = list(live_ids)
        if ids:
            await conn.execute(
                "DELETE FROM todoist_sections WHERE user_id = $1 AND NOT (id = ANY($2::text[]))",
                DEFAULT_USER_ID,
                ids,
            )
        else:
            await conn.execute("DELETE FROM todoist_sections WHERE user_id = $1", DEFAULT_USER_ID)

    async def _prune_missing_labels(self, conn, live_ids: Sequence[str]) -> None:
        """Remove labels no longer returned by Todoist during a full sync."""
        ids = list(live_ids)
        if ids:
            await conn.execute(
                "DELETE FROM todoist_labels WHERE user_id = $1 AND NOT (id = ANY($2::text[]))",
                DEFAULT_USER_ID,
                ids,
            )
        else:
            await conn.execute("DELETE FROM todoist_labels WHERE user_id = $1", DEFAULT_USER_ID)

    async def _upsert_projects(self, conn, projects: Sequence[Dict[str, Any]]) -> int:
        count = 0
        for project in projects:
            if project.get("is_deleted") or project.get("is_archived"):
                if project.get("id"):
                    await self._delete_project(conn, str(project.get("id")))
                continue
            await conn.execute(
                """
                INSERT INTO todoist_projects (
                    id, user_id, name, color, parent_id, child_order,
                    is_favorite, is_inbox_project, view_style, raw_data, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, NOW()), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    color = EXCLUDED.color,
                    parent_id = EXCLUDED.parent_id,
                    child_order = EXCLUDED.child_order,
                    is_favorite = EXCLUDED.is_favorite,
                    is_inbox_project = EXCLUDED.is_inbox_project,
                    view_style = EXCLUDED.view_style,
                    raw_data = EXCLUDED.raw_data,
                    updated_at = NOW()
                """,
                str(project.get("id")),
                DEFAULT_USER_ID,
                project.get("name", ""),
                project.get("color"),
                project.get("parent_id"),
                project.get("child_order", 0),
                bool(project.get("is_favorite", False)),
                bool(project.get("is_inbox_project", False)),
                project.get("view_style", "list"),
                json.dumps(project),
                parse_datetime(project.get("created_at")),
            )
            count += 1
        return count

    async def _upsert_sections(self, conn, sections: Sequence[Dict[str, Any]]) -> int:
        count = 0
        for section in sections:
            if section.get("is_deleted") or section.get("is_archived"):
                if section.get("id"):
                    await self._delete_section(conn, str(section.get("id")))
                continue
            await conn.execute(
                """
                INSERT INTO todoist_sections (
                    id, user_id, project_id, name, section_order, raw_data, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW()), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    project_id = EXCLUDED.project_id,
                    name = EXCLUDED.name,
                    section_order = EXCLUDED.section_order,
                    raw_data = EXCLUDED.raw_data,
                    updated_at = NOW()
                """,
                str(section.get("id")),
                DEFAULT_USER_ID,
                section.get("project_id"),
                section.get("name", ""),
                section.get("section_order", 0),
                json.dumps(section),
                parse_datetime(section.get("created_at")),
            )
            count += 1
        return count

    async def _upsert_labels(self, conn, labels: Sequence[Dict[str, Any]]) -> int:
        count = 0
        for label in labels:
            if label.get("is_deleted") or label.get("is_archived"):
                if label.get("id"):
                    await self._delete_label(conn, str(label.get("id")))
                continue
            await conn.execute(
                """
                INSERT INTO todoist_labels (
                    id, user_id, name, color, item_order, is_favorite, raw_data, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOW()), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    color = EXCLUDED.color,
                    item_order = EXCLUDED.item_order,
                    is_favorite = EXCLUDED.is_favorite,
                    raw_data = EXCLUDED.raw_data,
                    updated_at = NOW()
                """,
                str(label.get("id")),
                DEFAULT_USER_ID,
                label.get("name", ""),
                label.get("color"),
                label.get("item_order", 0),
                bool(label.get("is_favorite", False)),
                json.dumps(label),
                parse_datetime(label.get("created_at")),
            )
            count += 1
        return count

    async def _upsert_tasks(self, conn, tasks: Sequence[Dict[str, Any]]) -> Tuple[int, int]:
        created = 0
        updated = 0

        for task in tasks:
            if task.get("is_deleted") or task.get("is_archived"):
                if task.get("id"):
                    await self._delete_task(conn, str(task.get("id")))
                continue
            due = task.get("due") or {}
            due_date = parse_datetime(due.get("date"), due.get("timezone")) or parse_datetime(
                due.get("datetime"), due.get("timezone")
            )
            # Todoist sync payload uses either `is_completed` (v2 REST) or `checked` (sync API).
            status = "done" if task.get("is_completed") or task.get("checked") else "todo"
            completed_at = parse_datetime(task.get("completed_at"))
            try:
                priority_raw = int(task.get("priority", 1))
            except Exception:
                priority_raw = 1
            priority = min(max(priority_raw, 0), 4)
            labels = [str(label_id) for label_id in task.get("labels", [])]
            todoist_id_raw = task.get("id")
            if not todoist_id_raw:
                logger.warning("Skipping Todoist item without id: %s", task)
                continue
            todoist_id = str(todoist_id_raw)

            result = await conn.fetchrow(
                """
                INSERT INTO tasks (
                    user_id, title, description, due_date, due_string, due_is_recurring,
                    priority, status, completed_at, todoist_id, todoist_project_id, todoist_section_id,
                    todoist_parent_id, todoist_order, sync_id, labels, created_at,
                    updated_at, todoist_raw, todoist_sync_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, COALESCE($17, NOW()), NOW(), $18, NOW()
                )
                ON CONFLICT (todoist_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    due_date = EXCLUDED.due_date,
                    due_string = EXCLUDED.due_string,
                    due_is_recurring = EXCLUDED.due_is_recurring,
                    priority = EXCLUDED.priority,
                    status = EXCLUDED.status,
                    completed_at = COALESCE(EXCLUDED.completed_at, tasks.completed_at),
                    todoist_project_id = EXCLUDED.todoist_project_id,
                    todoist_section_id = EXCLUDED.todoist_section_id,
                    todoist_parent_id = EXCLUDED.todoist_parent_id,
                    todoist_order = EXCLUDED.todoist_order,
                    sync_id = COALESCE(EXCLUDED.sync_id, tasks.sync_id),
                    labels = EXCLUDED.labels,
                    todoist_raw = EXCLUDED.todoist_raw,
                    todoist_sync_at = NOW(),
                    updated_at = NOW()
                RETURNING xmax = 0 AS inserted
                """,
                DEFAULT_USER_ID,
                task.get("content", ""),
                task.get("description"),
                due_date,
                due.get("string"),
                bool(due.get("is_recurring", False)),
                priority,
                status,
                completed_at,
                todoist_id,
                task.get("project_id"),
                task.get("section_id"),
                task.get("parent_id"),
                task.get("child_order", 0),
                task.get("sync_id"),
                labels or [],
                parse_datetime(task.get("created_at")),
                json.dumps(task),
            )

            if result and result["inserted"]:
                created += 1
            else:
                updated += 1

        return created, updated

    async def upsert_items(self, tasks: Sequence[Dict[str, Any]]) -> Tuple[int, int]:
        """
        Upsert Todoist items directly (used by webhook ingestion).
        """
        pool = self.pool or await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                return await self._upsert_tasks(conn, tasks)

    async def _collect_local_changes(self, conn, since: Optional[datetime]) -> Tuple[List[Dict[str, Any]], Dict[str, Dict[str, Any]]]:
        """
        Collect local tasks that need to be pushed to Todoist.
        """
        commands: List[Dict[str, Any]] = []
        metadata: Dict[str, Dict[str, Any]] = {}
        # Use the last incremental/full sync time if present; otherwise fall back
        # to an ancient timestamp so first/full syncs still push local changes.
        cutoff = since or datetime.min

        rows = await conn.fetch(
            """
            SELECT id, title, description, due_date, due_string, due_is_recurring, priority, status,
                   todoist_id, todoist_project_id, todoist_section_id, todoist_parent_id, todoist_order, labels
            FROM tasks
            WHERE user_id = $1
              AND (todoist_sync_at IS NULL OR updated_at > todoist_sync_at)
              AND updated_at > $2
            """,
            DEFAULT_USER_ID,
            cutoff,
        )

        for row in rows:
            todoist_id = row["todoist_id"]
            args: Dict[str, Any] = {
                "content": row["title"],
                "description": row["description"] or "",
                "priority": min(max(int(row["priority"] or 1), 1), 4),
            }
            if row["todoist_project_id"]:
                args["project_id"] = row["todoist_project_id"]
            if row["todoist_section_id"]:
                args["section_id"] = row["todoist_section_id"]
            if row["todoist_parent_id"]:
                args["parent_id"] = row["todoist_parent_id"]
            if row["labels"]:
                args["labels"] = row["labels"]

            if row["due_string"]:
                args["due_string"] = row["due_string"]
            elif row["due_date"]:
                args["due_datetime"] = row["due_date"].isoformat()

            if row["due_is_recurring"] and "due_string" in args:
                args["due_lang"] = "en"

            is_local_placeholder = todoist_id and str(todoist_id).startswith("local-")

            if not todoist_id or is_local_placeholder:
                temp_id = str(uuid4())
                command_uuid = str(uuid4())
                commands.append(
                    {
                        "type": "item_add",
                        "temp_id": temp_id,
                        "uuid": command_uuid,
                        "args": args,
                    }
                )
                metadata[command_uuid] = {"type": "add", "local_id": row["id"], "temp_id": temp_id}
            else:
                command_uuid = str(uuid4())
                if row["status"] == "done":
                    commands.append(
                        {
                            "type": "item_close",
                            "uuid": command_uuid,
                            "args": {"id": todoist_id},
                        }
                    )
                    metadata[command_uuid] = {"type": "close", "local_id": row["id"], "todoist_id": todoist_id}
                else:
                    args["id"] = todoist_id
                    commands.append(
                        {
                            "type": "item_update",
                            "uuid": command_uuid,
                            "args": args,
                        }
                    )
                    metadata[command_uuid] = {"type": "update", "local_id": row["id"], "todoist_id": todoist_id}

        return commands, metadata

    async def _apply_command_results(self, conn, payload: Dict[str, Any], metadata: Dict[str, Dict[str, Any]]) -> None:
        """Update local DB based on sync_status and temp_id_mapping."""
        sync_status = payload.get("sync_status", {})
        temp_map = payload.get("temp_id_mapping", {})
        now_ts = datetime.utcnow()

        for temp_id, todoist_id in temp_map.items():
            for meta in metadata.values():
                if meta.get("temp_id") == temp_id and meta.get("type") == "add":
                    # Ensure no duplicate rows conflict with unique todoist_id constraint
                    await conn.execute(
                        "DELETE FROM tasks WHERE todoist_id = $1 AND id <> $2",
                        todoist_id,
                        meta["local_id"],
                    )
                    await conn.execute(
                        """
                        UPDATE tasks
                        SET todoist_id = $1, todoist_sync_at = $2, updated_at = $2
                        WHERE id = $3
                        """,
                        todoist_id,
                        now_ts,
                        meta["local_id"],
                    )

        for command_uuid, status in sync_status.items():
            meta = metadata.get(command_uuid)
            if not meta:
                continue
            if status != "ok":
                logger.error("Todoist command %s failed: %s", command_uuid, status)
                continue
            if meta["type"] in {"update", "close"}:
                # If we sent a close, mark the local task done immediately
                if meta["type"] == "close":
                    await conn.execute(
                        """
                        UPDATE tasks
                        SET status = 'done',
                            completed_at = COALESCE(completed_at, $1),
                            todoist_sync_at = $1,
                            updated_at = $1
                        WHERE id = $2
                        """,
                        now_ts,
                        meta["local_id"],
                    )
                else:
                    await conn.execute(
                        "UPDATE tasks SET todoist_sync_at = $1, updated_at = $1 WHERE id = $2",
                        now_ts,
                        meta["local_id"],
                    )

    async def quick_add(self, text: str) -> Dict[str, Any]:
        """
        Use Todoist's quick/add API to parse natural language task creation.

        This leverages Todoist's NLP parser to understand:
        - Dates: "tomorrow", "next monday", "jan 23"
        - Times: "at 3pm", "at 14:00"
        - Projects: "#ProjectName"
        - Labels: "@label_name"
        - Priority: "p1", "p2", "p3", "p4"
        - Recurring: "every monday", "every week"

        Examples:
            - "Buy milk tomorrow #Groceries"
            - "Meeting with John at 3pm p1"
            - "Call mom every monday @phone"

        Args:
            text: Natural language task description

        Returns:
            Dict with success status and task data or error message
        """
        if not text or not text.strip():
            return {"success": False, "error": "Task text cannot be empty"}

        url = "https://api.todoist.com/sync/v9/quick/add"
        payload = {
            "text": text,
            "auto_reminder": True,  # Automatically add reminders for tasks with due dates
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    headers=self.headers,
                    data=payload,
                )

            if response.status_code != 200:
                error_text = response.text
                logger.error(f"Todoist quick_add failed: {response.status_code} - {error_text}")
                return {"success": False, "error": f"Todoist API error: {response.status_code}"}

            task_data = response.json()

            # Save the task to local database
            pool = self.pool or await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.transaction():
                    await self._upsert_tasks(conn, [task_data])

            logger.info(f"Quick add task created: {task_data.get('content')} (ID: {task_data.get('id')})")

            return {
                "success": True,
                "task": {
                    "id": str(task_data.get("id")),
                    "content": task_data.get("content"),
                    "description": task_data.get("description"),
                    "project_id": str(task_data.get("project_id")) if task_data.get("project_id") else None,
                    "section_id": str(task_data.get("section_id")) if task_data.get("section_id") else None,
                    "parent_id": str(task_data.get("parent_id")) if task_data.get("parent_id") else None,
                    "priority": task_data.get("priority", 1),
                    "due": task_data.get("due"),
                    "labels": task_data.get("labels", []),
                }
            }

        except httpx.TimeoutException:
            logger.error("Todoist quick_add timeout")
            return {"success": False, "error": "Request timed out"}
        except Exception as exc:
            logger.error(f"Todoist quick_add exception: {exc}", exc_info=True)
            return {"success": False, "error": str(exc)}

    async def create_subtask(
        self,
        parent_id: str,
        content: str,
        description: str = "",
        priority: int = 1
    ) -> Dict[str, Any]:
        """
        Create a subtask under a specific parent task using Todoist REST API v2.

        Args:
            parent_id: Todoist ID of the parent task
            content: Subtask title/content
            description: Optional description
            priority: Priority 1-4 (1=normal, 2=medium, 3=high, 4=urgent)

        Returns:
            Dict with success status and task data or error message
        """
        if not parent_id or not content or not content.strip():
            return {"success": False, "error": "Parent ID and content are required"}

        # Validate priority
        priority = max(1, min(4, priority))

        url = "https://api.todoist.com/rest/v2/tasks"
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "content": content.strip(),
            "parent_id": parent_id,
            "priority": priority,
        }

        if description and description.strip():
            payload["description"] = description.strip()

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json=payload,
                )

            if response.status_code not in (200, 201):
                error_text = response.text
                logger.error(f"Todoist create_subtask failed: {response.status_code} - {error_text}")
                return {"success": False, "error": f"Todoist API error: {response.status_code}"}

            task_data = response.json()

            # Save to local database
            pool = self.pool or await get_db_pool()
            async with pool.acquire() as conn:
                async with conn.transaction():
                    await self._upsert_tasks(conn, [task_data])

            logger.info(f"Subtask created: {task_data.get('content')} under parent {parent_id}")

            return {
                "success": True,
                "task": {
                    "id": str(task_data.get("id")),
                    "content": task_data.get("content"),
                    "description": task_data.get("description"),
                    "parent_id": parent_id,
                    "priority": task_data.get("priority", 1),
                    "project_id": str(task_data.get("project_id")) if task_data.get("project_id") else None,
                }
            }

        except httpx.TimeoutException:
            logger.error("Todoist create_subtask timeout")
            return {"success": False, "error": "Request timed out"}
        except Exception as exc:
            logger.error(f"Todoist create_subtask exception: {exc}", exc_info=True)
            return {"success": False, "error": str(exc)}

    async def sync(self, *, force_full: bool = False) -> TodoistSyncResult:
        """Run full or incremental sync based on stored sync token."""
        pool = self.pool or await get_db_pool()
        async with pool.acquire() as conn:
            state = await self._get_state(conn)
            sync_token = "*" if force_full or not state or not state.get("sync_token") else state["sync_token"]
            full_sync = sync_token == "*"

            last_sync_ts = None
            if state:
                last_sync_ts = state.get("last_incremental_sync") or state.get("last_full_sync")

            commands, metadata = await self._collect_local_changes(conn, last_sync_ts)
            payload = await self._fetch_sync_payload(sync_token, commands if commands else None)

            projects = payload.get("projects", [])
            sections = payload.get("sections", [])
            labels = payload.get("labels", [])
            items = payload.get("items", [])

            live_project_ids = [
                str(project["id"])
                for project in projects
                if project.get("id") and not project.get("is_deleted") and not project.get("is_archived")
            ]
            live_section_ids = [
                str(section["id"])
                for section in sections
                if section.get("id") and not section.get("is_deleted") and not section.get("is_archived")
            ]
            live_label_ids = [
                str(label["id"])
                for label in labels
                if label.get("id") and not label.get("is_deleted") and not label.get("is_archived")
            ]

            async with conn.transaction():
                project_count = await self._upsert_projects(conn, projects)
                section_count = await self._upsert_sections(conn, sections)
                label_count = await self._upsert_labels(conn, labels)
                created, updated = await self._upsert_tasks(conn, items)
                if full_sync:
                    await self._prune_missing_projects(conn, live_project_ids)
                    await self._prune_missing_sections(conn, live_section_ids)
                    await self._prune_missing_labels(conn, live_label_ids)
                if commands:
                    await self._apply_command_results(conn, payload, metadata)
                await self._update_state(conn, payload["sync_token"], full_sync=full_sync)

            result = TodoistSyncResult(
                projects=project_count,
                sections=section_count,
                labels=label_count,
                tasks=len(items),
                created=created,
                updated=updated,
                commands_sent=len(commands),
                sync_token=payload["sync_token"],
                full_sync=full_sync,
            )

            logger.info(
                "Todoist sync complete (%s): %s projects, %s sections, %s labels, %s tasks "
                "(%s created, %s updated)",
                "full" if full_sync else "incremental",
                project_count,
                section_count,
                label_count,
                len(items),
                created,
                updated,
            )

            return result


async def sync_todoist(*, force_full: bool = False) -> Dict[str, Any]:
    """
    Entry point used by scheduler and routers.

    Returns a dictionary with sync statistics for observability.
    """
    todoist_enabled = os.getenv("TODOIST_SYNC_ENABLED", "false").lower() == "true"
    api_token = os.getenv("TODOIST_API_TOKEN") or os.getenv("TODOIST_API_KEY")

    if not todoist_enabled:
        logger.debug("Todoist sync skipped (disabled via TODOIST_SYNC_ENABLED)")
        return {"enabled": False, "success": True, "message": "Todoist sync disabled"}

    if not api_token:
        logger.error("Todoist API token not configured")
        return {"enabled": True, "success": False, "error": "Todoist API token missing"}

    try:
        pool = await get_db_pool()
        service = TodoistSyncService(api_token, pool)
        result = await service.sync(force_full=force_full)
        return {"enabled": True, "success": True, **result.to_dict()}
    except Exception as exc:
        logger.error("Todoist sync failed: %s", exc, exc_info=True)
        return {"enabled": True, "success": False, "error": str(exc)}
