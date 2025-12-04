"""
Hybrid routing logic for agent selection.

Strategy: Simple queries → direct routing via keywords
         Complex queries → LLM-based routing
"""

from typing import Literal
from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field, field_validator
from .state import MultiAgentState
from utils.llm import get_routing_llm
from utils.logging import get_logger
from agents.agent_registry import get_weighted_keywords, list_agent_names, get_agent_descriptions
from agents.team_registry import get_team_config

logger = get_logger(__name__)


class RoutingDecision(BaseModel):
    """Structured routing decision."""

    agent: str
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str

    @field_validator("agent")
    @classmethod
    def validate_agent(cls, v: str) -> str:
        valid_agents = list_agent_names()
        if v not in valid_agents:
            raise ValueError(f"Unknown agent '{v}', expected one of {valid_agents}")
        return v


WEIGHTED_KEYWORDS = get_weighted_keywords()
AGENT_DESCRIPTIONS = get_agent_descriptions()


def simple_keyword_routing(message: str, allowed_agents: list[str] | None = None) -> str | None:
    """
    Attempt simple keyword-based routing.

    Args:
        message: User message content
        allowed_agents: Optional list of agents allowed for this routing (e.g., current team)

    Returns:
        Agent name if confident match, None otherwise
    """
    message_lower = message.lower()

    # Count weighted keyword matches for each agent
    scores = {}
    for agent, keywords in WEIGHTED_KEYWORDS.items():
        if allowed_agents is not None and agent not in allowed_agents:
            continue
        score = 0.0
        for kw, weight in keywords:
            if kw in message_lower:
                score += weight
        scores[agent] = score

    # Bias memory/doc queries to knowledge_agent if defined
    memory_score = scores.get("knowledge_agent", 0)
    if memory_score >= 2 and memory_score >= max(scores.values()):
        logger.info(f"Simple routing: '{message[:50]}...' → knowledge_agent (memory score: {memory_score})")
        return "knowledge_agent"

    # Get highest scoring agent
    max_agent = max(scores.items(), key=lambda x: x[1])

    # Require at least 2 keyword matches and clear winner
    if max_agent[1] >= 2:
        # Check if it's a clear winner (2x more than others)
        other_scores = [s for a, s in scores.items() if a != max_agent[0]]
        if not other_scores or max_agent[1] >= 2 * max(other_scores):
            logger.info(f"Simple routing: '{message[:50]}...' → {max_agent[0]} (score: {max_agent[1]})")
            return max_agent[0]

    return None


async def llm_routing(message: str, context: dict) -> RoutingDecision:
    """
    Use LLM to make routing decision for complex/ambiguous queries.

    Args:
        message: User message content
        context: Additional context (previous agent, conversation history, etc.)

    Returns:
        Structured routing decision
    """
    allowed_agents: list[str] | None = context.get("allowed_agents")
    descriptions = AGENT_DESCRIPTIONS
    if allowed_agents is not None:
        descriptions = {name: desc for name, desc in AGENT_DESCRIPTIONS.items() if name in allowed_agents}

    available_agents = "\n".join(
        f"- {name}: {desc or 'No description set'}"
        for name, desc in descriptions.items()
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are a routing agent that determines which specialized agent should handle a user's request.

Available agents:
{available_agents}

Analyze the user's message and determine which agent is most appropriate.
Consider:
1. The primary intent of the message
2. Which agent has the most relevant expertise
3. Context from previous conversation if available

Note: Memory/knowledge retrieval → knowledge_agent; note capture/writing → note_agent.

Be decisive - pick the single most appropriate agent."""),
        ("user", """Message: {message}

Previous agent: {previous_agent}
Context: {context}

Which agent should handle this request? Provide your reasoning.""")
    ])

    llm = get_routing_llm()

    try:
        # Try structured output if supported (OpenAI, Claude, etc.)
        try:
            structured_llm = llm.with_structured_output(RoutingDecision)
            decision = await structured_llm.ainvoke(
                prompt.format_messages(
                    message=message,
                    previous_agent=context.get("previous_agent", "none"),
                    context=str(context)
                )
            )
        except NotImplementedError:
            # Fallback for models without structured output (Ollama)
            logger.debug("Structured output not supported, using text parsing")

            # Add JSON format instruction to prompt
            json_prompt = ChatPromptTemplate.from_messages([
                ("system", f"""You are a routing assistant. Analyze the message and route to the appropriate agent.

Available agents:
{available_agents}

Note: Memory/knowledge retrieval → knowledge_agent; note capture/writing → note_agent.

Respond with ONLY a valid JSON object in this exact format:
{{"agent": "agent_name", "confidence": 0.9, "reason": "brief explanation"}}

Message: {{message}}
Previous agent: {{previous_agent}}
Context: {{context}}""")
            ])

            response = await llm.ainvoke(
                json_prompt.format_messages(
                    message=message,
                    previous_agent=context.get("previous_agent", "none"),
                    context=str(context)
                )
            )

            # Parse JSON from response
            import json
            import re

            response_text = response.content if hasattr(response, 'content') else str(response)

            # Extract JSON from response (handles markdown code blocks)
            json_match = re.search(r'\{[^}]+\}', response_text)
            if json_match:
                decision_dict = json.loads(json_match.group(0))
                decision = RoutingDecision(**decision_dict)
            else:
                raise ValueError("Could not parse JSON from LLM response")

        logger.info(
            f"LLM routing: '{message[:50]}...' → {decision.agent} "
            f"(confidence: {decision.confidence:.2f}, reason: {decision.reason})"
        )

        return decision

    except Exception as e:
        logger.error(f"LLM routing failed: {e}, defaulting to food_agent")
        default_agent = list_agent_names()[0] if list_agent_names() else "food_agent"
        return RoutingDecision(
            agent=default_agent,
            confidence=0.5,
            reason="Default fallback due to routing error"
        )


async def route_to_agent(state: MultiAgentState) -> str:
    """
    Main routing function using hybrid strategy.

    Strategy:
    1. Try simple keyword routing first (fast)
    2. Fall back to LLM routing for complex/ambiguous cases

    Args:
        state: Current conversation state

    Returns:
        Agent name to route to
    """
    # Determine allowed agents based on current team (if any)
    allowed_agents = None
    current_team = state.get("current_team")
    if current_team:
        team_cfg = get_team_config(current_team)
        if team_cfg:
            allowed_agents = list({team_cfg.supervisor, *team_cfg.agent_names})

    # Get last user message
    messages = state["messages"]
    if not messages:
        default_agents = allowed_agents or list_agent_names()
        return default_agents[0]  # Default

    last_message = messages[-1]
    message_content = last_message.content if hasattr(last_message, 'content') else str(last_message)

    # Try simple routing first
    simple_result = simple_keyword_routing(message_content, allowed_agents)
    if simple_result:
        return simple_result

    # Fall back to LLM routing
    context = {
        "previous_agent": state.get("previous_agent"),
        "current_agent": state.get("current_agent"),
        "turn_count": state.get("turn_count", 0),
        "allowed_agents": allowed_agents,
    }

    decision = await llm_routing(message_content, context)

    # Enforce allowed agents if provided
    if allowed_agents and decision.agent not in allowed_agents:
        return allowed_agents[0]

    return decision.agent


def should_route_to_new_agent(state: MultiAgentState) -> bool:
    """
    Check if we should re-route to a different agent.

    Args:
        state: Current conversation state

    Returns:
        True if routing is needed
    """
    # Route if:
    # 1. No current agent set
    # 2. Explicit handoff requested
    # 3. User message suggests domain shift

    if not state.get("current_agent"):
        return True

    if state.get("target_agent"):
        return True

    # Check if last message suggests domain shift
    # (This would be enhanced with more sophisticated detection)
    messages = state["messages"]
    if messages and len(messages) > 0:
        last_msg = messages[-1]
        if hasattr(last_msg, 'content'):
            # Simple check for explicit agent requests
            content_lower = last_msg.content.lower()
            if any(phrase in content_lower for phrase in [
                "switch to", "talk to", "ask the", "different agent"
            ]):
                return True

    return False
