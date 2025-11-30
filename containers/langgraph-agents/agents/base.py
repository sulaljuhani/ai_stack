"""
Base agent functionality with handoff detection.

Key improvements following LangGraph tutorial best practices:
- Module-level LLM caching (created once, reused forever)
- Context injection via messages (not prompt templates)
- Simple agent functions (minimal overhead)
"""

import json
from typing import Literal, Optional, List, Callable
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel, Field
from graph.state import MultiAgentState
from utils.llm import get_agent_llm
from utils.logging import get_logger

logger = get_logger(__name__)


# ============================================================================
# Module-Level LLM Cache (following tutorial pattern)
# ============================================================================

_cached_llms = {}  # Cache LLM instances by temperature

def get_cached_llm(temperature: float = 0.7):
    """
    Get or create cached LLM instance.

    Following LangGraph tutorial pattern: create LLM once, reuse forever.

    Args:
        temperature: LLM temperature setting

    Returns:
        Cached LLM instance
    """
    cache_key = f"llm_{temperature}"
    if cache_key not in _cached_llms:
        logger.info(f"Creating cached LLM with temperature={temperature}")
        _cached_llms[cache_key] = get_agent_llm(temperature=temperature)
    return _cached_llms[cache_key]


def stringify_tool_messages(state_or_messages):
    """
    State modifier that ensures all ToolMessage content is stringified.

    OpenAI-compatible APIs (like DeepSeek) require tool results to be strings,
    not arrays or objects. This function converts all ToolMessage content to
    JSON strings if needed. It accepts either the full state dict (as passed by
    create_react_agent state_modifier) or a bare list of messages.

    Args:
        state_or_messages: Full state or list of messages

    Returns:
        Messages with stringified ToolMessage content
    """
    # create_react_agent passes the entire state into state_modifier; pull messages if so
    if isinstance(state_or_messages, dict):
        messages = state_or_messages.get("messages", [])
    else:
        messages = state_or_messages or []

    modified = []
    for msg in messages:
        if isinstance(msg, ToolMessage):
            # If content is not a string, stringify it
            if not isinstance(msg.content, str):
                try:
                    # Convert lists/dicts to JSON strings
                    stringified_content = json.dumps(msg.content, default=str, ensure_ascii=False)
                    # Create new ToolMessage with stringified content
                    modified.append(ToolMessage(
                        content=stringified_content,
                        tool_call_id=msg.tool_call_id,
                        name=msg.name if hasattr(msg, 'name') else None,
                    ))
                except Exception as e:
                    logger.warning(f"Failed to stringify tool message: {e}, using str()")
                    modified.append(ToolMessage(
                        content=str(msg.content),
                        tool_call_id=msg.tool_call_id,
                        name=msg.name if hasattr(msg, 'name') else None,
                    ))
            else:
                modified.append(msg)
        else:
            modified.append(msg)
    return modified


def create_cached_react_agent(
    agent_name: str,
    tools: List[Callable],
    temperature: float = 0.7,
):
    """
    Create and cache a ReAct agent.

    Following LangGraph tutorial pattern: create agent once, reuse forever.

    Args:
        agent_name: Name of the agent (for logging)
        tools: List of tools available to this agent
        temperature: LLM temperature

    Returns:
        Cached ReAct agent
    """
    llm = get_cached_llm(temperature)

    # Create agent with strict response format for OpenAI API compatibility (e.g., DeepSeek)
    # This ensures tool results are properly serialized as strings
    agent = create_react_agent(
        model=llm,
        tools=tools,
        # Use state_modifier to stringify tool results for OpenAI compatibility
        state_modifier=stringify_tool_messages,
    )

    logger.info(f"Created {agent_name} with {len(tools)} tools")
    return agent


class HandoffDecision(BaseModel):
    """Structured handoff decision."""

    should_handoff: bool
    target_agent: Optional[Literal["food_agent", "task_agent", "event_agent", "reminder_agent", "note_agent", "knowledge_agent"]] = None
    reason: Optional[str] = None


async def detect_handoff(
    state: MultiAgentState,
    current_agent: str,
    last_response: str
) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Detect if handoff is needed based on conversation.

    Uses LLM to detect domain shifts and determine if another agent
    should handle the request.

    Args:
        state: Current conversation state
        current_agent: Name of current agent
        last_response: Agent's last response

    Returns:
        Tuple of (should_handoff, target_agent, reason)
    """
    # Check if explicit handoff was requested in state
    if state.get("target_agent"):
        target = state["target_agent"]
        reason = state.get("handoff_reason", "Explicit handoff requested")
        logger.info(f"Explicit handoff: {current_agent} → {target}")
        return True, target, reason

    # Get last user message
    messages = state["messages"]
    if not messages or len(messages) < 2:
        return False, None, None

    # Find last human message
    last_human_msg = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_human_msg = msg.content
            break

    if not last_human_msg:
        return False, None, None

    # Use LLM to detect domain shift
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a handoff detection system for a multi-agent system.

Current agent: {current_agent}

Agent domains:
- food_agent: Food, meals, eating, nutrition, dietary preferences
- task_agent: Tasks, todos, productivity, planning, notes, and memory storage
- reminder_agent: Reminders, alerts, nudges, follow-ups
- event_agent: Calendar, schedule, meetings, appointments, availability
- note_agent: Capturing/writing/appending notes into the vault
- knowledge_agent: Memory retrieval, document/vault search

Analyze if the user's request requires a different agent.
Look for:
1. Explicit requests ("create a task", "add to calendar", etc.)
2. Domain-specific keywords
3. Context shift from current domain

Be decisive but don't over-trigger handoffs for casual mentions."""),
        ("user", """User's message: {user_message}
Agent's response: {agent_response}

Should we hand off to a different agent?""")
    ])

    llm = get_agent_llm(temperature=0.3)
    structured_llm = llm.with_structured_output(HandoffDecision)

    try:
        decision = await structured_llm.ainvoke(
            prompt.format_messages(
                current_agent=current_agent,
                user_message=last_human_msg,
                agent_response=last_response
            )
        )

        if decision.should_handoff:
            logger.info(
                f"Handoff detected: {current_agent} → {decision.target_agent} "
                f"(reason: {decision.reason})"
            )
            return True, decision.target_agent, decision.reason
        else:
            return False, None, None

    except Exception as e:
        logger.error(f"Error detecting handoff: {e}")
        return False, None, None


def load_system_prompt(agent_name: str, prompt_file: str | None = None, partial_files: list[str] | None = None) -> str:
    """
    Load system prompt from file and combine with universal personality.

    Args:
        agent_name: Name of agent (food_agent, task_agent, etc.)

    Returns:
        Combined system prompt text (personality + agent-specific instructions)
    """
    import os

    # Load universal Sebastian personality
    personality_file = "prompts/sebastian_personality.txt"
    personality_prompt = ""
    try:
        if os.path.exists(personality_file):
            with open(personality_file, "r") as f:
                personality_prompt = f.read().strip()
    except Exception as e:
        logger.warning(f"Could not load personality prompt: {e}")

    # Load agent-specific prompt
    prompt_file = prompt_file or f"prompts/{agent_name}.txt"
    agent_prompt = ""
    try:
        if os.path.exists(prompt_file):
            with open(prompt_file, "r") as f:
                agent_prompt = f.read().strip()
        else:
            logger.warning(f"Prompt file not found: {prompt_file}")
            agent_prompt = f"You are a helpful {agent_name.replace('_', ' ')}."
    except Exception as e:
        logger.error(f"Error loading prompt: {e}")
        agent_prompt = f"You are a helpful {agent_name.replace('_', ' ')}."

    partial_prompts = []
    for partial in partial_files or []:
        try:
            if os.path.exists(partial):
                with open(partial, "r") as f:
                    partial_prompts.append(f.read().strip())
        except Exception as e:
            logger.warning(f"Could not load partial prompt {partial}: {e}")

    sections = [p for p in [personality_prompt, *partial_prompts, agent_prompt] if p]
    return "\n\n---\n\n".join(sections)


def create_context_message(state: MultiAgentState, agent_name: str, system_prompt: str) -> dict:
    """
    Create a context system message for the agent.

    Following LangGraph tutorial pattern: inject context as messages, not template variables.

    Args:
        state: Current conversation state
        agent_name: Name of agent (e.g., "food", "task", "event")
        system_prompt: Base system prompt text

    Returns:
        System message dict with full context
    """
    # Get agent-specific context
    agent_context = state.get("agent_contexts", {}).get(agent_name, {})

    # Build shared context summary
    shared_context_lines = []
    for ctx_agent, ctx_data in state.get("agent_contexts", {}).items():
        if ctx_agent != agent_name and ctx_data:
            last_topic = ctx_data.get("last_topic", "")
            if last_topic:
                shared_context_lines.append(f"- {ctx_agent.title()}: {last_topic[:100]}")

    shared_context = "\n".join(shared_context_lines) if shared_context_lines else "None"

    # Construct full context message
    context_content = f"""{system_prompt}

## Current Session Context

- User: {state['user_id']}
- Session: {state['session_id']}
- Turn: {state['turn_count']}
- Previous Agent: {state.get('previous_agent', 'None')}

## Shared Context from Other Agents

{shared_context}

## Your Recent Context

{agent_context.get('last_topic', 'No recent interactions')}
"""

    return {"role": "system", "content": context_content}
