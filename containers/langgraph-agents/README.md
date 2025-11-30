# LangGraph Multi-Agent System

A sophisticated multi-agent system built with LangGraph, featuring specialized agents for food management, task tracking, calendar events, and note capture. Implements intelligent routing, seamless handoffs, and Redis-based state persistence.

## 🎯 Features

### Core Capabilities
- **Multi-Agent Architecture**: Six specialized agents (Food, Task, Event, Reminder, Note, Knowledge) with domain expertise
- **Config-Driven Registry**: `config/agents.yaml` declares prompts, keywords, and toolkits; `agent_registry` + `tool_registry` assemble agents at runtime
- **Hybrid Routing**: Fast keyword-based routing with LLM fallback for complex queries
- **Intelligent Handoffs**: Automatic domain detection and context-preserving agent transitions
- **State Management**: Redis-based persistence with automatic pruning
- **Flexible LLM Support**: Easy switching between Ollama and OpenAI-compatible providers
- **Hybrid Search**: Combined database queries and vector search for intelligent recommendations
- **Standardized Tool Responses**: Shared response envelope keeps tool outputs predictable for agents/UI

### Agent Specializations

#### 🍽️ Food Agent
- Food logging with full context
- Meal suggestions based on history and preferences
- Dietary pattern analysis
- Hybrid recommendations (DB + vector search)
- Shopping list generation

#### ✅ Task Agent
- Task creation and management
- Priority and deadline tracking
- Project breakdown assistance
- Productivity planning
- Task status updates

#### 📅 Event Agent
- Calendar event management
- Schedule conflict detection
- Available time slot suggestions
- Time blocking support
- Meeting coordination

#### ⏰ Reminder Agent
- Reminder creation and updates
- Snoozes, bulk status changes, and undo for bulk actions
- Daily/soon reminder surfacing

#### 🧠 Knowledge Agent
- OpenMemory and vault search
- Document embedding/re-embedding with safeguards
- Memory health checks and duplicate detection

#### 📝 Note Agent
- Captures, writes, and appends markdown notes into the vault
- Uses `/mnt/user/data/vault` (configurable via `VAULT_PATH`) with safe path enforcement
- Triggers immediate embeddings into Qdrant/OpenMemory after writes

## 🏗️ Architecture

```
                   User Request
                        ↓
              ┌─────────────────┐
              │  Hybrid Router  │
              │ (Keywords + LLM)│
              └────────┬─────────┘
                       ↓
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   ┌────────┐    ┌────────┐    ┌────────┐
   │  Food  │    │  Task  │    │ Event  │
   │ Agent  │    │ Agent  │    │ Agent  │
   └───┬────┘    └───┬────┘    └───┬────┘
       │             │              │
       └──────┬──────┴──────┬───────┘
              │   Tools     │
         ┌────┴────┬────────┴────┐
         ↓         ↓              ↓
    PostgreSQL  Qdrant         n8n
```

### Key Components

**State Management**
- Redis-based checkpointing for conversation persistence
- Automatic state pruning (configurable message limit)
- Domain-specific contexts shared across agents
- 24-hour TTL (configurable)

**Routing Strategy**
- **Simple queries**: Direct keyword matching (fast)
- **Complex queries**: LLM-based routing (accurate)
- **Handoffs**: Automatic domain shift detection
- **Tunable**: Keywords + weights live in `config/agents.yaml` for quick routing bias tweaks

**Registry & Extensibility**
- Agent registry (`config/agents.yaml`) controls prompts, routing keywords, and toolkits
- Tool registry + ToolRunner wrap LangChain tools with shared metrics/events
- Feature switches per agent/tool via `enabled`, `exclude_tools`, and prompt partials
- Standard response envelopes for tools (`tools/models.py`) keep outputs consistent

**Tool Layer**
- **Database Tools**: Direct SQL queries for structured data
- **Vector Tools**: Qdrant semantic search
- **Hybrid Tools**: Combined DB + vector for recommendations
- **n8n Integration**: Workflow triggers and embeddings

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- PostgreSQL database
- Redis (included in docker-compose)
- Qdrant vector database
- Ollama (for local LLM) or OpenAI API key

### Installation

1. **Clone and navigate to directory**
```bash
cd containers/langgraph-agents
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Build and run**
```bash
docker-compose up --build
```

The service will be available at `http://localhost:8000`

### Configuration

#### LLM Provider: Ollama (Local)
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b
```

#### LLM Provider: OpenAI-Compatible
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
```

#### State Management
```env
STATE_PRUNING_ENABLED=true
STATE_MAX_MESSAGES=20
STATE_TTL_SECONDS=86400
```

#### Agent Registry (config/agents.yaml)
- `enabled`: turn agents on/off without code changes
- `tools`: tool/tag selectors; use `exclude_tools` to hide specific tools
- `partials`: shared prompt snippets (persona/safety/style)
- `keywords`: terms with optional `weight` to tune routing bias

## 📡 API Usage

### Chat Endpoint

```bash
POST /chat
```

**Request:**
```json
{
  "message": "Suggest something to eat",
  "user_id": "user123",
  "workspace": "default",
  "session_id": "session-abc-123"
}
```

**Response:**
```json
{
  "response": "Based on your history, I'd suggest...",
  "agent": "food_agent",
  "session_id": "session-abc-123",
  "turn_count": 1,
  "timestamp": "2025-11-19T10:30:00Z"
}
```

### Session Management

**Get Session Info:**
```bash
GET /session/{session_id}
```

**Delete Session:**
```bash
DELETE /session/{session_id}
```

### Health Check

```bash
GET /health
```

## 🔄 Agent Handoff Examples

### Food → Task
```
User: "Suggest something to eat"
Food Agent: "How about Thai curry? You rated it 5/5 last time."
User: "Great! Create a task to buy ingredients"
Food Agent: "I'll hand this to the Task Agent..."
Task Agent: "I'll create a grocery task for Thai curry ingredients."
```

### Task → Event
```
User: "Show me my tasks"
Task Agent: "You have 3 high-priority tasks..."
User: "Schedule time to work on them"
Task Agent: "Connecting you with the Event Agent..."
Event Agent: "Let me check your calendar for available time..."
```

## 🛠️ Development

### Project Structure

```
langgraph-agents/
├── main.py                 # FastAPI application
├── config.py               # Configuration management
├── requirements.txt        # Dependencies
├── Dockerfile             # Container definition
├── docker-compose.yml     # Service orchestration
│
├── graph/
│   ├── state.py           # State schema & pruning
│   ├── workflow.py        # LangGraph workflow
│   ├── routing.py         # Hybrid routing logic
│   └── checkpointer.py    # Redis persistence
│
├── agents/
│   ├── base.py            # Base agent utilities
│   ├── food_agent.py      # Food specialist
│   ├── task_agent.py      # Task specialist
│   └── event_agent.py     # Event specialist
│
├── tools/
│   ├── database.py        # Direct DB queries
│   ├── vector.py          # Qdrant search
│   ├── hybrid.py          # Combined tools
│   └── n8n.py            # Workflow integration
│
├── prompts/
│   ├── food_agent.txt     # Food agent system prompt
│   ├── task_agent.txt     # Task agent system prompt
│   └── event_agent.txt    # Event agent system prompt
│
└── utils/
    ├── llm.py             # LLM factory
    ├── db.py              # Database connection
    ├── redis_client.py    # Redis client
    └── logging.py         # Logging setup
```

### Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export LLM_PROVIDER=ollama
export OLLAMA_BASE_URL=http://localhost:11434
# ... other vars

# Run application
python main.py
```

### Testing

```bash
# Install dev dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

## 🔧 Customization

### Adding a New Agent

1. **Create system prompt**
```bash
touch prompts/memory_agent.txt
```

2. **Implement agent**
```python
# agents/memory_agent.py
from .base import load_system_prompt, create_agent_prompt

MEMORY_AGENT_PROMPT = load_system_prompt("memory_agent")
MEMORY_TOOLS = [...]

async def memory_agent_node(state: MultiAgentState) -> Dict[str, Any]:
    # Implementation
    pass
```

3. **Add to workflow**
```python
# graph/workflow.py
workflow.add_node("memory_agent", memory_agent_node)
```

4. **Update routing**
```python
# graph/routing.py
MEMORY_KEYWORDS = ["remember", "note", "search"]
```

### Switching LLM Models

Simply update the `.env` file:

```env
# Switch to different Ollama model
OLLAMA_MODEL=llama3.1:8b

# Or switch to OpenAI
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4-turbo
```

No code changes required!

## 📊 Performance

### Design Decisions

**State Pruning** ✅ Implemented
- Keeps last N messages (default: 20)
- Prevents state bloat
- Maintains conversation context

**Domain Boundary Detection** ✅ Implemented
- Clear system prompts with domain definitions
- LLM-based handoff detection
- Explicit handoff keywords

**Hybrid Routing** ✅ Implemented
- Fast keyword matching for simple queries
- LLM routing for complex cases
- Reduces unnecessary LLM calls

**Redis Persistence** ✅ Implemented
- Persistent state across restarts
- Scalable to multiple instances
- Automatic TTL cleanup

### Future Optimizations

**Vector Search Speed** 🔄 Deferred
- Planned: Query caching
- Planned: Parallel DB + vector execution
- Planned: Result pre-computation

**LLM Call Reduction** 🔄 Deferred
- Planned: Routing decision caching
- Planned: Batch tool calls
- Planned: Smaller model for routing

## 🔒 Security

- Environment-based configuration
- No secrets in code
- Input validation with Pydantic
- User isolation via user_id
- Session-based state isolation

## 📚 Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Multi-Agent Tutorial](https://langchain-ai.github.io/langgraph/tutorials/multi_agent/)
- [Implementation Plan](../../LANGGRAPH_MULTI_AGENT_PLAN.md)

## 🐛 Troubleshooting

### Common Issues

**Connection to Ollama fails**
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Update OLLAMA_BASE_URL if needed
```

**Redis connection error**
```bash
# Check Redis is running
docker ps | grep redis

# Verify connection
redis-cli ping
```

**Database connection issues**
```bash
# Check PostgreSQL
docker ps | grep postgres

# Test connection
psql -h localhost -U postgres -d ai_assistant
```

**Agent not routing correctly**
- Check logs: `docker logs langgraph-agents`
- Review routing keywords in `graph/routing.py`
- Verify system prompts are loaded

## 📝 License

This project is part of the AI Assistant Local Stack.

## 🤝 Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test with both Ollama and OpenAI providers

---

**Built with ❤️ using LangGraph, FastAPI, and Redis**
