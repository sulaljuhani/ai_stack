
import httpx
import asyncio

TODOIST_API_TOKEN = "8b4a9beb1df5eeefbc4f4dca2a05ebe837d2001c"
TASK_ID = "9775123758"
BASE_URL = "https://api.todoist.com/rest/v2"

headers = {
    "Authorization": f"Bearer {TODOIST_API_TOKEN}",
}

async def complete_task():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BASE_URL}/tasks/{TASK_ID}/close", headers=headers)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 204:
                print("Task successfully completed (according to API).")
            else:
                print(f"Response Body: {response.text}")
        except httpx.HTTPStatusError as e:
            print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(complete_task())
