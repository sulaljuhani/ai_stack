"""
Read-only Todoist mirror endpoints for UI consumption.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from utils.db import get_db_pool
from utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/todoist", tags=["todoist"])
DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


class TodoistSection(BaseModel):
    id: str
    name: str
    section_order: int


class TodoistProject(BaseModel):
    id: str
    name: str
    color: Optional[str] = None
    parent_id: Optional[str] = None
    child_order: int = 0
    is_favorite: bool = False
    is_inbox_project: bool = False
    view_style: str = "list"
    sections: List[TodoistSection] = Field(default_factory=list)


class TodoistLabel(BaseModel):
    id: str
    name: str
    color: Optional[str] = None
    item_order: int = 0
    is_favorite: bool = False


class TodoistTaskNode(BaseModel):
    todoist_id: str
    content: str
    description: Optional[str] = None
    project_id: Optional[str] = None
    section_id: Optional[str] = None
    parent_id: Optional[str] = None
    priority: int = 1
    status: str
    due_date: Optional[str] = None
    due_string: Optional[str] = None
    labels: List[str] = []
    child_order: int = 0
    children: List["TodoistTaskNode"] = Field(default_factory=list)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {}


TodoistTaskNode.model_rebuild()


@router.get("/projects", response_model=List[TodoistProject])
async def list_projects():
    """Return Todoist projects with sections from the mirror tables."""
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        project_rows = await conn.fetch(
            """
            SELECT id, name, color, parent_id, child_order, is_favorite, is_inbox_project, view_style
            FROM todoist_projects
            WHERE user_id = $1
            ORDER BY parent_id NULLS FIRST, child_order, name
            """,
            DEFAULT_USER_ID,
        )

        section_rows = await conn.fetch(
            """
            SELECT id, project_id, name, section_order
            FROM todoist_sections
            WHERE user_id = $1
            ORDER BY project_id, section_order, name
            """,
            DEFAULT_USER_ID,
        )

    projects: Dict[str, TodoistProject] = {}
    for row in project_rows:
        projects[row["id"]] = TodoistProject(
            id=row["id"],
            name=row["name"],
            color=row["color"],
            parent_id=row["parent_id"],
            child_order=row["child_order"],
            is_favorite=row["is_favorite"],
            is_inbox_project=row["is_inbox_project"],
            view_style=row["view_style"],
            sections=[],
        )

    for row in section_rows:
        project = projects.get(row["project_id"])
        if not project:
            continue
        project.sections.append(
            TodoistSection(
                id=row["id"],
                name=row["name"],
                section_order=row["section_order"],
            )
        )

    return list(projects.values())


@router.get("/labels", response_model=List[TodoistLabel])
async def list_labels():
    """Return Todoist labels from the mirror tables."""
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

    return [
        TodoistLabel(
            id=row["id"],
            name=row["name"],
            color=row["color"],
            item_order=row["item_order"],
            is_favorite=row["is_favorite"],
        )
        for row in rows
    ]


def _build_task_tree(rows) -> List[TodoistTaskNode]:
    nodes: Dict[str, TodoistTaskNode] = {}
    for row in rows:
        todoist_id = row["todoist_id"]
        nodes[todoist_id] = TodoistTaskNode(
            todoist_id=todoist_id,
            content=row["title"],
            description=row["description"],
            project_id=row["todoist_project_id"],
            section_id=row["todoist_section_id"],
            parent_id=row["todoist_parent_id"],
            priority=row["priority"],
            status=row["status"],
            due_date=row["due_date"].isoformat() if row["due_date"] else None,
            due_string=row["due_string"],
            labels=row["labels"] or [],
            child_order=row["todoist_order"] or 0,
            children=[],
        )

    for node in nodes.values():
        parent_id = node.parent_id
        if parent_id and parent_id in nodes:
            nodes[parent_id].children.append(node)

    def sort_children(task: TodoistTaskNode):
        task.children.sort(key=lambda t: (t.child_order, t.content))
        for child in task.children:
            sort_children(child)

    roots = [task for task in nodes.values() if not task.parent_id or task.parent_id not in nodes]
    for root in roots:
        sort_children(root)
    roots.sort(key=lambda t: (t.child_order, t.content))
    return roots


@router.get("/tasks/tree", response_model=List[TodoistTaskNode])
async def todoist_task_tree(project_id: Optional[str] = Query(None, description="Todoist project id to scope tasks")):
    """Return a nested task tree using todoist_parent_id relationships."""
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
            project_id,
        )

    return _build_task_tree(rows)
