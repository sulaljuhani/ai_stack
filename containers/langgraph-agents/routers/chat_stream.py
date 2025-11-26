"""
OpenAI-compatible streaming chat endpoint for Open WebUI integration.
Uses Server-Sent Events (SSE) for real-time token streaming.
"""

import json
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from config import settings
from graph.workflow import create_workflow
from graph.state import create_initial_state
from utils.logging import get_logger

logger = get_logger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

# Global workflow instance (shared with main.py)
workflow_app = None


def get_workflow():
    """Get or create workflow instance."""
    global workflow_app
    if workflow_app is None:
        workflow_app = create_workflow()
    return workflow_app


# ============================================================================
# Request/Response Models (OpenAI-compatible)
# ============================================================================

class ChatMessage(BaseModel):
    """OpenAI-compatible chat message."""
    role: str = Field(..., description="Message role (user, assistant, system)")
    content: str = Field(..., description="Message content")
    name: Optional[str] = Field(None, description="Optional name for the message")


class ChatCompletionRequest(BaseModel):
    """OpenAI-compatible chat completion request."""
    model: str = Field(..., description="Model identifier")
    messages: List[ChatMessage] = Field(..., description="List of messages in the conversation")
    stream: bool = Field(default=True, description="Enable streaming responses")
    temperature: float = Field(default=0.7, ge=0, le=2, description="Sampling temperature")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate")
    user: Optional[str] = Field(None, description="User identifier")


# ============================================================================
# SSE Streaming Functions
# ============================================================================

def format_sse_event(data: Dict[str, Any]) -> str:
    """
    Format data as Server-Sent Event.

    Args:
        data: Dictionary to send as SSE event

    Returns:
        Formatted SSE string
    """
    return f"data: {json.dumps(data)}\n\n"


def format_sse_done() -> str:
    """Format SSE completion signal."""
    return "data: [DONE]\n\n"


async def stream_agent_response(
    request: ChatCompletionRequest,
    user_id: str,
    session_id: str
) -> Any:
    """
    Stream agent response as SSE events.

    Yields OpenAI-compatible SSE chunks for real-time streaming.

    Args:
        request: Chat completion request
        user_id: User identifier
        session_id: Session/thread identifier

    Yields:
        SSE formatted chunks
    """
    try:
        # Extract last user message
        user_messages = [msg for msg in request.messages if msg.role == "user"]
        if not user_messages:
            raise HTTPException(status_code=400, detail="No user message found")

        last_message = user_messages[-1].content

        logger.info(f"Streaming chat request from user {user_id}: {last_message[:50]}...")

        # Create config for checkpointing
        config = {
            "configurable": {
                "thread_id": session_id,
            }
        }

        # Create initial state
        initial_state = create_initial_state(
            user_id=user_id,
            workspace="default",
            session_id=session_id,
            initial_message=last_message
        )

        # Get workflow
        app = get_workflow()

        # Generate unique completion ID
        completion_id = f"chatcmpl-{uuid4().hex[:8]}"
        created_timestamp = int(time.time())

        # Track if we've started streaming
        started = False
        full_response = ""

        # Stream workflow events
        async for event in app.astream_events(
            initial_state,
            config=config,
            version="v2"
        ):
            event_type = event.get("event")

            # Handle chat model streaming (token generation)
            if event_type == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content"):
                    content = chunk.content
                    if content:
                        # Send first chunk with role
                        if not started:
                            yield format_sse_event({
                                "id": completion_id,
                                "object": "chat.completion.chunk",
                                "created": created_timestamp,
                                "model": request.model,
                                "choices": [{
                                    "index": 0,
                                    "delta": {
                                        "role": "assistant",
                                        "content": content
                                    },
                                    "finish_reason": None
                                }]
                            })
                            started = True
                        else:
                            # Send content chunks
                            yield format_sse_event({
                                "id": completion_id,
                                "object": "chat.completion.chunk",
                                "created": created_timestamp,
                                "model": request.model,
                                "choices": [{
                                    "index": 0,
                                    "delta": {
                                        "content": content
                                    },
                                    "finish_reason": None
                                }]
                            })

                        full_response += content

            # Handle tool execution events (optional: show "thinking")
            elif event_type == "on_tool_start":
                tool_name = event.get("name", "unknown")
                logger.debug(f"Tool started: {tool_name}")
                # Optionally send a thinking indicator
                # yield format_sse_event({"type": "thinking", "tool": tool_name})

            elif event_type == "on_tool_end":
                tool_name = event.get("name", "unknown")
                logger.debug(f"Tool completed: {tool_name}")

        # If no streaming occurred, use fallback
        if not started:
            # Get the final result
            result = await app.ainvoke(initial_state, config=config)
            messages = result.get("messages", [])
            last_msg = messages[-1] if messages else None

            if last_msg:
                content = last_msg.content if hasattr(last_msg, 'content') else str(last_msg)

                # Send complete response as single chunk
                yield format_sse_event({
                    "id": completion_id,
                    "object": "chat.completion.chunk",
                    "created": created_timestamp,
                    "model": request.model,
                    "choices": [{
                        "index": 0,
                        "delta": {
                            "role": "assistant",
                            "content": content
                        },
                        "finish_reason": "stop"
                    }]
                })
        else:
            # Send finish chunk
            yield format_sse_event({
                "id": completion_id,
                "object": "chat.completion.chunk",
                "created": created_timestamp,
                "model": request.model,
                "choices": [{
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop"
                }]
            })

        # Send completion signal
        yield format_sse_done()

        logger.info(f"Streaming completed for session {session_id}")

    except Exception as e:
        logger.error(f"Error during streaming: {e}", exc_info=True)
        # Send error as SSE event
        yield format_sse_event({
            "error": {
                "message": str(e),
                "type": "server_error",
                "code": "internal_error"
            }
        })
        yield format_sse_done()


# ============================================================================
# API Endpoints
# ============================================================================

@router.post("/v1/chat/completions")
@limiter.limit("20/minute")
async def chat_completions(
    request: Request,
    completion_request: ChatCompletionRequest
):
    """
    OpenAI-compatible chat completions endpoint with streaming support.

    This endpoint is designed to work with Open WebUI and other
    OpenAI-compatible clients.

    Args:
        completion_request: Chat completion request

    Returns:
        StreamingResponse with SSE events (if stream=True)
        or JSON response (if stream=False)
    """
    try:
        # Extract user ID (use default single-user ID or from request)
        user_id = completion_request.user or settings.default_user_id

        # Generate session ID from messages hash or use provided
        # For now, use a simple hash of the conversation
        import hashlib
        msg_hash = hashlib.md5(
            json.dumps([m.model_dump() for m in completion_request.messages]).encode()
        ).hexdigest()[:8]
        session_id = f"session-{msg_hash}"

        # If streaming is requested
        if completion_request.stream:
            return StreamingResponse(
                stream_agent_response(
                    completion_request,
                    user_id,
                    session_id
                ),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",  # Disable nginx buffering
                }
            )

        # Non-streaming response (not recommended, but supported)
        else:
            raise HTTPException(
                status_code=501,
                detail="Non-streaming mode not yet implemented. Please use stream=true"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat completions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/models")
async def list_models():
    """
    List available models (OpenAI-compatible).

    Returns a list of model identifiers that can be used
    with the chat completions endpoint.
    """
    return {
        "object": "list",
        "data": [
            {
                "id": "langgraph-agent",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "ai-stack",
                "permission": [],
                "root": "langgraph-agent",
                "parent": None,
            },
            {
                "id": "sebastian",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "ai-stack",
                "permission": [],
                "root": "sebastian",
                "parent": None,
            }
        ]
    }
