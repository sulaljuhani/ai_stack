import httpx
from fastapi import HTTPException
from starlette import status
from config import settings
import logging

logger = logging.getLogger(__name__)

class TodoistAPI:
    def __init__(self):
        self.api_token = settings.todoist_api_token
        if not self.api_token:
            raise ValueError("TODOIST_API_TOKEN is not set in the environment.")
        self.base_url = "https://api.todoist.com/rest/v2"
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    async def _request(self, method: str, endpoint: str, **kwargs):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(method, f"{self.base_url}/{endpoint}", headers=self.headers, **kwargs)
                response.raise_for_status()
                # Some Todoist API calls return 204 No Content
                if response.status_code == status.HTTP_204_NO_CONTENT:
                    return None
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Todoist API error: {e.response.status_code} - {e.response.text}")
                raise HTTPException(status_code=e.response.status_code, detail=f"Todoist API Error: {e.response.text}")
            except httpx.RequestError as e:
                logger.error(f"Error connecting to Todoist API: {e}")
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Could not connect to Todoist API")

    async def complete_task(self, task_id: str):
        return await self._request("POST", f"tasks/{task_id}/close")

    async def uncomplete_task(self, task_id: str):
        return await self._request("POST", f"tasks/{task_id}/reopen")

    async def update_task(self, task_id: str, content: str):
        return await self._request("POST", f"tasks/{task_id}", json={"content": content})

    async def delete_task(self, task_id: str):
        return await self._request("DELETE", f"tasks/{task_id}")

    async def move_task(self, task_id: str, parent_id: str | None, section_id: str | None):
        payload = {}
        if parent_id:
            payload['parent_id'] = parent_id
        if section_id:
            payload['section_id'] = section_id
        
        return await self._request("POST", f"tasks/{task_id}", json=payload)

todoist_api = TodoistAPI()
