# Task Interaction Improvement Plan

## Overview
Move Todoist task interaction logic from frontend (browser) to backend API to improve security and architecture consistency.

## Current State

### Issues
1. **Security Risk**: Todoist API token stored in browser localStorage
2. **Architecture Inconsistency**: Frontend bypasses our backend and calls Todoist API directly
3. **Token Management**: Users must manually set `todoist_api_token` in localStorage
4. **Error Handling**: Limited error handling for failed Todoist API calls

### Current Flow
```
Browser → Todoist API (direct)
  - Uses token from localStorage
  - No backend validation
  - 403 errors if token missing/invalid
```

### Affected Files
- `/mnt/user/appdata/open-webui-sebastian/src/routes/(app)/tasks/+page.svelte` (lines 129-156)
- Token stored in browser: `localStorage.getItem('todoist_api_token')`

## Proposed Solution

### New Architecture
```
Browser → LangGraph Backend → Todoist API
  - Token stays secure on backend
  - Consistent with other API patterns
  - Better error handling and logging
  - Can add validation/business logic
```

## Implementation Steps

### Phase 1: Backend Endpoints (LangGraph API)

#### 1.1 Create Task Actions Router
**File**: `/mnt/user/appdata/ai_stack/containers/langgraph-agents/routers/todoist_actions.py`

**Endpoints to implement**:
```python
POST /api/todoist/tasks/{task_id}/complete
POST /api/todoist/tasks/{task_id}/uncomplete
POST /api/todoist/tasks/{task_id}/update
DELETE /api/todoist/tasks/{task_id}
```

**Features**:
- Use `TODOIST_API_TOKEN` from environment (already configured)
- Validate task_id format
- Handle Todoist API errors gracefully
- Return consistent response format
- Log all actions for audit trail
- Trigger sync after successful mutation

#### 1.2 Todoist API Client Service
**File**: `/mnt/user/appdata/ai_stack/containers/langgraph-agents/services/todoist_client.py`

**Purpose**: Centralized Todoist API client
- Reusable HTTP client with proper error handling
- Rate limiting awareness
- Retry logic for transient failures
- Structured error responses

#### 1.3 Update Main App
**File**: `/mnt/user/appdata/ai_stack/containers/langgraph-agents/main.py`

**Changes**:
- Import and register new `todoist_actions` router
- Ensure API key middleware allows these endpoints

### Phase 2: Frontend Updates (Open WebUI)

#### 2.1 Update Task Interaction Handler
**File**: `/mnt/user/appdata/open-webui-sebastian/src/routes/(app)/tasks/+page.svelte`

**Changes**:
```typescript
// OLD (lines 129-156)
const handleToggleComplete = async (taskId: string, currentStatus: TaskStatus) => {
  const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${taskId}/...`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('todoist_api_token')}`,
    }
  });
}

// NEW
const handleToggleComplete = async (taskId: string, currentStatus: TaskStatus) => {
  const newStatus = currentStatus === 'done' ? 'todo' : 'done';
  const endpoint = newStatus === 'done' ? 'complete' : 'uncomplete';

  const response = await fetch(
    `${backendBaseUrl}/api/todoist/tasks/${taskId}/${endpoint}`,
    {
      method: 'POST',
      headers: getHeaders() // Already includes X-API-Key
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update task:', error);
    // Show user-friendly error message
    return;
  }

  // Optimistic update
  taskTree = taskTree.map(task =>
    task.todoist_id === taskId ? { ...task, status: newStatus } : task
  );

  // Refresh after short delay
  setTimeout(() => fetchTodoistMirror(), 1000);
}
```

#### 2.2 Remove localStorage Token Dependency
- Remove all references to `localStorage.getItem('todoist_api_token')`
- Token is now managed entirely on backend
- Document that only `backend_api_key` and `backend_url` are needed in localStorage

#### 2.3 Add Better Error Handling
- Display user-friendly error messages when task actions fail
- Add loading states during API calls
- Show success feedback after actions

### Phase 3: Testing

#### 3.1 Backend Tests
```bash
# Test complete task
curl -X POST http://192.168.0.12:8000/api/todoist/tasks/{task_id}/complete \
  -H "X-API-Key: e74742e8b2f5fd66401636ef79b01124b193ed94f7baa249c4899dc5fea9164c"

# Test uncomplete task
curl -X POST http://192.168.0.12:8000/api/todoist/tasks/{task_id}/uncomplete \
  -H "X-API-Key: e74742e8b2f5fd66401636ef79b01124b193ed94f7baa249c4899dc5fea9164c"
```

#### 3.2 Frontend Tests
- Click checkbox to complete task
- Click checkbox again to uncomplete task
- Verify UI updates optimistically
- Verify sync happens after action
- Test error scenarios (network failure, invalid task ID)

#### 3.3 Integration Tests
- Complete task in UI → Verify in Todoist app
- Complete task in Todoist app → Verify sync brings it to UI
- Test with multiple simultaneous actions

### Phase 4: Deployment

#### 4.1 Backend Deployment
```bash
cd /mnt/user/appdata/ai_stack
docker restart langgraph-agents
# Verify health
curl http://192.168.0.12:8000/health
```

#### 4.2 Frontend Deployment
```bash
cd /mnt/user/appdata/open-webui-sebastian
docker compose build
docker compose up -d
```

#### 4.3 Post-Deployment
- Clear browser localStorage of old `todoist_api_token`
- Verify tasks load correctly
- Test task completion/uncompleteion
- Monitor logs for errors

## Benefits

### Security Improvements
- ✅ Todoist API token never exposed to browser
- ✅ Single source of truth for credentials
- ✅ Reduced attack surface (no token in localStorage)

### Architecture Improvements
- ✅ Consistent API patterns (all Todoist calls go through backend)
- ✅ Centralized error handling and logging
- ✅ Easier to add business logic (validation, permissions, etc.)
- ✅ Better monitoring and debugging

### User Experience Improvements
- ✅ No manual token configuration required
- ✅ Better error messages
- ✅ More reliable sync after actions
- ✅ Loading states and feedback

## Files to Create

1. `/mnt/user/appdata/ai_stack/containers/langgraph-agents/routers/todoist_actions.py` - New router for task actions
2. `/mnt/user/appdata/ai_stack/containers/langgraph-agents/services/todoist_client.py` - Todoist API client

## Files to Modify

1. `/mnt/user/appdata/ai_stack/containers/langgraph-agents/main.py` - Register new router
2. `/mnt/user/appdata/ai_stack/containers/langgraph-agents/routers/__init__.py` - Export new router
3. `/mnt/user/appdata/open-webui-sebastian/src/routes/(app)/tasks/+page.svelte` - Update task interaction logic

## Rollback Plan

If issues arise:
1. Revert frontend changes (restore direct Todoist API calls)
2. Keep backend endpoints (no harm if unused)
3. Re-add `todoist_api_token` to localStorage as temporary fix

## Future Enhancements

### Short-term
- Add task creation from UI
- Add task editing (title, description, due date)
- Add task deletion
- Drag-and-drop reordering

### Long-term
- Real-time updates via WebSockets
- Optimistic UI with rollback on failure
- Offline support with sync queue
- Bulk actions (complete multiple tasks)
- Task templates

## Timeline Estimate

- **Phase 1** (Backend): 2-3 hours
- **Phase 2** (Frontend): 1-2 hours
- **Phase 3** (Testing): 1 hour
- **Phase 4** (Deployment): 30 minutes

**Total**: ~5-7 hours of development work

## Notes

- Current implementation already has CORS fixed (lines 136-146 in main.py)
- Backend already has `TODOIST_API_TOKEN` configured in `.env`
- Frontend already has proper header management with `getHeaders()`
- Sync job already runs every 5 minutes via APScheduler

## Questions to Answer

1. Should we add rate limiting to prevent abuse of Todoist API?
2. Should we cache task state in Redis to reduce Todoist API calls?
3. Do we need webhook support for instant Todoist → Backend updates?
4. Should we add user-level permissions for task actions?

## Status

- [ ] Phase 1: Backend Endpoints
- [ ] Phase 2: Frontend Updates
- [ ] Phase 3: Testing
- [ ] Phase 4: Deployment
- [ ] Documentation updated
- [ ] User notification of changes
