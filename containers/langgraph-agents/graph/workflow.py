"""
LangGraph workflow definition for multi-agent system.
"""

from typing import Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.checkpoint.memory import MemorySaver
from .state import MultiAgentState, prune_messages, should_prune_state
from .routing import route_to_agent, should_route_to_new_agent
from .team_routing import route_to_team
from .checkpointer import RedisCheckpointSaver
from agents.agent_registry import list_agent_names, get_agent_node
from agents.team_registry import get_team_config, list_teams
from utils.logging import get_logger

logger = get_logger(__name__)

LIFE_LOGGING_PIPELINE = [
    "table_discovery",
    "schema_inspector",
    "db_operation",
    "logging_validator",
    "logging_supervisor",
]


def create_routing_node():
    """
    Create the classifier + router node.

    Following LangGraph tutorial pattern but combined for efficiency.
    This node performs both classification (determining message type)
    and routing (selecting appropriate agent).

    Tutorial equivalent:
    - Tutorial: separate "classifier" + "router" nodes
    - This system: combined into one "routing" node (more efficient for 3+ agents)
    """

    async def routing_node(state: MultiAgentState) -> MultiAgentState:
        """
        Classify message type and route to appropriate agent.

        Hybrid routing strategy (more sophisticated than tutorial):
        1. Keyword classification (fast path) - O(1) lookup
        2. LLM classification (fallback) - For ambiguous cases
        3. Context-aware routing - Considers previous agent, handoff requests

        Returns:
            State update with routing decision
        """
        # Circuit breaker for event_retriever loop
        if state.get("previous_agent") == "event_retriever":
            logger.info("Circuit breaker: event_retriever finished, forcing handoff to sebastian_supervisor")
            return {
                **state,
                "previous_agent": state.get("current_agent"),
                "current_agent": "sebastian_supervisor",
                "target_agent": None,
                "current_team": None,
                "handoff_reason": "circuit_breaker",
            }
        team_ctx = state.get("team_context", {})
        team_state = team_ctx.get(state.get("current_team"), {}) if state.get("current_team") else {}
        logger.info(
            "Routing node: classifying and routing message (current_agent=%s, target_agent=%s, current_team=%s, stage=%s)",
            state.get("current_agent"),
            state.get("target_agent"),
            state.get("current_team"),
            team_state.get("workflow_stage"),
        )

        # Fast exit for completed event pipeline to prevent rerouting loops
        ev_ctx = team_ctx.get("event_management", {})
        if ev_ctx.get("workflow_stage") == "complete" or ev_ctx.get("last_result"):
            logger.info("Routing fast-exit: event pipeline complete, handoff to sebastian_supervisor")
            return {
                **state,
                "previous_agent": state.get("current_agent"),
                "current_agent": "sebastian_supervisor",
                "target_agent": None,
                "current_team": None,
                "handoff_reason": "event_complete",
            }

        # Prune state if needed (prevent memory bloat)
        if should_prune_state(state):
            logger.info("Pruning state messages to maintain context window")
            state["messages"] = prune_messages(state["messages"])

        # Honor explicit handoffs before any team routing to avoid loops
        if state.get("target_agent"):
            target_agent = state["target_agent"]
            logger.info(
                "Explicit handoff requested -> %s (current_team=%s, stage=%s)",
                target_agent,
                state.get("current_team"),
                team_state.get("workflow_stage"),
            )
            return {
                **state,
                "previous_agent": state.get("current_agent"),
                "current_agent": target_agent,
                "target_agent": None,
                "handoff_reason": None,
            }
        # Also honor team-scoped handoffs stored in team_context
        team_target = team_state.get("target_agent")
        if team_target:
            logger.info(
                "Team-scoped handoff requested -> %s (current_team=%s, stage=%s)",
                team_target,
                state.get("current_team"),
                team_state.get("workflow_stage"),
            )
            return {
                **state,
                "previous_agent": state.get("current_agent"),
                "current_agent": team_target,
                "target_agent": None,
                "handoff_reason": None,
                "team_context": {
                    **team_ctx,
                    state.get("current_team"): {
                        **team_state,
                        "target_agent": None,
                    } if state.get("current_team") else {},
                },
            }

        # Safety: break out of life_logging loop after validation when supervisor is active
        if (
            state.get("current_agent") == "logging_supervisor"
            and state.get("current_team") == "life_logging"
            and team_state.get("workflow_stage") == "logging_validator"
        ):
            logger.info("Breaking life_logging loop post-validation; handing to Sebastian")
            return {
                **state,
                "previous_agent": state.get("current_agent"),
                "current_agent": "sebastian_supervisor",
                "current_team": None,
                "target_agent": None,
                "handoff_reason": "life_logging_complete",
                "team_context": {
                    **team_ctx,
                    "life_logging": {**team_state, "workflow_stage": "complete"},
                },
            }

        # If life_logging is marked complete, exit team routing and return to Sebastian
        if state.get("current_team") == "life_logging" and team_state.get("workflow_stage") == "complete":
            logger.info("Life logging marked complete; exiting team to Sebastian")
            return {
                **state,
                "previous_agent": state.get("current_agent"),
                "current_agent": "sebastian_supervisor",
                "current_team": None,
                "target_agent": None,
                "handoff_reason": "life_logging_complete",
            }

        # Deterministic pipeline routing for life_logging to avoid loops
        if state.get("current_team") == "life_logging":
            stage = team_state.get("workflow_stage")
            if not stage:
                next_agent = "table_discovery"
                next_stage = "table_discovery"
            elif stage == "table_discovery":
                next_agent = "schema_inspector"
                next_stage = "schema_inspector"
            elif stage == "schema_inspector":
                next_agent = "db_operation"
                next_stage = "db_operation"
            elif stage == "db_operation":
                next_agent = "logging_validator"
                next_stage = "logging_validator"
            elif stage == "logging_validator":
                next_agent = "logging_supervisor"
                next_stage = "logging_validator"
            else:
                next_agent = "logging_supervisor"
                next_stage = stage

            logger.info("Life logging pipeline routing -> %s (stage=%s)", next_agent, next_stage)
            return {
                **state,
                "previous_agent": state.get("current_agent"),
                "current_agent": next_agent,
                "target_agent": None,
                "handoff_reason": None,
                "team_context": {
                    **team_ctx,
                    "life_logging": {
                        **team_state,
                        "workflow_stage": next_stage,
                    },
                },
            }

        # Team routing layer (Phase 4) - ONLY if not already in a team
        # Once a team is selected, stay in that team until task completes
        if not state.get("current_team"):
            team = await route_to_team(state)
            if team:
                team_cfg = get_team_config(team)
                supervisor = team_cfg.supervisor if team_cfg else None
                if supervisor:
                    logger.info("Team routing selected %s -> supervisor %s", team, supervisor)
                    return {
                        **state,
                        "previous_agent": state.get("current_agent"),
                        "previous_team": state.get("current_team"),
                        "current_team": team,
                        "current_agent": supervisor,
                        "target_team": None,
                        "handoff_reason": None,
                    }
        else:
            logger.info("Already in team %s, skipping team routing", state.get("current_team"))

            # When already in a team, constrain routing within that team and avoid global re-routing
            team_cfg = get_team_config(state.get("current_team"))
            if team_cfg:
                inferred_target = state.get("target_agent")
                                target = inferred_target or team_cfg.supervisor
                logger.info(
                    "Team-constrained routing -> %s (inferred_target=%s, team_stage=%s)",
                    target,
                    inferred_target,
                    team_state.get("workflow_stage"),
                )
                return {
                    **state,
                    "previous_agent": state.get("current_agent"),
                    "current_agent": target,
                    "target_agent": None,
                    "handoff_reason": None,
                }

        # Classify message type and determine target agent
        # (Combined classifier + router logic in route_to_agent)
        target = await route_to_agent(state)

        logger.info(f"Classification complete → routed to: {target}")

        # Update state with routing decision
        return {
            **state,
            "previous_agent": state.get("current_agent"),
            "current_agent": target,
            "target_agent": None,  # Clear any previous handoff
            "handoff_reason": None,
        }

    return routing_node


def should_continue(state: MultiAgentState) -> Literal["route", "end"]:
    """
    Determine if we should continue or end the conversation.

    Args:
        state: Current state

    Returns:
        "route" to continue routing, "end" to finish
    """
    team_ctx_full = state.get("team_context", {})
    current_team = state.get("current_team")
    team_ctx = team_ctx_full.get(current_team, {}) if current_team else {}
    inferred_target = team_ctx.get("target_agent")

    # Check if handoff was requested (explicit or in team_context)
    if state.get("target_agent") or inferred_target:
        tgt = state.get("target_agent") or inferred_target
        logger.info(
            "Handoff to %s, continuing (current_team=%s, stage=%s, source=%s)",
            tgt,
            state.get("current_team"),
            team_ctx.get("workflow_stage"),
            "state" if state.get("target_agent") else "team_context",
        )
        return "route"

    # Event pipeline stop conditions (mirror task flow)
    if state.get("current_team") == "event_management":
        ev_ctx = team_ctx_full.get("event_management", {})
        ev_result = ev_ctx.get("last_result") or state.get("agent_contexts", {}).get("event", {}).get("last_result")
        if ev_ctx.get("workflow_stage") == "complete":
            logger.info("Event pipeline marked complete, ending conversation")
            return "end"
        if ev_result and not state.get("target_agent"):
            logger.info("Event pipeline has result and no handoff, ending conversation")
            return "end"
        if state.get("current_agent") == "event_creator" and state.get("turn_count", 0) > 5:
            logger.info("Event pipeline over turn budget from creator, ending to prevent recursion")
            return "end"

    # Generic team completion guard: if a pipeline marks itself complete or has a final result
    # with no pending handoff, end the conversation to avoid rerouting loops.
    if current_team:
        if team_ctx.get("workflow_stage") == "complete":
            logger.info("%s pipeline marked complete, ending conversation", current_team)
            return "end"
        if team_ctx.get("last_result") and not state.get("target_agent") and not team_ctx.get("target_agent"):
            logger.info("%s pipeline has result and no handoff, ending conversation", current_team)
            return "end"

    # Deterministic life_logging pipeline: keep routing until supervisor finishes
    if state.get("current_team") == "life_logging":
        stage = team_ctx.get("workflow_stage")
        if stage == "complete":
            logger.info("Life logging pipeline marked complete, ending conversation")
            return "end"
        # Allow supervisor to signal end only after validator stage without further targets
        if stage == "logging_validator" and state.get("current_agent") == "logging_supervisor" and not state.get("target_agent"):
            logger.info("Life logging supervisor post-validation with no handoff, ending conversation")
            return "end"
        logger.info("Life logging pipeline continuing (stage=%s)", stage)
        return "route"

    # Stop task pipeline if marked complete
    if state.get("current_team") == "task_management":
        if team_ctx.get("workflow_stage") == "complete":
            logger.info("Task pipeline marked complete, ending conversation")
            return "end"
        if team_ctx.get("last_result") and not state.get("target_agent"):
            logger.info("Task pipeline has result, ending conversation")
            return "end"

    # Check if we need to route to a new agent
    if should_route_to_new_agent(state):
        logger.info(
            "Re-routing needed (current_agent=%s, target_agent=%s, current_team=%s)",
            state.get("current_agent"),
            state.get("target_agent"),
            state.get("current_team"),
        )
        return "route"

    # Otherwise, conversation ends
    logger.info("Conversation ending")
    return "end"


def _build_route_to_agent_node(default_agent: str):
    def route_to_agent_node(state: MultiAgentState) -> str:
        """
        Conditional edge function to route to specific agent.
        """
        agent = state.get("current_agent", default_agent)
        logger.info(f"Routing to agent node: {agent}")
        return agent

    return route_to_agent_node


def _route_from_sebastian(state: MultiAgentState) -> str:
    """Conditional routing from Sebastian to target agent or end conversation.

    When Sebastian responds directly to the user (error/clarification messages),
    target_agent is not set, and the conversation should end to wait for user response.
    """
    target = state.get("target_agent")
    if target:
        return target
    # No target agent means Sebastian is waiting for user response - end conversation
    return "end"


def create_workflow(checkpointer: BaseCheckpointSaver = None) -> StateGraph:
    """
    Create the LangGraph workflow for multi-agent system.

    Workflow structure (enhanced from LangGraph tutorial):

    START → routing (classifier+router) → [food_agent | task_agent | event_agent | reminder_agent]
                ↑                                                   ↓
                └────────────────────────── should_continue ───────┘
                                           ↓
                                         END

    Differences from tutorial:
    - Tutorial: START → classifier → router → agent → END (linear)
    - This: START → routing → agent → (loop or end) (supports handoffs)

    Nodes:
    1. START (implicit entry point)
    2. routing - Combined classifier + router (more efficient than 2 nodes)
    3. food_agent, task_agent, event_agent, reminder_agent - Specialized agents
    4. should_continue - Decision function (route for handoff, or end)
    5. END (terminal state)

    Args:
        checkpointer: Optional checkpointer for state persistence

    Returns:
        Compiled workflow graph
    """
    logger.info("Creating workflow graph")

    agent_names = list_agent_names()
    if not agent_names:
        raise RuntimeError("No agents registered")

    # Create graph
    workflow = StateGraph(MultiAgentState)

    # Add nodes (following tutorial pattern with enhancements)
    workflow.add_node("routing", create_routing_node())  # Classifier + Router combined
    for agent_name in agent_names:
        workflow.add_node(agent_name, get_agent_node(agent_name))

    # Add Sebastian main supervisor
    if "sebastian_supervisor" not in agent_names:
        raise RuntimeError("sebastian_supervisor must be enabled in agents.yaml")

    workflow.set_entry_point("sebastian_supervisor")

    # From Sebastian to team supervisors or end conversation
    workflow.add_conditional_edges(
        "sebastian_supervisor",
        _route_from_sebastian,
        {name: name for name in agent_names} | {"routing": "routing", "end": END},
    )

    # Add conditional edge from routing to specific agent
    workflow.add_conditional_edges(
        "routing",
        _build_route_to_agent_node(agent_names[0]),
        {name: name for name in agent_names},
    )

    # Add edges from agents back to routing/end
    # All agents flow through should_continue to enable up-chain handoffs
    for agent in agent_names:
        workflow.add_conditional_edges(
            agent,
            should_continue,
            {
                "route": "routing",
                "end": END,
            }
        )

    # Compile workflow
    if checkpointer is None:
        # Use in-memory checkpoints to avoid stale Redis sessions causing routing loops
        checkpointer = MemorySaver()

    app = workflow.compile(checkpointer=checkpointer)

    logger.info("Workflow graph created successfully")

    return app
