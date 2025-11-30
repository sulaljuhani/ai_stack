"""
Tools that expose the Todoist mirror tables to agents.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from langchain_core.tools import tool

from utils.db import get_db_pool
from utils.logging import get_logger
from services.todoist_sync import TodoistSyncService

logger = get_logger(__name__)
DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


async def _fetch_projects_and_sections(conn) -> Dict[str, Dict[str, Any]]:
    """Return projects keyed by id with attached sections list."""
    projects: Dict[str, Dict[str, Any]] = {}

    project_rows = await conn.fetch(
        """
        SELECT id, name, color, parent_id, child_order, is_favorite, is_inbox_project, view_style
        FROM todoist_projects
        WHERE user_id = $1
        ORDER BY parent_id NULLS FIRST, child_order, name
        """,
        DEFAULT_USER_ID,
    )
    for row in project_rows:
        projects[row["id"]] = {
            "id": row["id"],
            "name": row["name"],
            "color": row["color"],
            "parent_id": row["parent_id"],
            "child_order": row["child_order"],
            "is_favorite": row["is_favorite"],
            "is_inbox_project": row["is_inbox_project"],
            "view_style": row["view_style"],
            "sections": [],
        }

    section_rows = await conn.fetch(
        """
        SELECT id, project_id, name, section_order
        FROM todoist_sections
        WHERE user_id = $1
        ORDER BY project_id, section_order, name
        """,
        DEFAULT_USER_ID,
    )
    for row in section_rows:
        project = projects.get(row["project_id"])
        if project is None:
            continue
        project["sections"].append(
            {
                "id": row["id"],
                "name": row["name"],
                "section_order": row["section_order"],
            }
        )

    return projects


def _build_task_tree(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Build a nested task tree using todoist_parent_id."""
    nodes: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        todoist_id = row["todoist_id"]
        nodes[todoist_id] = {
            "todoist_id": todoist_id,
            "content": row["title"],
            "description": row["description"],
            "project_id": row["todoist_project_id"],
            "section_id": row["todoist_section_id"],
            "parent_id": row["todoist_parent_id"],
            "priority": row["priority"],
            "status": row["status"],
            "due_date": row["due_date"].isoformat() if row["due_date"] else None,
            "due_string": row["due_string"],
            "labels": row["labels"] or [],
            "child_order": row["todoist_order"] or 0,
            "children": [],
        }

    for node in nodes.values():
        parent_id = node["parent_id"]
        if parent_id and parent_id in nodes:
            nodes[parent_id]["children"].append(node)

    def sort_children(task: Dict[str, Any]):
        task["children"].sort(key=lambda t: (t.get("child_order", 0), t.get("content", "")))
        for child in task["children"]:
            sort_children(child)

    roots = [task for task in nodes.values() if not task["parent_id"] or task["parent_id"] not in nodes]
    for root in roots:
        sort_children(root)
    roots.sort(key=lambda t: (t.get("child_order", 0), t.get("content", "")))
    return roots


@tool
async def get_todoist_project_tree(project_name: str = "") -> Dict[str, Any]:
    """
    Return Todoist projects (with sections) mirrored in the local database.

    Args:
        project_name: Optional case-insensitive filter to a single project name.
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        projects = await _fetch_projects_and_sections(conn)

    if project_name:
        filtered = {k: v for k, v in projects.items() if v["name"].lower() == project_name.lower()}
        projects = filtered

    return {"success": True, "projects": list(projects.values())}


@tool
async def get_todoist_labels() -> Dict[str, Any]:
    """
    Return Todoist labels mirrored in the local database.
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, name, color, item_order, is_favorite
            FROM todoist_labels
            WHERE user_id = $1
            ORDER BY item_order, name
            """,
            DEFAULT_USER_ID,
        )

    labels = [
        {
            "id": row["id"],
            "name": row["name"],
            "color": row["color"],
            "item_order": row["item_order"],
            "is_favorite": row["is_favorite"],
        }
        for row in rows
    ]

    return {"success": True, "labels": labels}


@tool
async def get_todoist_task_tree(project_id: str = "") -> Dict[str, Any]:
    """
    Return a nested Todoist task tree using todoist_parent_id relationships.

    Args:
        project_id: Optional Todoist project id to scope tasks.
    """
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                todoist_id,
                title,
                description,
                todoist_project_id,
                todoist_section_id,
                todoist_parent_id,
                todoist_order,
                priority,
                status,
                due_date,
                due_string,
                labels
            FROM tasks
            WHERE user_id = $1
              AND todoist_id IS NOT NULL
              AND ($2::text IS NULL OR todoist_project_id = $2)
            """,
            DEFAULT_USER_ID,
            project_id if project_id else None,
        )

    tree = _build_task_tree(rows)
    return {"success": True, "tasks": tree}


@tool
async def add_task_with_nlp(text: str) -> str:
    """
    Create a task using natural language powered by Todoist's NLP parser.

    This tool understands complex task descriptions including dates, projects,
    priorities, and labels. It's the recommended way for agents to create tasks
    as it handles all the parsing automatically.

    Natural language capabilities:
    - Dates: "tomorrow", "next monday", "jan 23", "in 2 weeks"
    - Times: "at 3pm", "at 14:00"
    - Projects: "#ProjectName" (e.g., "#Work", "#Personal")
    - Labels: "@label_name" (e.g., "@urgent", "@phone")
    - Priority: "p1" (urgent), "p2" (high), "p3" (medium), "p4" (low)
    - Recurring: "every monday", "every week", "every 2 days"

    Examples:
        - add_task_with_nlp("Buy milk tomorrow #Groceries")
          → Creates task "Buy milk" due tomorrow in Groceries project

        - add_task_with_nlp("Meeting with John at 3pm p1 @work")
          → Creates urgent task "Meeting with John" at 3pm with work label

        - add_task_with_nlp("Gym every monday at 6am #Health")
          → Creates recurring task every Monday at 6am

        - add_task_with_nlp("Call mom this friday @phone")
          → Creates task "Call mom" this Friday with phone label

    Args:
        text: Natural language task description

    Returns:
        JSON string with success status and task details, or error message
    """
    # Check if Todoist is configured
    api_token = os.getenv("TODOIST_API_TOKEN") or os.getenv("TODOIST_API_KEY")
    if not api_token:
        return '{"success": false, "error": "Todoist integration not configured. Please set TODOIST_API_TOKEN environment variable."}'

    try:
        pool = await get_db_pool()
        service = TodoistSyncService(api_token, pool)

        result = await service.quick_add(text)

        if result.get("success"):
            task = result["task"]
            logger.info(f"Agent created task via NLP: {task.get('content')}")
            return f'{{"success": true, "task_id": "{task.get("id")}", "content": "{task.get("content")}", "project_id": "{task.get("project_id")}", "due": {task.get("due")}, "priority": {task.get("priority")}}}'
        else:
            error = result.get("error", "Unknown error")
            logger.error(f"Agent quick_add failed: {error}")
            return f'{{"success": false, "error": "{error}"}}'

    except Exception as exc:
        logger.error(f"Exception in add_task_with_nlp: {exc}", exc_info=True)
        return f'{{"success": false, "error": "Internal error: {str(exc)}"}}'


@tool
async def add_subtask(
    parent_id: str,
    content: str,
    description: str = "",
    priority: int = 1
) -> str:
    """
    Create a subtask under a specific parent task.

    This tool creates a hierarchical relationship where the new task becomes
    a child of the specified parent. Subtasks inherit the project from their
    parent and appear nested in the UI.

    Use this when you need explicit control over the parent-child relationship,
    such as breaking down a larger task into smaller steps.

    Args:
        parent_id: The Todoist ID of the parent task (e.g., "7654321098")
        content: The subtask title/content (e.g., "Research options")
        description: Optional detailed description of the subtask
        priority: Priority level from 1-4:
                 1 = normal (default)
                 2 = medium
                 3 = high
                 4 = urgent

    Examples:
        - add_subtask(parent_id="7654321098", content="Research vendors", priority=2)
          → Creates medium-priority subtask "Research vendors"

        - add_subtask(
              parent_id="7654321098",
              content="Get quotes",
              description="Contact at least 3 vendors",
              priority=3
          )
          → Creates high-priority subtask with detailed description

    Returns:
        JSON string with success status and task details, or error message
    """
    # Check if Todoist is configured
    api_token = os.getenv("TODOIST_API_TOKEN") or os.getenv("TODOIST_API_KEY")
    if not api_token:
        return '{"success": false, "error": "Todoist integration not configured. Please set TODOIST_API_TOKEN environment variable."}'

    # Validate inputs
    if not parent_id or not content:
        return '{"success": false, "error": "Both parent_id and content are required"}'

    try:
        pool = await get_db_pool()
        service = TodoistSyncService(api_token, pool)

        result = await service.create_subtask(
            parent_id=parent_id,
            content=content,
            description=description,
            priority=priority
        )

        if result.get("success"):
            task = result["task"]
            logger.info(f"Agent created subtask: {task.get('content')} under {parent_id}")
            return f'{{"success": true, "task_id": "{task.get("id")}", "content": "{task.get("content")}", "parent_id": "{task.get("parent_id")}", "priority": {task.get("priority")}}}'
        else:
            error = result.get("error", "Unknown error")
            logger.error(f"Agent add_subtask failed: {error}")
            return f'{{"success": false, "error": "{error}"}}'

    except Exception as exc:
        logger.error(f"Exception in add_subtask: {exc}", exc_info=True)
        return f'{{"success": false, "error": "Internal error: {str(exc)}"}}'
