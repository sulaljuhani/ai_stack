"""
Team-level routing logic (Phase 4).

Hybrid strategy:
1) Keyword-based matching using team keywords from config.
2) LLM-based fallback for ambiguous requests.
"""

from __future__ import annotations

from typing import Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from agents.team_registry import get_team_config, get_team_keywords, list_teams
from utils.llm import get_routing_llm
from utils.logging import get_logger

logger = get_logger(__name__)


class TeamRoutingDecision(BaseModel):
    team: str
    confidence: float = 0.5
    reason: str = "LLM routing decision"


def simple_keyword_team_routing(message: str) -> Optional[str]:
    """Quick keyword-based team routing."""
    message_lower = message.lower()
    team_keywords = get_team_keywords()

    def has_logging_intent(msg: str) -> bool:
        # Avoid routing questions like "what did I log" back into the logging pipeline
        if msg.strip().startswith(("what", "when", "where")) or "what is" in msg or "last" in msg or "recent" in msg:
            return False
        logging_terms = ["log", "record", "track", "store", "save entry", "insert", "capture"]
        return any(term in msg for term in logging_terms)

    scores = {}
    for team, keywords in team_keywords.items():
        score = 0.0
        for kw, weight in keywords:
            if kw in message_lower:
                score += weight
        scores[team] = score

    max_team = max(scores.items(), key=lambda x: x[1]) if scores else (None, 0)
    # Lower threshold from 2.0 to 1.0 to allow single keyword matches
    if max_team[0] and max_team[1] >= 1.0:
        other_scores = [s for t, s in scores.items() if t != max_team[0]]
        # Require clear winner: score must be 2x higher than next best (or no competition)
        if not other_scores or max_team[1] >= 2 * max(other_scores):
            # Guard: only send to life_logging if message actually looks like a logging intent
            if max_team[0] == "life_logging" and not has_logging_intent(message_lower):
                logger.info(
                    "Keyword routing found life_logging but logging intent missing, skipping (score: %.1f)",
                    max_team[1],
                )
                return None
            logger.info("Team keyword routing: '%s...' -> %s (score: %.1f)", message[:50], max_team[0], max_team[1])
            return max_team[0]
    return None


async def llm_team_routing(message: str, context: dict) -> TeamRoutingDecision:
    """LLM-based routing to teams."""
    teams = list_teams()
    team_descriptions = "\n".join(
        f"- {name}: {get_team_config(name).description}"
        for name in teams
        if get_team_config(name)
    )

    # Build system prompt - escape braces for ChatPromptTemplate
    system_prompt = """You are a team routing agent for a hierarchical multi-agent system.

Available teams:
""" + team_descriptions + """

Pick the single most appropriate team for the user's request.

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no code blocks, no additional text.

Example valid response:
{{"team": "task_management", "confidence": 0.95, "reason": "User wants to create a task"}}

Required fields:
- team: string (must be one of the available team names above)
- confidence: float between 0.0 and 1.0
- reason: string (brief explanation of why this team was chosen)"""

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            (
                "user",
                """Message: {message}

Previous team: {previous_team}
Context: {context}

Return JSON only (no markdown):""",
            ),
        ]
    )

    llm = get_routing_llm()
    try:
        # Use default structured output mode (not json_mode which may not be supported)
        structured_llm = llm.with_structured_output(TeamRoutingDecision)
        decision = await structured_llm.ainvoke(
            prompt.format_messages(
                message=message,
                previous_team=context.get("previous_team", "none"),
                context=str(context),
            )
        )
        logger.info("Team LLM routing: '%s...' -> %s (confidence: %.2f)",
                   message[:50], decision.team, decision.confidence)
        return decision
    except Exception as e:
        # Better error logging to diagnose JSON parsing issues
        logger.error("Team routing failed: %s (type: %s)", e, type(e).__name__, exc_info=True)

        # Try manual JSON parsing as fallback if structured output fails
        try:
            import json
            import re
            # Try to extract JSON from the error or response
            error_str = str(e)
            # Look for JSON-like content in error message
            json_match = re.search(r'\{[^}]+\}', error_str)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if "team" in parsed:
                    logger.info("Recovered team routing via manual parsing: %s", parsed.get("team"))
                    return TeamRoutingDecision(**parsed)
        except Exception as parse_error:
            logger.debug("Manual JSON parsing also failed: %s", parse_error)

        # Don't default to task_management - return None to indicate routing failure
        # Let keyword routing or Sebastian handle it instead
        logger.warning("LLM team routing failed completely, will rely on keyword routing or Sebastian")
        return None


async def route_to_team(state) -> Optional[str]:
    """Route to a team using hybrid strategy."""
    messages = state.get("messages", [])
    if not messages:
        return None

    # Only route on the last user message; if last is assistant, end.
    last_message = messages[-1]
    from langchain_core.messages import HumanMessage
    if not isinstance(last_message, HumanMessage):
        return None

    message_content = last_message.content if hasattr(last_message, "content") else str(last_message)

    # Try keyword routing first
    keyword_team = simple_keyword_team_routing(message_content)
    if keyword_team:
        return keyword_team

    # Try LLM routing
    decision = await llm_team_routing(
        message_content,
        {
            "previous_team": state.get("previous_team"),
            "turn_count": state.get("turn_count", 0),
        },
    )

    # If LLM routing failed (returned None), keyword routing already tried
    # Return None to indicate routing failure - Sebastian will handle it
    if not decision:
        return None

    # Guard: only allow life_logging when the message mentions a logging intent
    msg_lower = message_content.lower()
    logging_terms = ["log", "record", "track", "store", "save entry", "insert", "capture"]
    if decision.team == "life_logging" and not any(term in msg_lower for term in logging_terms):
        logger.info(
            "LLM routed to life_logging but logging intent missing; deferring team choice (confidence=%.2f)",
            decision.confidence,
        )
        return None

    return decision.team
