"""
Backend Adapter for Open WebUI to LangGraph
Translates Open WebUI API calls to LangGraph backend format
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import httpx
import os
import json
from typing import Dict, Any, List
import asyncio
from datetime import datetime

app = FastAPI(title="Open WebUI to LangGraph Adapter")

# Configuration
LANGGRAPH_URL = os.getenv("LANGGRAPH_URL", "http://langgraph-agents:8000")
DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"
DEFAULT_MODEL = "Sebastian"

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock configuration endpoint
@app.get("/api/config")
async def get_config():
    """Return mock configuration for Open WebUI initialization"""
    return {
        "status": True,
        "name": "AI Stack",
        "version": "0.1.0",
        "default_locale": "en-US",
        "images": True,
        "default_models": [DEFAULT_MODEL],
        "default_prompt_suggestions": [
            {
                "title": ["Help me plan", "my day"],
                "content": "Help me plan my day with tasks and reminders"
            },
            {
                "title": ["What's on", "my calendar?"],
                "content": "Show me my events for today"
            },
            {
                "title": ["Add a", "reminder"],
                "content": "Set a reminder for tomorrow"
            }
        ],
        "features": {
            "auth": False,
            "enable_signup": False,
            "enable_web_search": False,
            "enable_image_generation": False
        }
    }

# Mock models endpoint
@app.get("/api/models")
async def get_models():
    """Return available models"""
    return {
        "data": [
            {
                "id": DEFAULT_MODEL,
                "name": DEFAULT_MODEL,
                "object": "model",
                "created": int(datetime.now().timestamp()),
                "owned_by": "ai-stack",
                "info": {
                    "description": "Multi-agent AI assistant powered by LangGraph",
                    "capabilities": {
                        "vision": False,
                        "usage": True
                    }
                }
            }
        ]
    }

# Mock version endpoint
@app.get("/api/version")
async def get_version():
    """Return API version"""
    return {"version": "0.1.0"}

# Health check
@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{LANGGRAPH_URL}/health", timeout=5.0)
            langgraph_healthy = response.status_code == 200
    except:
        langgraph_healthy = False

    return {
        "status": "healthy" if langgraph_healthy else "degraded",
        "adapter": "running",
        "langgraph": "connected" if langgraph_healthy else "disconnected"
    }

# Chat completions endpoint (OpenAI compatible)
@app.post("/api/chat/completions")
async def chat_completions(request: Request):
    """
    Translate Open WebUI chat request to LangGraph format
    """
    try:
        body = await request.json()
        messages = body.get("messages", [])
        stream = body.get("stream", False)

        # Extract the last user message
        user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break

        if not user_message:
            raise HTTPException(status_code=400, detail="No user message found")

        # Prepare LangGraph request
        langgraph_request = {
            "message": user_message,
            "user_id": DEFAULT_USER_ID,
            "session_id": body.get("session_id", f"session-{datetime.now().timestamp()}"),
            "workspace": "default"
        }

        # Forward to LangGraph
        async with httpx.AsyncClient() as client:
            if stream:
                # Streaming response
                async def generate():
                    async with client.stream(
                        "POST",
                        f"{LANGGRAPH_URL}/chat",
                        json=langgraph_request,
                        timeout=120.0
                    ) as response:
                        response.raise_for_status()
                        async for line in response.aiter_lines():
                            if line.strip():
                                # Convert LangGraph SSE to OpenAI format
                                if line.startswith("data: "):
                                    data = json.loads(line[6:])

                                    # Convert to OpenAI streaming format
                                    openai_chunk = {
                                        "id": f"chatcmpl-{datetime.now().timestamp()}",
                                        "object": "chat.completion.chunk",
                                        "created": int(datetime.now().timestamp()),
                                        "model": DEFAULT_MODEL,
                                        "choices": [{
                                            "index": 0,
                                            "delta": {
                                                "content": data.get("content", "")
                                            },
                                            "finish_reason": data.get("finish_reason")
                                        }]
                                    }

                                    yield f"data: {json.dumps(openai_chunk)}\n\n"

                        yield "data: [DONE]\n\n"

                return StreamingResponse(generate(), media_type="text/event-stream")

            else:
                # Non-streaming response
                response = await client.post(
                    f"{LANGGRAPH_URL}/chat",
                    json=langgraph_request,
                    timeout=120.0
                )
                response.raise_for_status()
                langgraph_response = response.json()

                # Convert to OpenAI format
                openai_response = {
                    "id": f"chatcmpl-{datetime.now().timestamp()}",
                    "object": "chat.completion",
                    "created": int(datetime.now().timestamp()),
                    "model": DEFAULT_MODEL,
                    "choices": [{
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": langgraph_response.get("response", "")
                        },
                        "finish_reason": "stop"
                    }],
                    "usage": {
                        "prompt_tokens": 0,
                        "completion_tokens": 0,
                        "total_tokens": 0
                    }
                }

                return openai_response

    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"LangGraph backend error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat endpoint (direct)
@app.post("/api/chat")
async def chat(request: Request):
    """Direct chat endpoint"""
    return await chat_completions(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090)
