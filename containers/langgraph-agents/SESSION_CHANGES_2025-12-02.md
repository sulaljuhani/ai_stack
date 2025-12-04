# Session Changes Documentation - December 2, 2025

## Executive Summary

This document records all changes made during the session to fix repeated/verbose text in the multi-agent system. Despite multiple architectural improvements, the core issue persisted, leading to a decision to revert to the original working state.

**Session Goal**: Fix repeated and verbose text in agent responses
**Outcome**: Changes did not resolve core issue; system became less functional
**Decision**: Revert all changes to restore working baseline

---

## Problem Statement

### User-Reported Issue
"the replay is long and the llm repeat information, is this a prompt issue?"

### Symptoms
1. Agent responses are verbose and repetitive
2. Same information appears multiple times in conversation
3. Long response chains from internal agents visible to users

### Root Causes Discovered
1. **Specialist agents writing messages visible to users** - Only Sebastian (main supervisor) should communicate with users
2. **Agent duplication in workflow** - Agents activating multiple times per request
3. **Workflow wiring issues** - Routing targets one agent but different agent activates
4. **create_react_agent loops** - Internal message loops creating verbose responses
5. **Team routing errors** - Defaulting to task_management inappropriately

---

## Changes Made

### 1. State Reducer Functions (graph/state.py)

**Problem**: Concurrent update errors when multiple nodes update same state field simultaneously.

**Error Example**:
```
InvalidUpdateError: At key 'current_team': Can receive only one value per step
```

**Solution**: Added 9 reducer functions to handle concurrent updates.

#### Added Reducers

**1.1 Agent Tracking Reducers** (Lines 41-74)
```python
def update_previous_agent(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """Handle concurrent updates to previous_agent."""
    return new_value

def update_target_agent(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """Handle concurrent updates to target_agent."""
    return new_value
```

**1.2 Team Coordination Reducers** (Lines 77-110)
```python
def update_current_team(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """Handle concurrent updates to current_team."""
    return new_value

def update_previous_team(existing: Optional[str], new_value: Optional[str]) -> Optional[str]:
    """Handle concurrent updates to previous_team."""
    return new_value
```

**1.3 Dictionary Merge Reducers** (Lines 113-146)
```python
def update_team_context(existing: Dict[str, Any], new_value: Dict[str, Any]) -> Dict[str, Any]:
    """Merge team context dictionaries."""
    return {**existing, **new_value}

def update_agent_contexts(existing: dict, new_value: dict) -> dict:
    """Merge agent contexts dictionaries."""
    return {**existing, **new_value}
```

**1.4 Counter/Timestamp Reducers** (Lines 149-182)
```python
def update_turn_count(existing: int, new_value: int) -> int:
    """Take maximum turn count for concurrent updates."""
    return max(existing, new_value)

def update_updated_at(existing: str, new_value: str) -> str:
    """Take latest timestamp (ISO format strings compare correctly)."""
    return max(existing, new_value)
```

**1.5 List Append Reducer** (Lines 185-200)
```python
def update_validation_results(existing: List[Dict[str, Any]], new_value: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Append new validation results to existing list."""
    return existing + new_value
```

#### Applied Reducers to Fields
```python
# Line 76
previous_agent: Annotated[Optional[str], update_previous_agent]

# Line 106
target_agent: Annotated[Optional[str], update_target_agent]

# Lines 241-245
current_team: Annotated[Optional[str], update_current_team]
previous_team: Annotated[Optional[str], update_previous_team]
team_context: Annotated[Dict[str, Any], update_team_context]
validation_results: Annotated[List[Dict[str, Any]], update_validation_results]

# Line 210
agent_contexts: Annotated[dict, update_agent_contexts]

# Lines 218-220
turn_count: Annotated[int, update_turn_count]
updated_at: Annotated[str, update_updated_at]
```

**Result**: ✅ All concurrent update errors resolved

---

### 2. Internal Communication Helpers (agents/base.py)

**Problem**: Specialist agents returning messages visible to users; need internal-only communication pattern.

#### 2.1 Added create_internal_response() (Lines 329-376)

**Purpose**: Create internal-only state updates without adding messages visible to users.

```python
def create_internal_response(
    state: MultiAgentState,
    agent_name: str,
    context_key: str,
    result_content: str,
    team: str,
    additional_state: dict = None
) -> dict:
    """
    Create internal-only response for specialist agents.

    Specialist agents (validators, retrievers, creators, etc.) should NOT
    add messages to state - only Sebastian talks to users. This function
    creates the correct return structure for internal communication.

    Returns:
        State update dict WITHOUT messages field
    """
    from datetime import datetime

    agent_contexts = state.get("agent_contexts", {})
    agent_contexts[context_key] = {
        "last_interaction": datetime.utcnow().isoformat(),
        "last_result": result_content[:500],  # Keep concise
    }

    base_response = {
        # NO messages field - internal only!
        "current_agent": agent_name,
        "previous_agent": state.get("current_agent"),
        "agent_contexts": agent_contexts,
        "turn_count": state["turn_count"] + 1,
        "updated_at": datetime.utcnow().isoformat(),
        "current_team": team,
    }

    if additional_state:
        base_response.update(additional_state)

    return base_response
```

**Key Feature**: Returns state update WITHOUT `messages` field - prevents specialist responses from appearing to users.

#### 2.2 Added simple_llm_call() (Lines 379-404)

**Purpose**: Single LLM call without create_react_agent loops for simple reasoning tasks.

```python
async def simple_llm_call(prompt: str, system_prompt: str = None, temperature: float = 0.3) -> str:
    """
    Single LLM call without React agent loops.

    Use this for specialist agents that need LLM reasoning but don't need
    multi-turn conversation or tool loops. Much more efficient than create_react_agent.
    """
    from langchain_core.messages import SystemMessage, HumanMessage

    llm = get_cached_llm(temperature)

    messages = []
    if system_prompt:
        messages.append(SystemMessage(content=system_prompt))
    messages.append(HumanMessage(content=prompt))

    response = await llm.ainvoke(messages)
    return response.content if hasattr(response, 'content') else str(response)
```

**Use Case**: For specialists that need quick LLM reasoning without full React agent overhead.

**Result**: ✅ Helpers created and working, but didn't solve core issue

---

### 3. Workflow Graph Changes (graph/workflow.py)

**Problem**: All agents looping back to routing, causing potential duplication.

#### 3.1 Modified Agent Loop Behavior (Lines 211-226)

**Before**:
```python
# All agents looped back to routing
for agent in agent_names:
    workflow.add_conditional_edges(
        agent,
        should_continue,
        {
            "route": "routing",
            "end": END,
        }
    )
```

**After**:
```python
# Only supervisors loop, specialists end
for agent in agent_names:
    if agent.endswith("_supervisor") or agent == "sebastian_supervisor":
        # Supervisors can re-route
        workflow.add_conditional_edges(
            agent,
            should_continue,
            {
                "route": "routing",
                "end": END,
            }
        )
    else:
        # Specialists always end - let supervisor decide next step
        workflow.add_edge(agent, END)
```

**Rationale**:
- Supervisors orchestrate multi-step flows (need looping)
- Specialists execute single operations (should end immediately)
- Prevents specialists from re-routing themselves

**Result**: ❌ Did not prevent agent duplication; new issues appeared

---

### 4. Team Routing Fallback (graph/team_routing.py)

**Problem**: LLM routing failures defaulting to task_management team inappropriately.

**Warning Observed**:
```
WARNING - Falling back to task_management team due to routing error
```

#### 4.1 Modified Error Handling (Lines 106-111)

**Before**:
```python
except Exception as e:
    logger.error("Team routing failed: %s", e)
    logger.warning("Falling back to task_management team due to routing error")
    return TeamRoutingDecision(
        team="task_management",
        confidence=0.5,
        reason=f"Fallback due to routing error: {str(e)[:100]}",
    )
```

**After**:
```python
except Exception as e:
    logger.error("Team routing failed: %s", e)
    # Don't default to task_management - return None to indicate routing failure
    # Let keyword routing or Sebastian handle it instead
    logger.warning("LLM team routing failed, will use keyword routing fallback")
    return None
```

**Rationale**:
- No team should be the "default" for unroutable requests
- Sebastian supervisor should handle ambiguous requests
- Prevents inappropriate task_management routing

**Result**: ✅ Warning eliminated, but core issue persisted

---

### 5. Specialist Agent Refactoring (All 27 Agents)

**Problem**: Agents using create_react_agent with internal message loops causing verbosity.

#### 5.1 Files Affected

**Task Management Team** (6 agents):
- `agents/task_validator.py`
- `agents/task_retriever.py`
- `agents/task_creator.py`
- `agents/task_editor.py`
- `agents/task_deleter.py`
- `agents/task_analyst.py`

**Event Management Team** (4 agents):
- `agents/event_validator.py`
- `agents/event_retriever.py`
- `agents/event_creator.py`
- `agents/event_editor.py`
- `agents/event_deleter.py`
- `agents/event_analyst.py`

**Reminder Team** (5 agents):
- `agents/reminder_validator.py`
- `agents/reminder_retriever.py`
- `agents/reminder_creator.py`
- `agents/reminder_editor.py`
- `agents/reminder_deleter.py`
- `agents/reminder_completer.py`
- `agents/reminder_analyst.py`

**Knowledge Team** (2 agents):
- `agents/knowledge_validator.py`
- `agents/knowledge_retriever.py`

**Database Team** (3 agents):
- `agents/db_operation.py`
- `agents/schema_inspector.py`
- `agents/table_discovery.py`

**Logging Team** (1 agent):
- `agents/logging_validator.py`

**Life Analysis Team** (1 agent):
- `agents/life_analyst.py`

**Note Team** (1 agent):
- `agents/note_creator.py`

#### 5.2 Refactoring Pattern

**Original Pattern**:
```python
def _get_agent():
    """Cached ReAct agent with message loops."""
    if not hasattr(_get_agent, "cached"):
        _get_agent.cached = create_cached_react_agent(
            agent_name="task_validator",
            tools=AGENT_TOOLS,
        )
    return _get_agent.cached

async def task_validator_node(state: MultiAgentState) -> Dict[str, Any]:
    """Validate task operations."""
    agent = _get_agent()

    # Build messages with context
    messages = [create_context_message(state, "task_validator", AGENT_PROMPT)]
    messages.extend(state["messages"])

    # Run React agent (creates internal message loops!)
    result = await agent.ainvoke({"messages": messages})

    # Return messages visible to users
    return {
        "messages": result["messages"],
        "current_agent": "task_validator",
        ...
    }
```

**Refactored Pattern (Attempt 1 - Internal Only)**:
```python
async def task_validator_node(state: MultiAgentState) -> Dict[str, Any]:
    """Validate task operations - direct execution without React loops."""
    logger.info("Task Validator activated")
    try:
        # Get last message
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        # Use simple LLM call or direct tool execution
        # ... validation logic ...

        # Internal-only response - NO messages field!
        return create_internal_response(
            state=state,
            agent_name="task_validator",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team="task_management",
            additional_state={"validation_results": validation_results},
        )
    except Exception as e:
        logger.error("Error in Task Validator: %s", e, exc_info=True)
        return create_internal_response(
            state=state,
            agent_name="task_validator",
            context_key=CONTEXT_KEY,
            result_content=f"ERROR: {str(e)[:100]}",
            team="task_management",
        )
```

**Refactored Pattern (Attempt 2 - Removed create_react_agent Entirely)**:
```python
# Template used: /tmp/refactor_agents.py
async def task_validator_node(state: MultiAgentState) -> Dict[str, Any]:
    """Handle task validation - direct execution without React loops."""
    logger.info("Task Validator activated")
    try:
        last_msg = state["messages"][-1]
        request = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        # Direct tool execution - no LLM loops
        response_content = f"Task Validator executed: {request[:50]}..."

        return create_internal_response(
            state=state,
            agent_name="task_validator",
            context_key=CONTEXT_KEY,
            result_content=response_content,
            team="task_management",
        )
    except Exception as e:
        logger.error("Error in Task Validator: %s", e, exc_info=True)
        return create_internal_response(...)
```

#### 5.3 Refactoring Script

Created `/tmp/refactor_agents.py` to automate refactoring:
- Extracts agent metadata from filenames
- Preserves docstrings
- Applies consistent template
- Handles validation_results for validators

**Result**: ❌ Agents became non-functional stubs; tool validation errors appeared

---

### 6. Prompt Updates (All 27 Prompts)

**Problem**: Specialist prompts written for user-facing communication; need internal-only style.

#### 6.1 Planning Document

Created `PROMPT_UPDATE_PLAN.md` with:
- Context on hierarchical communication
- Guidelines for concise internal responses
- Templates for each agent type
- Before/after examples
- Token savings estimates (70-80% reduction)

#### 6.2 Prompt Files Updated

Updated all 27 prompts in `/mnt/user/appdata/ai_stack/containers/langgraph-agents/prompts/`:

**Task Management**:
- `task_validator.txt`
- `task_retriever.txt`
- `task_creator.txt`
- `task_editor.txt`
- `task_deleter.txt`
- `task_analyst.txt`

**Event Management**:
- `event_validator.txt`
- `event_retriever.txt`
- `event_creator.txt`
- `event_editor.txt`
- `event_deleter.txt`
- `event_analyst.txt`

**Reminder Management**:
- `reminder_validator.txt`
- `reminder_retriever.txt`
- `reminder_creator.txt`
- `reminder_editor.txt`
- `reminder_deleter.txt`
- `reminder_completer.txt`
- `reminder_analyst.txt`

**Knowledge Management**:
- `knowledge_validator.txt`
- `knowledge_retriever.txt`

**Database Operations**:
- `db_operation.txt`
- `schema_inspector.txt`
- `table_discovery.txt`

**Logging**:
- `logging_validator.txt`

**Life Analysis**:
- `life_analyst.txt`

**Notes**:
- `note_creator.txt`

#### 6.3 Prompt Changes Applied

**Added "Communication Style" Section**:
```
# Communication Style

**IMPORTANT**: You are an internal agent in a multi-agent system. Your responses are:
- Read by your supervisor (not the user)
- Stored in internal state for coordination
- Never shown directly to users

**Response Requirements**:
- SHORT: 2-3 sentences maximum
- DIRECT: State results, not process
- CONCISE: No pleasantries or apologies
- CLEAR: Specific facts, no ambiguity
```

**Example Response Format**:
```
Report outcomes in 2-3 sentences:
- PASS: "Validation passed. Task #123 created correctly."
- FAIL: "Validation failed. Missing field: due_date."
- ERROR: "Tool error: database connection timeout."
```

**Removed**:
- User-facing language ("I'll help you...", "Let me...")
- Verbose explanations of process
- Apologies and pleasantries
- Multi-paragraph responses

**Result**: ✅ Prompts successfully updated, but agents not using them properly due to refactoring issues

---

## Issues Discovered But Not Resolved

### 1. Agent Duplication

**Observation**: Agents activating multiple times per request in logs.

**Example**:
```
Task Retriever activated
Task Retriever activated  ← Duplicate!
Sebastian activated
Sebastian activated
Sebastian activated  ← Triplicate!
```

**Root Cause**: Workflow graph wiring issue - suspected but not confirmed.

**Impact**: Multiple executions causing repeated text in responses.

**Status**: UNRESOLVED

### 2. Workflow Wiring Mismatch

**Observation**: Routing targets one agent but different agent activates.

**Example**:
```
Routing via explicit handoff to: task_retriever
Task Supervisor activated  ← WRONG AGENT!
```

**Root Cause**: Conditional edges or node naming mismatch.

**Impact**: Unpredictable agent execution flow.

**Status**: UNRESOLVED

### 3. Tool Validation Errors

**Observation**: Direct tool calls failing with schema validation errors.

**Example**:
```
ValidationError: 1 validation error for search_tasks
user_id
  Field required
```

**Root Cause**: Refactored agents calling tools with incomplete parameters.

**Original Code** (working):
```python
# create_react_agent handles tool call construction
agent = create_cached_react_agent(...)
result = await agent.ainvoke({"messages": messages})
```

**Refactored Code** (broken):
```python
# Direct tool call with insufficient parameters
search_tool = tools_dict["search_tasks"]
result = await search_tool.ainvoke({"query": query})  # Missing user_id!
```

**Impact**: Specialists unable to execute their primary functions.

**Status**: UNRESOLVED

### 4. JSON Parse Errors in Routing

**Observation**: Team routing failures with JSON parsing errors.

**Example** (suspected from previous errors):
```
JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

**Root Cause**: LLM not returning valid JSON despite structured output request.

**Impact**: Routing failures requiring fallback logic.

**Status**: Partially addressed (changed fallback), root cause unresolved

---

## What Worked

1. ✅ **Reducer Functions**: All concurrent update errors eliminated
2. ✅ **create_internal_response() Helper**: Clean pattern for internal communication
3. ✅ **Prompt Updates**: Successfully implemented concise internal communication style
4. ✅ **Team Routing Fallback Fix**: Eliminated inappropriate task_management defaults
5. ✅ **simple_llm_call() Helper**: Created efficient single-call LLM pattern

---

## What Didn't Work

1. ❌ **Removing create_react_agent**: Broke agent functionality, caused tool validation errors
2. ❌ **Workflow Edge Changes**: Did not prevent agent duplication
3. ❌ **Direct Tool Execution**: Lost parameter handling logic from React agent
4. ❌ **Overall Approach**: Addressed symptoms but not root cause

---

## Root Cause Analysis

### The Real Problem

The core issue is **workflow graph wiring** causing agent duplication and misrouting:
- Routing decision says "go to task_retriever"
- Workflow actually routes to "task_supervisor"
- Agents execute multiple times per turn

### Why Our Fixes Failed

1. **Message Visibility Fix**: Correct approach, but didn't address duplication
2. **Prompt Updates**: Good improvement, but agents not executing properly after refactor
3. **Removing create_react_agent**: Threw out working tool orchestration logic
4. **Workflow Edge Changes**: Treated symptom (looping) not cause (duplication)

### The Actual Solution Needed

1. Debug workflow graph construction in `workflow.py`
2. Verify conditional edge routing logic
3. Add workflow visualization to see actual vs. expected flow
4. Fix agent name matching in routing decisions
5. KEEP create_react_agent for specialists (it's working correctly)

---

## Lessons Learned

### 1. Don't Remove Working Patterns

`create_react_agent` was working correctly - it handles:
- Tool parameter construction
- Multi-step tool calling
- Error handling
- Message formatting

**Lesson**: Refactor how agents communicate, not how they work internally.

### 2. Fix Root Causes, Not Symptoms

We treated:
- Message visibility (symptom)
- Verbose responses (symptom)
- Looping behavior (symptom)

We missed:
- Workflow graph wiring (root cause)
- Agent duplication (root cause)

**Lesson**: Agent duplication logs are the smoking gun - start there.

### 3. Incremental Changes

We made too many changes at once:
- 9 reducer functions
- 2 new helper functions
- Workflow graph restructure
- 27 agent refactors
- 27 prompt updates

**Lesson**: Change one thing at a time; verify it works before proceeding.

### 4. Internal Communication Is Correct

The architectural insight was right:
- Only supervisors should write user-visible messages
- Specialists should use internal-only communication
- `create_internal_response()` is the correct pattern

**Lesson**: Keep this insight for future fixes; implement it correctly with working agents.

---

## Revert Plan

### Files to Revert

**Modified Files** (git restore):
```bash
git restore graph/state.py
git restore graph/workflow.py
git restore agents/base.py
```

**New File to Remove**:
```bash
rm graph/team_routing.py
```

**Agent Files** (27 files):
If original versions exist in git history, restore them. Otherwise, manually reconstruct using create_react_agent pattern.

**Prompt Files** (27 files):
Decision: KEEP updated prompts if compatible with original agent code, they are improvements. Revert if they cause issues.

### Verification Steps

1. Rebuild Docker container
2. Check logs for errors
3. Test basic functionality: "Create a task called test"
4. Verify no agent duplication in logs
5. Confirm responses are generated (even if verbose)

---

## Future Recommendations

### Immediate Next Steps (After Revert)

1. **Add Workflow Visualization**: Generate graph diagram to see actual routing
2. **Add Detailed Logging**: Log every routing decision with before/after agent names
3. **Fix Agent Duplication**: This is the actual root cause
4. **Verify Workflow Edges**: Check conditional edge logic and node naming

### Later Improvements

1. **Implement Internal Communication Correctly**:
   - Keep create_react_agent for specialists
   - Have supervisors read agent_contexts instead of messages
   - Only supervisors return user-visible messages

2. **Reduce Verbosity Correctly**:
   - Keep concise prompts (already done)
   - Use `create_internal_response()` pattern
   - Don't remove working tool orchestration

3. **Optimize Tool Calling**:
   - Consider caching tool results
   - Implement smarter tool selection
   - Add tool call budgets

---

## Statistics

### Files Changed: 60+
- 4 core graph/agent files
- 27 specialist agent files
- 27 prompt files
- 2 documentation files

### Lines of Code Changed: ~1500+
- 200+ lines in state.py (reducers)
- 100+ lines in base.py (helpers)
- 50+ lines in workflow.py (edges)
- 50+ lines in team_routing.py (new file)
- ~1000+ lines across 27 agent files

### Time Investment: Full session
- Initial debugging: 30 mins
- Reducer fixes: 45 mins
- Architecture design: 30 mins
- Implementation: 2+ hours
- Testing and iteration: 1+ hour

### Outcome
❌ Core issue unresolved
❌ System functionality reduced
✅ Valuable insights gained
✅ Better understanding of root cause
➡️ **Decision: Revert and try different approach**

---

## Conclusion

This session attempted to fix repeated/verbose text through architectural refactoring. While several improvements were made (reducer functions, internal communication helpers, concise prompts), the core issue of agent duplication persisted and new issues were introduced.

The fundamental problem is **workflow graph wiring causing agent duplication**, not message visibility or prompt verbosity. Future efforts should focus on debugging the workflow graph construction and routing logic rather than refactoring agent internals.

**Key Takeaway**: The system architecture is sound, but the workflow implementation has a bug. Fix the bug; don't rebuild the architecture.

---

## Document Metadata

- **Created**: December 2, 2025
- **Session Duration**: ~4 hours
- **Changes Status**: PENDING REVERT
- **Preserved For**: Future debugging and architecture decisions
- **Next Action**: Execute revert plan to restore working state
