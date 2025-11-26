# Automatic Knowledge Extraction - Implementation Plan

> **Goal:** Enable agents to automatically extract and store user knowledge from conversations
> **Example:** "remind me to update my unraid server" → automatically stores fact: "user has an unraid server"
> **Created:** 2025-11-23

---

## Problem Statement

Currently, the system requires **manual note-taking** to capture user information:
- User says: "remind me to update my unraid server"
- System creates reminder ✅
- System does NOT capture: "user has an unraid server" ❌

**Desired behavior:**
- Automatically extract implicit facts from user messages
- Store them in `/mnt/user/data/vault/facts/` for future retrieval
- Enable knowledge-based responses without explicit note-taking

---

## Proposed Solutions (3 Approaches)

### Option 1: Middleware Knowledge Extractor ⭐ RECOMMENDED
**Complexity:** Medium | **Impact:** High | **Effort:** 2-3 days

#### How It Works
Add a **post-processing step** after each agent response that:
1. Analyzes the user's message for extractable facts
2. Uses LLM to identify implicit knowledge
3. Stores facts in structured format to vault/facts/

#### Architecture
```
User Message → Router → Agent → Response
                                    ↓
                              Knowledge Extractor (async)
                                    ↓
                              vault/facts/user-profile-sultan.md
```

#### Advantages ✅
- **Non-intrusive:** Works across ALL agents without modification
- **Automatic:** No agent-specific logic needed
- **Structured:** Maintains single user profile file
- **Flexible:** Easy to enable/disable per user

#### Implementation Details

**New File:** `/containers/langgraph-agents/middleware/knowledge_extractor.py`

```python
"""
Knowledge Extraction Middleware

Automatically extracts user facts from conversations and stores them in vault.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path
import re

from langchain_core.messages import HumanMessage, AIMessage
from config import settings
from utils.logging import get_logger
from tools.note_files import _ensure_vault_dir, _build_frontmatter
from tools.documents import reembed_vault_file

logger = get_logger(__name__)

# Extraction prompt for LLM
KNOWLEDGE_EXTRACTION_PROMPT = """Analyze the following user message and extract any implicit facts about the user that should be remembered.

Focus on extracting:
1. **Systems/Tools:** What systems, servers, or tools does the user have? (e.g., "unraid server", "home assistant", "docker")
2. **Preferences:** What are their likes, dislikes, or preferences?
3. **Projects:** What projects are they working on?
4. **Context:** Any relevant context about their setup, environment, or workflow?
5. **Identity:** Name, role, or other identifying information

User message: "{message}"

Return ONLY a JSON array of facts. Each fact should have:
- "category": One of [systems, preferences, projects, context, identity]
- "fact": A short statement (e.g., "User has an unraid server")
- "confidence": One of [high, medium, low]

If NO facts are extractable, return an empty array: []

Example output:
[
  {{"category": "systems", "fact": "User has an unraid server", "confidence": "high"}},
  {{"category": "preferences", "fact": "User prefers Docker for containerization", "confidence": "medium"}}
]

Return ONLY valid JSON, no other text.
"""


async def extract_knowledge_from_message(
    user_message: str,
    user_id: str = "sultan"
) -> List[Dict[str, str]]:
    """
    Extract factual knowledge from a user message using LLM.

    Args:
        user_message: The user's message content
        user_id: User identifier (for future multi-user support)

    Returns:
        List of extracted facts with category and confidence
    """
    try:
        from langchain_ollama import ChatOllama
        import json

        # Skip extraction for very short messages
        if len(user_message.strip()) < 10:
            return []

        # Skip extraction for simple queries
        query_patterns = [
            r"^what('s| is)",
            r"^how (do|can|to)",
            r"^when (is|do)",
            r"^where (is|do)",
            r"^who (is|are)",
            r"^why (is|do)"
        ]
        if any(re.match(pattern, user_message.lower()) for pattern in query_patterns):
            return []

        # Use LLM to extract facts
        llm = ChatOllama(
            model=settings.ollama_model,
            base_url=settings.ollama_url,
            temperature=0.0  # Deterministic extraction
        )

        prompt = KNOWLEDGE_EXTRACTION_PROMPT.format(message=user_message)
        response = await llm.ainvoke(prompt)

        # Parse JSON response
        content = response.content.strip()

        # Extract JSON from markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        facts = json.loads(content)

        # Filter out low-confidence facts
        high_confidence_facts = [
            f for f in facts
            if f.get("confidence") in ["high", "medium"]
        ]

        logger.info(f"Extracted {len(high_confidence_facts)} facts from message")
        return high_confidence_facts

    except Exception as e:
        logger.error(f"Error extracting knowledge: {e}", exc_info=True)
        return []


async def update_user_profile(
    facts: List[Dict[str, str]],
    user_id: str = "sultan"
) -> Optional[str]:
    """
    Update user profile file with newly extracted facts.

    Args:
        facts: List of extracted facts
        user_id: User identifier

    Returns:
        Path to updated profile file, or None if failed
    """
    try:
        vault_root = _ensure_vault_dir()
        facts_dir = vault_root / "facts"
        facts_dir.mkdir(exist_ok=True)

        profile_path = facts_dir / f"user-profile-{user_id}.md"

        # Read existing profile or create new
        if profile_path.exists():
            content = profile_path.read_text(encoding="utf-8")

            # Extract existing sections
            lines = content.split("\n")

            # Update timestamp in frontmatter
            updated_content = []
            for line in lines:
                if line.startswith("updated:"):
                    updated_content.append(f"updated: {datetime.utcnow().isoformat()}")
                else:
                    updated_content.append(line)

            content = "\n".join(updated_content)
        else:
            # Create new profile
            timestamp = datetime.utcnow().isoformat()
            frontmatter = _build_frontmatter(
                title=f"User Profile - {user_id.title()}",
                tags=["user-profile", "preferences", "personal", "auto-extracted"],
                created=timestamp,
                updated=timestamp
            )
            content = frontmatter + f"# User Profile\n\n**Name:** {user_id.title()}\n\n"

        # Append new facts by category
        for fact in facts:
            category = fact.get("category", "general")
            fact_text = fact.get("fact", "")

            # Check if fact already exists (avoid duplicates)
            if fact_text.lower() in content.lower():
                logger.info(f"Fact already exists, skipping: {fact_text}")
                continue

            # Find or create category section
            category_header = f"## {category.title()}"
            if category_header not in content:
                content += f"\n{category_header}\n\n"

            # Append fact as bullet point
            # Find the category section and add the fact
            lines = content.split("\n")
            new_lines = []
            in_category = False
            fact_added = False

            for i, line in enumerate(lines):
                new_lines.append(line)

                # Check if we're entering the target category
                if line.strip() == category_header.strip():
                    in_category = True
                    continue

                # Check if we're leaving the category (next header or end)
                if in_category and (line.startswith("##") or i == len(lines) - 1):
                    if not fact_added:
                        # Add fact before next section
                        if not new_lines[-1].strip():  # Remove empty line before insertion
                            new_lines.pop()
                        new_lines.append(f"- {fact_text}")
                        new_lines.append("")  # Add empty line after
                        fact_added = True
                    in_category = False

            content = "\n".join(new_lines)

        # Write updated profile
        profile_path.write_text(content, encoding="utf-8")
        logger.info(f"Updated user profile: {profile_path}")

        # Re-embed the profile file
        await reembed_vault_file.ainvoke({
            "file_path": str(profile_path),
            "force": True
        })

        return str(profile_path)

    except Exception as e:
        logger.error(f"Error updating user profile: {e}", exc_info=True)
        return None


async def process_knowledge_extraction(
    user_message: str,
    user_id: str = "sultan",
    enabled: bool = True
) -> Dict[str, Any]:
    """
    Main entry point for knowledge extraction pipeline.

    Args:
        user_message: User's message content
        user_id: User identifier
        enabled: Whether extraction is enabled (for easy toggle)

    Returns:
        Result dict with extraction stats
    """
    if not enabled:
        return {"enabled": False, "facts_extracted": 0}

    try:
        # Extract facts from message
        facts = await extract_knowledge_from_message(user_message, user_id)

        if not facts:
            return {
                "enabled": True,
                "facts_extracted": 0,
                "message": "No facts extracted"
            }

        # Update user profile
        profile_path = await update_user_profile(facts, user_id)

        return {
            "enabled": True,
            "facts_extracted": len(facts),
            "facts": facts,
            "profile_path": profile_path,
            "message": f"Extracted and stored {len(facts)} facts"
        }

    except Exception as e:
        logger.error(f"Knowledge extraction failed: {e}", exc_info=True)
        return {
            "enabled": True,
            "facts_extracted": 0,
            "error": str(e)
        }
```

**Integration Point:** Modify `main.py` chat endpoint

```python
# In main.py /chat endpoint, after workflow execution:

@app.post("/chat")
@limiter.limit("20/minute")
async def chat(request: ChatRequest, bg_tasks: BackgroundTasks):
    # ... existing workflow execution ...

    result = await workflow_app.ainvoke(state, config=workflow_config)

    # Extract knowledge in background (non-blocking)
    if request.messages:
        last_user_msg = request.messages[-1]
        if last_user_msg.role == "user":
            bg_tasks.add_task(
                process_knowledge_extraction,
                user_message=last_user_msg.content,
                user_id=request.user_id or "sultan",
                enabled=settings.auto_knowledge_extraction_enabled
            )

    # ... return response ...
```

**Configuration:** Add to `config.py`

```python
class Settings(BaseSettings):
    # ... existing settings ...

    # Auto knowledge extraction
    auto_knowledge_extraction_enabled: bool = Field(
        default=True,
        description="Enable automatic knowledge extraction from conversations"
    )
```

#### Database Schema (Optional - for tracking)

```sql
CREATE TABLE knowledge_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    message_content TEXT NOT NULL,
    facts_extracted JSONB NOT NULL,
    profile_path TEXT,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT
);

CREATE INDEX idx_knowledge_user_id ON knowledge_extractions(user_id);
CREATE INDEX idx_knowledge_extracted_at ON knowledge_extractions(extracted_at);
```

---

### Option 2: Agent-Level Knowledge Tools
**Complexity:** Low | **Impact:** Medium | **Effort:** 1 day

#### How It Works
Add a `store_user_fact` tool to each agent's toolkit that agents can **explicitly call** when they detect relevant facts.

#### Example
```python
@tool
async def store_user_fact(
    fact: str,
    category: str = "general"
) -> Dict[str, Any]:
    """
    Store a fact about the user in their profile.

    Args:
        fact: The fact to store (e.g., "User has an unraid server")
        category: Category (systems, preferences, projects, context)
    """
    # Implementation similar to update_user_profile above
```

#### Update Agent Prompts
```
# reminder_agent.txt
...
- When user mentions systems/tools they own, call store_user_fact to remember
- Example: "remind me to update unraid" → store_user_fact("User has unraid server", "systems")
```

#### Advantages ✅
- Simple to implement
- Explicit control over what gets stored
- Agents decide based on context

#### Disadvantages ❌
- Requires updating ALL agent prompts
- Relies on agent "remembering" to call the tool
- Less automatic than Option 1
- May miss facts if agent doesn't recognize them

---

### Option 3: Post-Processing Knowledge Agent
**Complexity:** High | **Impact:** High | **Effort:** 3-4 days

#### How It Works
Create a dedicated **Knowledge Extraction Agent** that analyzes completed conversations in background.

#### Architecture
```
User → Main Agent Flow (task/reminder/etc)
         ↓
    Conversation Complete
         ↓
    Background Job (APScheduler)
         ↓
    Knowledge Agent analyzes conversation
         ↓
    Extracts facts → vault/facts/
```

#### Advantages ✅
- Most sophisticated approach
- Can analyze full conversation context
- Can extract relationships between facts
- Could summarize weekly/monthly insights

#### Disadvantages ❌
- Most complex to implement
- Delayed knowledge storage (background job)
- Higher LLM costs (additional analysis pass)
- Potential for stale context

---

## Recommendation: Option 1 (Middleware)

**Reasoning:**
1. ✅ **Automatic:** Works without agent modification
2. ✅ **Real-time:** Immediate fact extraction
3. ✅ **Non-blocking:** Uses FastAPI background tasks
4. ✅ **Maintainable:** Centralized logic
5. ✅ **Toggleable:** Easy to enable/disable via config

**Example Flow:**
```
User: "remind me to update my unraid server tomorrow"
  ↓
Reminder Agent: Creates reminder ✅
  ↓
Knowledge Extractor (background):
  - Analyzes: "remind me to update my unraid server tomorrow"
  - Extracts: "User has an unraid server" (category: systems, confidence: high)
  - Updates: /vault/facts/user-profile-sultan.md
  - Re-embeds: File ready for search ✅
  ↓
Future query: "What servers do I have?"
  ↓
Knowledge Agent:
  - Searches vault
  - Finds: user-profile-sultan.md
  - Returns: "You have an unraid server" ✅
```

---

## Implementation Checklist

### Phase 1: Core Extraction (Day 1)
- [ ] Create `middleware/knowledge_extractor.py`
- [ ] Implement `extract_knowledge_from_message()` with LLM
- [ ] Implement `update_user_profile()` for fact storage
- [ ] Add unit tests for extraction logic

### Phase 2: Integration (Day 2)
- [ ] Integrate with `/chat` endpoint using BackgroundTasks
- [ ] Add `auto_knowledge_extraction_enabled` config setting
- [ ] Test with real conversations
- [ ] Verify vault file updates and re-embedding

### Phase 3: Refinement (Day 3)
- [ ] Add duplicate detection (avoid re-storing same facts)
- [ ] Implement category-based organization
- [ ] Add confidence filtering (only store high/medium confidence)
- [ ] Create admin endpoint to view extraction stats

### Phase 4: Monitoring (Optional)
- [ ] Add `knowledge_extractions` database table for tracking
- [ ] Create metrics (facts_extracted_total, extraction_errors_total)
- [ ] Add logging for debugging
- [ ] Create dashboard endpoint for user profile view

---

## Testing Strategy

### Test Cases

1. **Basic Extraction**
   - Input: "remind me to update my unraid server"
   - Expected: Extracts "User has an unraid server" (systems)

2. **Preference Extraction**
   - Input: "I prefer using Docker for all my containers"
   - Expected: Extracts "User prefers Docker for containerization" (preferences)

3. **No Extraction (Query)**
   - Input: "What's the weather?"
   - Expected: No facts extracted (it's a query, not a statement)

4. **Duplicate Prevention**
   - Input 1: "I have an unraid server"
   - Input 2: "Can you check my unraid server?"
   - Expected: Fact stored once, not duplicated

5. **Multi-Fact Extraction**
   - Input: "I'm working on a home automation project using Home Assistant and Node-RED"
   - Expected: Extracts multiple facts (project, systems)

### Integration Tests

```python
# tests/test_knowledge_extraction.py

import pytest
from middleware.knowledge_extractor import (
    extract_knowledge_from_message,
    update_user_profile
)

@pytest.mark.asyncio
async def test_extract_system_fact():
    facts = await extract_knowledge_from_message(
        "remind me to update my unraid server"
    )
    assert len(facts) > 0
    assert facts[0]["category"] == "systems"
    assert "unraid" in facts[0]["fact"].lower()

@pytest.mark.asyncio
async def test_skip_query():
    facts = await extract_knowledge_from_message("what's the weather?")
    assert len(facts) == 0

@pytest.mark.asyncio
async def test_update_profile():
    facts = [
        {"category": "systems", "fact": "User has test server", "confidence": "high"}
    ]
    path = await update_user_profile(facts, user_id="test")
    assert path is not None
    assert "test" in path
```

---

## Privacy & Security Considerations

### Data Retention
- User profiles stored in `/vault/facts/` (persistent)
- Consider adding TTL or archival for old facts
- Allow users to delete/edit their profile

### Consent
- Add user setting to enable/disable auto-extraction
- Provide transparency about what's being stored
- Allow manual review before storage (optional mode)

### Sensitive Data
- Filter out sensitive information (passwords, API keys, etc.)
- Add blocklist for sensitive patterns
- Consider category-based retention policies

```python
# Sensitive data filter
SENSITIVE_PATTERNS = [
    r"password[:\s]+\S+",
    r"api[_\s]?key[:\s]+\S+",
    r"secret[:\s]+\S+",
    r"token[:\s]+\S+",
]

def contains_sensitive_data(text: str) -> bool:
    """Check if text contains sensitive information."""
    return any(re.search(pattern, text.lower()) for pattern in SENSITIVE_PATTERNS)
```

---

## Future Enhancements

### 1. Multi-User Support
- Store per-user profiles: `user-profile-{user_id}.md`
- User authentication and isolation
- Shared vs. private knowledge

### 2. Relationship Extraction
- Extract relationships between entities
- "My unraid server hosts my Home Assistant instance"
- Store in graph format (Neo4j or similar)

### 3. Temporal Knowledge
- Track changes over time
- "User used to prefer X, now prefers Y"
- Enable trend analysis

### 4. Proactive Suggestions
- "I noticed you have an unraid server. Would you like me to set up monitoring?"
- Use extracted knowledge to suggest features

### 5. Knowledge Verification
- Ask user to confirm extracted facts
- "I learned that you have an unraid server. Is this correct?"
- Update confidence based on feedback

### 6. Knowledge Graph Visualization
- Web UI to visualize user's knowledge graph
- Show connections between facts
- Enable manual editing

---

## Performance Considerations

### Latency
- Background task execution: ~0-5ms overhead (non-blocking)
- LLM extraction: ~1-3 seconds (runs in background)
- User sees NO latency impact ✅

### LLM Costs
- Extraction per message: ~200-500 tokens
- Estimated cost (Ollama local): FREE ✅
- Could optimize: batch extraction, cache results

### Storage
- Average profile size: ~2-5 KB
- 1000 users × 5KB = 5 MB (negligible)
- Qdrant embeddings: ~3 KB per chunk (manageable)

### Optimization Ideas
- Skip extraction for very short messages (<10 chars)
- Skip extraction for queries (what/how/when questions)
- Cache extraction results (Redis, 24h TTL)
- Batch process multiple messages

---

## Comparison Matrix

| Aspect | Option 1: Middleware | Option 2: Agent Tools | Option 3: Background Agent |
|--------|---------------------|----------------------|---------------------------|
| **Complexity** | Medium | Low | High |
| **Effort** | 2-3 days | 1 day | 3-4 days |
| **Automatic** | ✅ Yes | ❌ Relies on agent | ✅ Yes |
| **Real-time** | ✅ Yes | ✅ Yes | ❌ Delayed |
| **Maintainable** | ✅ Centralized | ❌ Distributed | ✅ Centralized |
| **Accuracy** | Medium-High | Medium | High |
| **User Impact** | None (background) | None | None |
| **LLM Cost** | Medium | Low | High |

**Winner:** Option 1 (Middleware) ⭐

---

## Success Metrics

### Quantitative
- **Extraction Rate:** % of messages with extractable facts
- **Accuracy:** % of extracted facts that are correct (manual review)
- **Coverage:** % of user queries answered using extracted knowledge
- **Performance:** Background task execution time

### Qualitative
- User feedback: "The system remembers my context!"
- Reduced need for manual note-taking
- Improved answer relevance over time

### Example Targets
- Extraction rate: 20-30% of messages
- Accuracy: >90% (based on user feedback)
- Coverage: 50%+ of knowledge queries use extracted facts
- Performance: <3s for extraction (background)

---

## Conclusion

**Recommendation: Implement Option 1 (Middleware Knowledge Extractor)**

This approach provides:
- ✅ Automatic, non-intrusive knowledge extraction
- ✅ Real-time updates with no user-facing latency
- ✅ Centralized, maintainable architecture
- ✅ Easy to toggle on/off via configuration
- ✅ Natural extension of existing vault system

**Estimated Timeline:** 2-3 days for full implementation and testing

**Next Steps:**
1. Create `middleware/knowledge_extractor.py` with extraction logic
2. Integrate with FastAPI `/chat` endpoint using BackgroundTasks
3. Test with real conversations and refine prompts
4. Monitor extraction quality and iterate

The system will learn about users organically through conversation, making it truly "smart" and context-aware! 🚀
