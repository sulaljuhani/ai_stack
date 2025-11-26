# Project Vision: Custom Agent Interface (Open WebUI Fork)

**Goal:** Create a personalized workspace that combines a powerful Chat Assistant with custom productivity tools (Calendar, Tasks, etc.). The app will look and feel exactly like Open WebUI but will be powered by my custom backend logic.

---

## 1. Visual Requirements (The New Pages)
I want to add four new dedicated pages to the application. These should not look out of place; they must match the existing dark/light theme and design of Open WebUI.

### The Sidebar
- [ ] **Navigation:** The main left-hand sidebar must be updated.
- [ ] **Links:** Add icons and links for the following new pages right below the "New Chat" or "Chats" section.

### The Pages
1. **Calendar Page**
    - **View:** A visual monthly or weekly grid view.
    - **Function:** Ability to see items scheduled by the Chat Agent.
2. **Tasks Page**
    - **View:** A list or board (Kanban style) of to-do items.
    - **Function:** Items should be editable and checkable.
3. **Events Page**
    - **View:** A list or timeline of specific upcoming events (distinct from general calendar tasks).
4. **Reminders Page**
    - **View:** A simple focused list of time-sensitive notifications or "ticklers."

---

## 2. Intelligence & Chat Behavior
The "Chat" is the command center. It should feel snappy and smart, connecting to my personal backend.

### Model Selection ("The Brain Switch")
- [ ] **Selection:** When I select a specific model in the Open WebUI dropdown (e.g., "GPT-4o", "Claude 3.5", or "My Custom Agent"), that selection must be sent to my backend.
- [ ] **Routing:** My backend will decide how to handle the request based on which model name I picked.

### The Conversation Experience
- [ ] **Streaming:** Replies must flow in word-by-word (real-time), just like standard ChatGPT. No waiting 10 seconds for a full block of text to appear at once.
- [ ] **Visual "Thinking":** If the backend is processing complex logic, the chat should ideally show that it is "working" or "thinking."

### Agent Transparency (Optional Feature)
- [ ] **"Who did the work?":** If my backend uses a specific sub-agent (e.g., the "Scheduler Bot" or "Research Bot") to generate an answer, the frontend should ideally show a small tag, icon, or reference indicating which agent performed the task.

---

## 3. Data Flow (How it works under the hood)
- **No Direct Database Access:** The frontend (Open WebUI) must *never* touch the database directly.
- **API Only:** The frontend should ask the backend for data (e.g., "Give me the list of tasks") and the backend will retrieve it and send it back.
- **Single Source of Truth:** If I ask the Chatbot to "Add a Task," it updates the database. When I click the "Tasks" page, it should instantly show that new task because they share the same database.

---

## 4. Implementation Plan (For the Developer/AI)

### Phase 1: Connectivity & Bridge
1. Establish a connection between the Open WebUI Docker container and the Python Backend container.
2. Create the **"Proxy Pipe"** in Open WebUI to intercept chat messages and route them to the backend API.
3. Ensure **Streaming (SSE)** works perfectly so text generates in real-time.

### Phase 2: The New UI Components
1. Create the file structure for the 4 new routes (Calendar, Tasks, Events, Reminders) in SvelteKit.
2. Update the **Sidebar Component** to include navigation links.
3. Build the layout/skeleton of these pages using TailwindCSS to match the app's theme.

### Phase 3: Wiring Data
1. Create Backend API endpoints (GET/POST) for:
    - `/api/tasks`
    - `/api/calendar`
    - `/api/events`
    - `/api/reminders`
2. Update the Frontend pages to fetch data from these endpoints on load.

---

## 5. User Notes & Customization
*(Use this space to write down specific ideas for how the Calendar or Tasks should look)*

- [ ] Note:
- [ ] Note: