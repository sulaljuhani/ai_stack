Implementation Plan: Todoist-Mirror Task Manager (Locked UI)
Project Goal: Build a high-performance Task Manager where the local database is the Single Source of Truth (SSOT), mirroring Todoist's full data structure but using a simplified "Locked Subtask" frontend to minimize UI complexity.
Architecture:
* Backend: FastAPI + SQLModel (SQLite/Postgres).
* Frontend: SvelteKit (Flat State, Nested Rendering).
* Sync: Bi-directional (Webhooks Inbound, Background Tasks Outbound).

---
## IMPLEMENTATION REVIEW STATUS

**✅ Phase 1: FULLY IMPLEMENTED**
- All mirror tables created: todoist_projects, todoist_sections, todoist_labels, todoist_sync_state
- Tasks table extended with Todoist fields (todoist_id, todoist_project_id, todoist_section_id, todoist_parent_id, todoist_order, etc.)
- Proper foreign keys, indexes, and JSONB raw_data storage
- Migration: 012_todoist_mirror_schema.sql

**✅ Phase 2: FULLY IMPLEMENTED**
- TodoistSyncService class with sync token support (services/todoist_sync.py)
- Full sync on startup, incremental sync with sync_token
- Webhook handler with orphan buffering for race conditions (routers/todoist_webhooks.py)
- Background sync scheduled every 15 minutes via APScheduler (services/scheduler.py:213-227)
- Outbound sync uses FastAPI BackgroundTasks pattern

**✅ Phase 3: FULLY IMPLEMENTED (Simplified)**
- Flat state with nested rendering (TaskItem.svelte recursion)
- Read-only "locked" subtask UI with visual indentation (ml-6, border-l-2)
- No drag-and-drop library (simplified to pure mirror view)
- Zero Svelte code issues (verified with autofixer)
- Implementation: /routes/(app)/tasks/+page.svelte and TaskItem.svelte

**✅ Phase 4: FULLY IMPLEMENTED** (Updated 2025-11-26)
- ✅ Read tools: get_todoist_project_tree(), get_todoist_labels(), get_todoist_task_tree()
- ✅ Basic task creation: create_task() with natural language due date parsing
- ✅ POST /api/tasks/quick_add endpoint (Todoist NLP integration) - routers/tasks.py:511
- ✅ POST /api/tasks/subtask endpoint for parent-child relationships - routers/tasks.py:576
- ✅ add_task_with_nlp(text) tool using Todoist's NLP parser - tools/todoist_mirror.py:197
- ✅ add_subtask(parent_id, content) tool for explicit subtasks - tools/todoist_mirror.py:258
- ✅ All tools registered in tool_registry with "tasks_core", "todoist", "nlp" tags
- **Bonus:** Task completion toggle added to UI with Todoist API integration

---

Phase 1: The "Mirror" Database Schema
Objective: Create a schema that supports 100% of Todoist's features to allow full syncing, even if the UI doesn't expose every feature yet.
1.1 Models Definition
* File: backend/apps/tasks/models.py
* Action: Define SQLModel classes matching Todoist API objects.
A. Project
class Project(SQLModel, table=True):
   id: str = Field(primary_key=True) # Todoist ID
   name: str
   color: str # Hex or Todoist color ID
   parent_id: str | None = Field(default=None) # For nested projects
   child_order: int = Field(default=0)
   is_favorite: bool = Field(default=False)
   is_inbox_project: bool = Field(default=False)
   view_style: str = Field(default="list") # "list" or "board"

B. Section (Critical for Kanban Views)
class Section(SQLModel, table=True):
   id: str = Field(primary_key=True)
   project_id: str = Field(foreign_key="project.id")
   name: str
   section_order: int

C. Label
class Label(SQLModel, table=True):
   id: str = Field(primary_key=True)
   name: str
   color: str
   item_order: int

D. Task (The Core)
class Task(SQLModel, table=True):
   id: str = Field(primary_key=True) # Todoist ID
   content: str
   description: str | None
   
   # Status
   is_completed: bool = Field(default=False)
   priority: int = Field(default=1) # 1=Normal, 4=Urgent (Todoist Standard)
   
   # Hierarchy & Organization
   project_id: str = Field(foreign_key="project.id")
   section_id: str | None = Field(default=None, foreign_key="section.id")
   parent_id: str | None = Field(default=None, foreign_key="task.id")
   child_order: int = Field(default=0) # Order within the parent or project
   
   # Dates (Complex Object Flattened)
   due_date: datetime | None # The actual date object
   due_string: str | None # "every monday", "tomorrow"
   due_is_recurring: bool = Field(default=False)
   
   # Meta
   labels: List[str] = Field(sa_column=Column(JSON)) # Store IDs as JSON array ["123", "456"]
   created_at: datetime
   sync_id: str | None # For deduping

Phase 2: The "Robust" Sync Engine
Objective: Keep Local DB and Todoist in sync without UI blocking.
2.1 The Sync Service
* File: backend/services/todoist_sync.py
* Class: TodoistSyncService
* Logic:
   * Full Sync: On startup, fetch all resources using sync_token. Upsert in strict order: Projects -> Sections -> Labels -> Tasks.
   * Incremental: Store last_sync_token in DB. Only fetch deltas on subsequent checks.
2.2 Webhook Handler (Inbound)
* Endpoint: POST /api/webhooks/todoist
* Payload: Handles item:added, item:updated, item:completed, project:added, etc.
* Orphan Handling (Critical):
   * Problem: Todoist sends a child task webhook before the parent task webhook.
   * Solution: If task.parent_id refers to a missing ID, queue the webhook in a Redis/Memory buffer and retry in 5 seconds.
2.3 Outbound Background Worker
* Constraint: Never block the HTTP response waiting for Todoist.
* Implementation:
@router.post("/tasks")
def create_task(task: TaskCreate, background_tasks: BackgroundTasks):
   # 1. Save to Local DB (Latency: 2ms)
   local_task = db.add(task)
   # 2. Queue Sync (Latency: N/A)
   background_tasks.add_task(sync_service.push_create, local_task)
   return local_task

Phase 3: The Simplified "Locked" UI
Objective: A clean, native-feeling UI that handles hierarchy visually but restricts drag-and-drop complexity.
3.1 Stores & State
   * Store: tasks (A flat array of all tasks).
   * Derived Views:
   * groupedTasks: Object grouping tasks by project_id -> section_id.
   * rootTasks: Tasks where parent_id is None.
3.2 Component: TaskItem.svelte (The Locked Rendering)
This component renders itself AND its children, but forbids dragging children out.
<script>
 export let task;
 export let allTasks; // Full flat list passed from parent
 
 // Reactive: Get children for this specific task
 $: children = allTasks
     .filter(t => t.parent_id === task.id)
     .sort((a, b) => a.child_order - b.child_order);
</script>

<div class="task-wrapper mb-2">
 <!-- 1. Parent Task Row (Draggable within its own list) -->
 <div class="task-card bg-gray-800 p-3 rounded flex items-center gap-3">
     <Checkbox checked={task.is_completed} />
     <div class="content flex-1">
         <p>{task.content}</p>
         {#if task.due_string}
             <span class="text-xs text-red-400">{task.due_string}</span>
         {/if}
     </div>
     <Badge priority={task.priority} />
 </div>

 <!-- 2. Children Container (LOCKED) -->
 <!-- Visual Indentation only. No Drag-and-Drop connected to main list -->
 {#if children.length > 0}
     <div class="subtasks ml-8 mt-1 border-l-2 border-gray-700 pl-2">
         {#each children as child (child.id)}
             <!-- Recursion -->
             <svelte:self task={child} {allTasks} />
         {/each}
     </div>
 {/if}
</div>

3.3 Drag-and-Drop Rules
   * Main List: Uses svelte-dnd-action. Can reorder Root tasks only.
   * Subtask List: (Optional) You can add a separate dnd_action zone inside the subtasks div if you want to reorder siblings, but they cannot be dragged "up" to the parent level.
Phase 4: Agent Integration (NLP)
Objective: The Agent creates tasks using natural language, leveraging Todoist's parsing engine.
4.1 NLP Proxy Endpoint
   * Endpoint: POST /api/tasks/quick_add
   * Logic:
   1. Receive text: "Buy milk tomorrow #Groceries"
   2. Call Todoist API quick/add endpoint.
   3. Todoist parses "tomorrow" to a date and "#Groceries" to a project ID.
   4. Todoist creates the task and returns the JSON.
   5. Local Backend saves that JSON to SQLModel.
   6. Frontend updates instantly via Store.
4.2 Agent Tools
   * add_task(text): "Use this for fast entry. Sends text to Todoist NLP."
   * add_subtask(parent_id, content): "Explicitly adds a child task to a known parent."
   * get_project_tree(project_name): Returns a text representation of the project's hierarchy for the Agent to understand context.