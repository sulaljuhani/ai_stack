from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from starlette import status
from typing import Dict, Any, Optional
from datetime import datetime
import logging
from uuid import uuid4

from services.todoist_client import todoist_api

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/api/todoist/tasks/{task_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
async def complete_task(task_id: str):
    logger.info(f"Completing Todoist task {task_id}")
    try:
        await todoist_api.complete_task(task_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error completing task {task_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/api/todoist/tasks/{task_id}/uncomplete", status_code=status.HTTP_204_NO_CONTENT)
async def uncomplete_task(task_id: str):
    logger.info(f"Uncompleting Todoist task {task_id}")
    try:
        await todoist_api.uncomplete_task(task_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error uncompleting task {task_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

class UpdateTaskRequest(BaseModel):
    content: str

@router.post("/api/todoist/tasks/{task_id}/update", status_code=status.HTTP_204_NO_CONTENT)
async def update_task(task_id: str, request: UpdateTaskRequest):
    logger.info(f"Updating Todoist task {task_id}")
    try:
        await todoist_api.update_task(task_id, request.content)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating task {task_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.delete("/api/todoist/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str):
    logger.info(f"Deleting Todoist task {task_id}")
    try:
        await todoist_api.delete_task(task_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting task {task_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

class MoveTaskRequest(BaseModel):
    parent_id: str | None = None
    section_id: str | None = None

@router.post("/api/todoist/tasks/{task_id}/move", status_code=status.HTTP_204_NO_CONTENT)
async def move_task(task_id: str, request: MoveTaskRequest):
    logger.info(f"Moving Todoist task {task_id}")
    try:
        await todoist_api.move_task(task_id, request.parent_id, request.section_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error moving task {task_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

class CompleteTaskLocalRequest(BaseModel):
    complete: bool

@router.post("/api/todoist/tasks/{task_id}/complete-local", status_code=status.HTTP_204_NO_CONTENT)
async def complete_task_local(task_id: str, request: CompleteTaskLocalRequest):
    """
    Complete/uncomplete task in local database. Changes will be synced to Todoist automatically.
    This is faster than calling Todoist API directly.
    """
    logger.info(f"Updating task {task_id} completion status in local DB: {request.complete}")

    from utils.db import get_db_pool

    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            new_status = 'done' if request.complete else 'todo'

            query = """
                UPDATE tasks
                SET status = $1, updated_at = $2
                WHERE todoist_id = $3
            """

            result = await conn.execute(query, new_status, datetime.utcnow(), task_id)

            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="Task not found")

            logger.info(f"Successfully updated task {task_id} status to {new_status} in local DB. Will sync to Todoist automatically.")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task {task_id} status in local DB: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

class UpdateTaskLocalRequest(BaseModel):
    content: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    due_string: Optional[str] = None


class CreateTaskLocalRequest(BaseModel):
    content: str
    description: Optional[str] = None
    priority: Optional[int] = 1
    due_string: Optional[str] = None
    project_id: Optional[str] = None
    section_id: Optional[str] = None
    parent_id: Optional[str] = None

@router.post("/api/todoist/tasks/{task_id}/update-local", status_code=status.HTTP_204_NO_CONTENT)
async def update_task_local(task_id: str, request: UpdateTaskLocalRequest):
    """
    Update task in local database. Changes will be synced to Todoist automatically.
    This is faster than calling Todoist API directly and supports all fields.
    """
    logger.info(f"Updating task {task_id} in local DB: {request.dict(exclude_none=True)}")
    
    from utils.db import get_db_pool
    
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Build UPDATE query dynamically for provided fields
            updates = []
            values = []
            param_idx = 1
            
            if request.content is not None:
                updates.append(f"title = ${param_idx}")
                values.append(request.content)
                param_idx += 1
                
            if request.description is not None:
                updates.append(f"description = ${param_idx}")
                values.append(request.description)
                param_idx += 1
                
            if request.priority is not None:
                # Ensure priority is in valid range (1-4)
                priority = min(max(int(request.priority), 1), 4)
                updates.append(f"priority = ${param_idx}")
                values.append(priority)
                param_idx += 1
                
            if request.due_string is not None:
                updates.append(f"due_string = ${param_idx}")
                values.append(request.due_string if request.due_string else None)
                param_idx += 1
            
            if not updates:
                logger.warning(f"No fields to update for task {task_id}")
                return
            
            # Add updated_at to trigger sync (but NOT todoist_sync_at)
            updates.append(f"updated_at = ${param_idx}")
            values.append(datetime.utcnow())
            param_idx += 1
            
            # Add todoist_id to WHERE clause
            values.append(task_id)
            
            query = f"""
                UPDATE tasks 
                SET {', '.join(updates)}
                WHERE todoist_id = ${param_idx}
            """
            
            result = await conn.execute(query, *values)
            
            if result == "UPDATE 0":
                raise HTTPException(status_code=404, detail="Task not found")
                
            logger.info(f"Successfully updated task {task_id} in local DB. Will sync to Todoist automatically.")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task {task_id} in local DB: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/api/todoist/tasks/create-local", status_code=status.HTTP_201_CREATED)
async def create_task_local(request: CreateTaskLocalRequest):
    """
    Create a new task locally so it can be synced to Todoist on the next sync.
    """
    logger.info("Creating local Todoist task: %s", request.content)
    from utils.db import get_db_pool  # type: ignore
    from config import settings

    priority = min(max(int(request.priority or 1), 1), 4)
    todoist_id = f"local-{uuid4()}"

    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO tasks (
                    user_id,
                    title,
                    description,
                    priority,
                    status,
                    todoist_id,
                    todoist_project_id,
                    todoist_section_id,
                    todoist_parent_id,
                    todoist_order,
                    due_string,
                    due_is_recurring,
                    created_at,
                    updated_at
                ) VALUES (
                    $1, $2, $3, $4, 'todo', $5, $6, $7, $8, 0, $9, false, NOW(), NOW()
                )
                """,
                settings.default_user_id,
                request.content,
                request.description,
                priority,
                todoist_id,
                request.project_id,
                request.section_id,
                request.parent_id,
                request.due_string,
            )

        return {
            "success": True,
            "todoist_id": todoist_id,
            "content": request.content,
            "project_id": request.project_id,
            "section_id": request.section_id,
        }
    except Exception as e:
        logger.error("Error creating local Todoist task: %s", e, exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
