"""
Multi-agent state schema with Redis persistence and pruning.
"""

from typing import (
    TypedDict,
    Annotated,
    Optional,
    Sequence,
    Dict,
    Any,
    List,
)
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph.message import add_messages
from config import settings
from utils.logging import get_logger

logger = get_logger(__name__)


def update_current_agent(existing: str, new_value: str) -> str:
    """
    Reducer to handle multiple current_agent updates in one step.

    LangGraph will call this reducer for each update, passing the
    accumulated result and the new value. This allows supervisors
    to hand off immediately without causing concurrent update errors.

    Args:
        existing: Current agent value
        new_value: New agent value for this update

    Returns:
        The new agent name if non-empty, otherwise existing
    """
    # Accept the new value if it's non-empty, otherwise keep existing
    return new_value if new_value else existing


def update_previous_agent(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """
    Reducer to handle multiple previous_agent updates in one step.

    Similar to update_current_agent, this prevents concurrent update errors
    when multiple nodes try to set previous_agent in the same step.

    Args:
        existing: Current previous_agent value
        new_value: New previous_agent value for this update

    Returns:
        The new agent name, or None if new_value is None
    """
    # Accept the new value (including None)
    return new_value


def update_target_agent(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """
    Reducer to handle multiple target_agent updates in one step.

    Prevents concurrent update errors when routing logic and agents both
    try to update target_agent for handoffs in the same step.

    Args:
        existing: Current target_agent value
        new_value: New target_agent value for this update

    Returns:
        The new agent name, or None if new_value is None
    """
    # Accept the new value (including None)
    return new_value


def update_current_team(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """
    Reducer to handle multiple current_team updates in one step.

    Prevents concurrent update errors when routing logic and team supervisors
    try to update current_team in the same step.

    Args:
        existing: Current team value
        new_value: New team value for this update

    Returns:
        The new team name, or None if new_value is None
    """
    # Accept the new value (including None)
    return new_value


def update_previous_team(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """
    Reducer to handle multiple previous_team updates in one step.

    Prevents concurrent update errors when routing logic and team supervisors
    try to update previous_team in the same step.

    Args:
        existing: Previous team value
        new_value: New previous team value for this update

    Returns:
        The new team name, or None if new_value is None
    """
    # Accept the new value (including None)
    return new_value


def update_team_context(existing: Dict[str, Any], new_value: Dict[str, Any]) -> Dict[str, Any]:
    """
    Reducer to handle multiple team_context updates in one step.

    Merges dictionary updates when multiple nodes try to update team_context
    in the same step.

    Args:
        existing: Current team_context dictionary
        new_value: New team_context updates to merge

    Returns:
        Merged dictionary with new values taking precedence
    """
    # Merge dictionaries - new values override existing
    return {**existing, **new_value}


def update_agent_contexts(existing: dict, new_value: dict) -> dict:
    """
    Reducer to handle multiple agent_contexts updates in one step.

    Merges dictionary updates when multiple agents try to update their
    contexts in the same step.

    Args:
        existing: Current agent_contexts dictionary
        new_value: New agent_contexts updates to merge

    Returns:
        Merged dictionary with new values taking precedence
    """
    # Merge dictionaries - new values override existing
    return {**existing, **new_value}


def update_turn_count(existing: int, new_value: int) -> int:
    """
    Reducer to handle multiple turn_count updates in one step.

    Uses maximum value when multiple nodes try to increment turn_count
    in the same step.

    Args:
        existing: Current turn_count value
        new_value: New turn_count value

    Returns:
        Maximum of existing and new value
    """
    # Use maximum to handle concurrent increments
    return max(existing, new_value)


def update_updated_at(existing: str, new_value: str) -> str:
    """
    Reducer to handle multiple updated_at updates in one step.

    Uses maximum (most recent) timestamp when multiple nodes try to update
    updated_at in the same step.

    Args:
        existing: Current updated_at timestamp (ISO format)
        new_value: New updated_at timestamp (ISO format)

    Returns:
        Most recent timestamp
    """
    # Use maximum to get most recent timestamp (ISO format strings compare correctly)
    return max(existing, new_value)


def update_validation_results(existing: List[Dict[str, Any]], new_value: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Reducer to handle multiple validation_results updates in one step.

    Appends new validation results when multiple validators try to add
    results in the same step.

    Args:
        existing: Current validation_results list
        new_value: New validation results to append

    Returns:
        Combined list with all validation results
    """
    # Append new results to existing list
    return existing + new_value


def update_handoff_reason(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """
    Reducer to handle multiple handoff_reason updates in one step.

    Accepts the latest non-empty reason.
    """
    return new_value if new_value else existing


def update_target_team(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """
    Reducer to handle multiple target_team updates in one step.

    Accepts the latest non-empty value.
    """
    return new_value if new_value else existing


class MultiAgentState(TypedDict):
    """
    Shared state across all agents with domain-specific contexts.

    This state is persisted in Redis and passed between agents during handoffs.

    Key improvements:
    - Uses add_messages reducer for automatic message handling
    - Consolidated agent_contexts dict (simpler than separate dicts)
    - Minimal state fields (following LangGraph best practices)
    """

    # Conversation history (with automatic message appending via add_messages)
    messages: Annotated[Sequence[BaseMessage], add_messages]

    # Active agent tracking (with reducers to handle concurrent updates)
    current_agent: Annotated[str, update_current_agent]
    previous_agent: Annotated[Optional[str], update_previous_agent]

    # User context
    user_id: str
    workspace: str
    session_id: str

    # Domain-specific contexts (consolidated - each agent updates its own key)
    agent_contexts: Annotated[dict, update_agent_contexts]  # {"food": {...}, "task": {...}, "event": {...}, "reminder": {...}, "memory": {...}}

    # Handoff metadata
    handoff_reason: Annotated[Optional[str], update_handoff_reason]
    target_agent: Annotated[Optional[str], update_target_agent]
    target_team: Annotated[Optional[str], update_target_team]

    # Metadata
    turn_count: Annotated[int, update_turn_count]
    created_at: str
    updated_at: Annotated[str, update_updated_at]

    # Team-level coordination (Phase 1: hierarchical groundwork)
    current_team: Annotated[Optional[str], update_current_team]
    previous_team: Annotated[Optional[str], update_previous_team]
    team_context: Annotated[Dict[str, Any], update_team_context]
    pipeline_state: Optional[Dict[str, Any]]
    validation_results: Annotated[List[Dict[str, Any]], update_validation_results]


def prune_messages(messages: Sequence[BaseMessage]) -> list[BaseMessage]:
    """
    Prune message history to keep state manageable.

    Strategy:
    - Keep first message (context)
    - Keep last N messages (recent conversation)
    - Summarize middle if needed (future enhancement)

    Args:
        messages: Full message history

    Returns:
        Pruned message list
    """
    if not settings.state_pruning_enabled:
        return list(messages)

    max_messages = settings.state_max_messages

    if len(messages) <= max_messages:
        return list(messages)

    logger.info(f"Pruning messages: {len(messages)} -> {max_messages}")

    # Keep first message (initial context) and last N-1 messages
    pruned = [messages[0]] + list(messages[-(max_messages - 1):])

    # Log what we're dropping
    dropped_count = len(messages) - len(pruned)
    logger.debug(f"Dropped {dropped_count} messages from history")

    return pruned


def create_initial_state(
    user_id: str,
    workspace: str,
    session_id: str,
    initial_message: Optional[str] = None
) -> MultiAgentState:
    """
    Create initial state for a new conversation.

    Args:
        user_id: User identifier
        workspace: Workspace identifier
        session_id: Conversation session ID
        initial_message: Optional first message

    Returns:
        Initial state dictionary
    """
    from datetime import datetime

    now = datetime.utcnow().isoformat()

    messages = []
    if initial_message:
        messages.append(HumanMessage(content=initial_message))

    return MultiAgentState(
        messages=messages,
        current_agent="",  # Will be set by router
        previous_agent=None,
        user_id=user_id,
        workspace=workspace,
        session_id=session_id,
        agent_contexts={},  # Consolidated contexts
        handoff_reason=None,
        target_agent=None,
        target_team=None,
        turn_count=0,
        created_at=now,
        updated_at=now,
        current_team=None,
        previous_team=None,
        team_context={},
        pipeline_state=None,
        validation_results=[],
    )


def should_prune_state(state: MultiAgentState) -> bool:
    """
    Check if state should be pruned.

    Args:
        state: Current state

    Returns:
        True if pruning is needed
    """
    if not settings.state_pruning_enabled:
        return False

    return len(state["messages"]) > settings.state_max_messages
