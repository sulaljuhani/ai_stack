"""
Integration status utilities (Google Calendar, Todoist, OpenAI/Ollama).
"""

import os
from typing import Dict, Any
from langchain_core.tools import tool


@tool
async def integration_status() -> Dict[str, Any]:
    """
    Report configured status for common integrations.

    Returns:
        Dict showing whether credentials are present for Google Calendar and Todoist,
        plus the currently selected LLM provider.
    """
    google_configured = bool(os.getenv("GOOGLE_CLIENT_ID") and os.getenv("GOOGLE_CLIENT_SECRET"))
    todoist_configured = bool(os.getenv("TODOIST_API_TOKEN"))
    llm_provider = os.getenv("LLM_PROVIDER", "ollama")

    return {
        "success": True,
        "google_calendar": "configured" if google_configured else "not_configured",
        "todoist": "configured" if todoist_configured else "not_configured",
        "llm_provider": llm_provider,
    }
