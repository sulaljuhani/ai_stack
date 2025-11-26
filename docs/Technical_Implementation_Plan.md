Technical Implementation Plan: Custom Agent Interface
This document outlines the phased technical execution plan for transforming a forked Open WebUI instance into a custom agentic workspace backed by a dedicated LangGraph/FastAPI backend.

Context:

Frontend: Open WebUI (SvelteKit) running in Docker.
Backend: Custom Python Stack (FastAPI + LangGraph) running in Docker.
Infrastructure: Unraid Server.
Networking: Inter-container communication via host.docker.internal or Docker network aliases.
Phase 1: Environment & Connectivity Foundation
Objective: Establish a stable bidirectional communication channel between the SvelteKit frontend and the FastAPI backend.

1.1 Backend Dependencies
Action: Update /mnt/user/appdata/ai_stack/requirements.txt.
Packages Required:
fastapi
uvicorn
sse-starlette (Critical for Server-Sent Events streaming).
pydantic
langgraph
langchain
1.2 Docker Networking
Action: Ensure both containers are on the same bridge network or can resolve each other via IP.
Verification:
Create a GET /api/health endpoint on the Backend.
SSH into the Frontend container and curl http://<BACKEND_IP>:8000/api/health to confirm reachability.
1.3 CORS Configuration
Action: Configure CORSMiddleware in FastAPI.
Settings:
allow_origins=["*"] (or specifically the Frontend container URL).
allow_methods=["*"]
allow_headers=["*"]
Phase 2: The Proxy Pipeline (Chat Bridge)
Objective: Intercept "Model" requests in the UI and route them to the custom backend using Open WebUI's Manifold Pipe system.

2.1 Backend Streaming Endpoint
File: main.py (Backend)
Endpoint: POST /api/chat/completions
Protocol: Server-Sent Events (SSE).
Behavior:
Accepts JSON payload: { model: str, messages: List[dict], stream: bool }.
Validates the model ID.
Yields SSE events formatted as: data: <content_chunk>\n\n.
Sends data: [DONE]\n\n upon completion.
2.2 Frontend "Manifold Pipe" Script
File: /mnt/user/appdata/open_webui/data/functions/proxy_pipe.py
Class Structure:
class Pipe:
    class Valves(BaseModel):
        # Dynamic settings configurable in UI
        BACKEND_URL: str
        API_KEY: str
        MODEL_LIST: str # Comma-separated list (e.g., "gpt-4o, agent-scheduler")

    def pipes(self):
        # Returns list of dicts based on self.valves.MODEL_LIST
        # This populates the UI Dropdown

    def pipe(self, body):
        # 1. Extract model & messages
        # 2. Forward request to self.valves.BACKEND_URL
        # 3. Stream response back to Open WebUI
Configuration: Enable the function in Workspace > Functions and set the BACKEND_URL.
Phase 3: Frontend Customization (New Pages)
Objective: Add native-feeling SvelteKit pages for productivity tools (Calendar, Tasks, etc.).

3.1 Route Creation
Action: Create the following directory structure in src/routes/:
src/routes/calendar/+page.svelte (UI) & +page.ts (Logic)
src/routes/tasks/+page.svelte & +page.ts
src/routes/events/+page.svelte & +page.ts
src/routes/reminders/+page.svelte & +page.ts
3.2 Navigation Updates
File: src/routes/+layout.svelte (or src/lib/components/layout/Sidebar.svelte depending on version).
Action:
Locate the sidebar navigation block.
Insert <a href="/calendar"> (and others) below the Chat list.
Use Tailwind CSS classes to match the existing hover/active states (e.g., hover:bg-gray-100 dark:hover:bg-gray-800).
Icons: Use lucide-svelte or existing icon libraries to match the visual style.
3.3 UI Styling
Constraint: Must use Tailwind CSS.
Theme: Ensure strict Dark Mode support using the dark: prefix class variants to match Open WebUI's aesthetic.
Phase 4: Data Integration (CRUD)
Objective: Wire the new frontend pages to real data stored by the backend.

4.1 Backend Data Endpoints
Action: Create RESTful endpoints in FastAPI:
GET /api/calendar / POST /api/calendar
GET /api/tasks / POST /api/tasks
GET /api/events / POST /api/events
GET /api/reminders / POST /api/reminders
Data Store: Use SQLite or Postgres (managed by the backend, NOT the frontend).
4.2 Frontend Data Loading
File: src/routes/[page_name]/+page.ts
Logic:
Use SvelteKit's load() function.
Fetch data from BACKEND_URL.
Return data to the +page.svelte component.
State: Use Svelte stores or local state to handle optimistic UI updates (e.g., checking off a task updates the UI immediately while the API call finishes).
Phase 5: LangGraph Integration (The Brain)
Objective: Connect the Chat UI to the specific LangGraph workflow logic.

5.1 Graph Router
File: graph.py (Backend)
Logic:
Create a mapping dictionary: {'agent-scheduler': scheduler_graph, 'agent-research': research_graph}.
In the /api/chat/completions endpoint, use the model ID from the request to select the correct graph.
5.2 Event Streaming Logic
Action: Use graph.astream_events() (async).
Transformation:
Capture on_chat_model_stream events (Token generation).
Capture on_tool_start and on_tool_end events.
Formatting: Convert Tool events into a user-readable string (e.g., > *Scanning database...*) before yielding to the SSE stream so the user sees the "Thinking" process.
5.3 Agent Citation (Optional)
Implementation:
If a specific sub-node in LangGraph generates the final answer, append a metadata footer to the text stream.
Example output: "...search complete. \n\n_— Generated by ResearchAgent_"