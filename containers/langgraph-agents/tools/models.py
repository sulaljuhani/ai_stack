"""
Shared response models for tools to keep outputs consistent.
"""

from typing import Any, List, Optional
from pydantic import BaseModel, Field


class Envelope(BaseModel):
    success: bool = True
    message: Optional[str] = None
    count: Optional[int] = None
    items: Optional[List[Any]] = None
    meta: Optional[dict] = None


class SearchItem(BaseModel):
    id: Any
    title: Optional[str] = None
    snippet: Optional[str] = None
    score: Optional[float] = Field(default=None, ge=-1.0, le=1.0)
    source: Optional[str] = None


class SearchEnvelope(Envelope):
    items: List[SearchItem] = []


class BulkEnvelope(Envelope):
    requested: int = 0
    succeeded: int = 0
    failed: int = 0
    errors: List[str] = []


def wrap_response(result: Any) -> Any:
    """
    Normalize a tool result into a predictable envelope while remaining
    backward compatible for existing dict outputs that already include "success".
    """
    if isinstance(result, Envelope) or isinstance(result, BaseModel):
        return result

    # Preserve dicts that already signal status
    if isinstance(result, dict):
        if "success" in result:
            return result
        return Envelope(success=True, meta=result)

    if isinstance(result, list):
        return Envelope(success=True, count=len(result), items=result)

    if isinstance(result, bool):
        return Envelope(success=bool(result))

    if result is None:
        return Envelope(success=True, message=None)

    # Strings / numbers fall back to message
    return Envelope(success=True, message=str(result))
