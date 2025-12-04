# Subagent Prompt Update Plan

## Context

The multi-agent system has been refactored so that specialist agents (validators, retrievers, creators, editors, deleters, analysts) communicate internally via `agent_contexts` rather than user-visible messages. Their responses are stored in state and read by supervisors, not displayed to users.

**Only Sebastian (main supervisor) communicates with users.**

## Problem

Current subagent prompts instruct them to respond as if talking to users, leading to:
- Verbose, overly-polite responses
- Unnecessary explanations and formatting
- Token waste on internal communication
- Confusion about their role

## Goal

Update all specialist agent prompts to reflect that they are:
1. **Internal agents** communicating with other agents (not users)
2. Part of a **hierarchical team** reporting to supervisors
3. Expected to provide **short, direct, concise, and clear** results
4. Optimizing for **token efficiency** in internal communication

## Architecture Reminder

```
User ↔ Sebastian (butler - polished, user-facing)
  └─ Sebastian ↔ Team Supervisors (internal coordination)
      └─ Supervisors ↔ Specialist Agents (internal execution)
                    ↑
                    These agents need updated prompts
```

## Agents Requiring Updates

### Validators (5)
- `prompts/task_validator.txt`
- `prompts/event_validator.txt`
- `prompts/reminder_validator.txt`
- `prompts/knowledge_validator.txt`
- `prompts/logging_validator.txt`

### Retrievers (4)
- `prompts/task_retriever.txt`
- `prompts/event_retriever.txt`
- `prompts/reminder_retriever.txt`
- `prompts/knowledge_retriever.txt`

### Creators (4)
- `prompts/task_creator.txt`
- `prompts/event_creator.txt`
- `prompts/reminder_creator.txt`
- `prompts/note_creator.txt`

### Editors (3)
- `prompts/task_editor.txt`
- `prompts/event_editor.txt`
- `prompts/reminder_editor.txt`

### Deleters (3)
- `prompts/task_deleter.txt`
- `prompts/event_deleter.txt`
- `prompts/reminder_deleter.txt`

### Analysts (4)
- `prompts/task_analyst.txt`
- `prompts/event_analyst.txt`
- `prompts/reminder_analyst.txt`
- `prompts/life_analyst.txt`

### Other Specialists (4)
- `prompts/reminder_completer.txt`
- `prompts/db_operation.txt`
- `prompts/schema_inspector.txt`
- `prompts/table_discovery.txt`

**Total: 27 agent prompts**

## Prompt Update Guidelines

### What to ADD

Add a new section to each prompt explaining internal communication:

```markdown
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

**Example GOOD Response**:
"Found 3 tasks matching criteria. IDs: 42, 87, 103. All have priority HIGH."

**Example BAD Response**:
"I've carefully searched through the task database and I'm pleased to report that I was able to locate three tasks that match your specified criteria. These tasks are..."
```

### What to REMOVE/MODIFY

1. **Remove user-facing language**:
   - ❌ "I'm pleased to report..."
   - ❌ "Let me help you with..."
   - ❌ "I apologize for..."
   - ❌ "I hope this helps!"

2. **Simplify output format sections**:
   - Remove elaborate formatting instructions
   - Remove examples that show verbose responses
   - Keep technical requirements (data structure, required fields)

3. **Update "Persona" sections**:
   - Change from "helpful assistant" to "internal specialist"
   - Emphasize efficiency over politeness
   - Focus on accuracy and brevity

### Template for Different Agent Types

#### Validators

```markdown
# Persona
You are an internal validation specialist. Your supervisor needs quick pass/fail assessments.

# Communication Style
Respond in 2-3 sentences max:
- PASS: "Validation passed. Task #123 created with correct fields."
- FAIL: "Validation failed. Missing required field: due_date."
- WARNING: "Warning: Task created but dependency #456 not found."

# Goal
Verify operations completed correctly. Report only issues or confirmation.
```

#### Retrievers

```markdown
# Persona
You are an internal data retrieval specialist. Your supervisor needs facts, not explanations.

# Communication Style
Report results in 1-2 sentences:
- FOUND: "Found 5 tasks. IDs: [12, 34, 56, 78, 90]."
- NOT FOUND: "No tasks match criteria."
- PARTIAL: "Found 2 of 5 requested IDs. Missing: [44, 55]."

# Goal
Fetch requested data. Return results or indicate not found.
```

#### Creators

```markdown
# Persona
You are an internal creation specialist. Your supervisor needs confirmation or error details.

# Communication Style
Report outcome in 1-2 sentences:
- SUCCESS: "Created task #789 with title 'Buy groceries'."
- FAILURE: "Failed to create. Error: duplicate title."

# Goal
Create the requested entity. Return ID or error.
```

#### Editors

```markdown
# Persona
You are an internal update specialist. Your supervisor needs change confirmation.

# Communication Style
Report changes in 1-2 sentences:
- SUCCESS: "Updated task #42. Changed: priority HIGH→URGENT."
- FAILURE: "Update failed. Task #42 not found."

# Goal
Apply requested changes. Confirm what changed or report error.
```

#### Deleters

```markdown
# Persona
You are an internal deletion specialist. Your supervisor needs deletion confirmation.

# Communication Style
Report outcome in 1 sentence:
- SUCCESS: "Deleted task #123."
- FAILURE: "Delete failed. Task #123 not found."

# Goal
Delete requested entity. Confirm deletion or report error.
```

#### Analysts

```markdown
# Persona
You are an internal analysis specialist. Your supervisor needs insights, not raw data.

# Communication Style
Provide concise insights in 2-3 sentences:
- "User has 12 overdue tasks. Average age: 8 days. Priority distribution: 5 HIGH, 7 MEDIUM."

# Goal
Analyze data and provide actionable insights. Be specific with numbers.
```

## Step-by-Step Update Process

### Phase 1: Validators (5 files)
1. Read current `task_validator.txt`
2. Add "Communication Style" section after "Persona"
3. Update "Output Format" section - remove verbose examples, keep structure
4. Update "Persona" to emphasize internal communication
5. Repeat for event, reminder, knowledge, logging validators

### Phase 2: Retrievers (4 files)
1. Read current `task_retriever.txt`
2. Add "Communication Style" section
3. Simplify "Output Format" to focus on data return, not explanation
4. Update "Persona"
5. Repeat for event, reminder, knowledge retrievers

### Phase 3: Creators (4 files)
1. Read current `task_creator.txt`
2. Add "Communication Style" section
3. Simplify to focus on success/failure confirmation
4. Update "Persona"
5. Repeat for event, reminder, note creators

### Phase 4: Editors (3 files)
1. Read current `task_editor.txt`
2. Add "Communication Style" section
3. Focus on "what changed" rather than process
4. Update "Persona"
5. Repeat for event, reminder editors

### Phase 5: Deleters (3 files)
1. Read current `task_deleter.txt`
2. Add "Communication Style" section
3. Simplify to deletion confirmation only
4. Update "Persona"
5. Repeat for event, reminder deleters

### Phase 6: Analysts (4 files)
1. Read current `task_analyst.txt`
2. Add "Communication Style" section
3. Focus on insights, not data dumps
4. Update "Persona"
5. Repeat for event, reminder, life analysts

### Phase 7: Other Specialists (4 files)
1. Update `reminder_completer.txt`
2. Update `db_operation.txt`
3. Update `schema_inspector.txt`
4. Update `table_discovery.txt`

## Validation Checklist

After updating each prompt, verify:
- ✅ "Communication Style" section added
- ✅ No user-facing language (I, you, please, sorry, etc.)
- ✅ Response examples are 1-3 sentences max
- ✅ "Persona" emphasizes internal specialist role
- ✅ "Output Format" is concise (data structure only, no fluff)
- ✅ Examples show SHORT responses, not verbose ones
- ✅ Focus on WHAT (results) not HOW (process)

## Before/After Examples

### BEFORE (task_validator.txt - current):
```
# Output Format
Provide a validation report in this format:
**Validation Result:** PASS / FAIL / WARNING
**Checked:** [what you verified]
**Issues Found:** [list any problems, or "None"]
**Recommendations:** [suggestions if any issues found]
```

### AFTER (task_validator.txt - updated):
```
# Communication Style
**Internal agent**: Report to supervisor only. 2-3 sentences max.

Examples:
- PASS: "Validation passed. Task #123 created correctly."
- FAIL: "Validation failed. Missing field: due_date."
- WARNING: "Created but dependency #456 not found."

# Output Format
State result and key facts only. No formatting headers or explanations.
```

## Token Savings Estimate

Current average specialist response: ~150 tokens
Target average specialist response: ~30 tokens
**Savings per specialist response: ~80% reduction**

With typical workflow (5-7 specialist calls per user request):
- Current: 750-1050 tokens in specialist responses
- Target: 150-210 tokens in specialist responses
- **Savings: 600-840 tokens per request**

## Testing After Updates

1. Rebuild container: `docker-compose up -d --build langgraph-agents`
2. Monitor logs for specialist agent activations
3. Check that responses are concise in agent_contexts
4. Verify supervisors can still coordinate effectively
5. Ensure Sebastian provides polished user responses

## Success Criteria

- ✅ All 27 specialist prompts updated
- ✅ No specialist prompt references "user" or "you"
- ✅ All examples show 1-3 sentence responses
- ✅ Container builds successfully
- ✅ Workflows execute without errors
- ✅ Token usage decreases by ~70-80% in specialist communication

## Notes

- **Sebastian's prompt (`sebastian_personality.txt`) should NOT be changed** - he talks to users
- **Team supervisor prompts may need minor updates** to reflect reading from agent_contexts
- Keep technical requirements (tools, validation rules) intact
- Only simplify communication style and output format

## Execution

This plan can be executed by:
1. Manual updates by developer
2. LLM following this plan step-by-step
3. Automated script using prompt templates

Estimated time: 30-45 minutes for manual updates, 10 minutes with automation.
