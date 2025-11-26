# Multi-User Considerations for Knowledge Extraction

> **Current Status:** System is single-user by default but multi-user ready
> **File:** Response to question about hardcoded user paths
> **Created:** 2025-11-23

---

## Quick Answer

**No, `/vault/facts/user-profile-sultan.md` is NOT hardcoded!**

The path is dynamically generated as: `/vault/facts/user-profile-{user_id}.md`

- `user_id="sultan"` → `user-profile-sultan.md`
- `user_id="ahmed"` → `user-profile-ahmed.md`
- `user_id="uuid-123"` → `user-profile-uuid-123.md`

---

## Current Architecture

### 1. User ID Flow

```
API Request → ChatRequest.user_id → MultiAgentState.user_id → Available to all agents/tools
```

**Code References:**

```python
# main.py:167
class ChatRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    # ↓ Flows to state

# state.py:34
class MultiAgentState(TypedDict):
    user_id: str  # Available throughout conversation
```

### 2. How User ID is Set

**Option A: Frontend/WebUI**
```javascript
// WebUI sends user_id in every request
POST /chat
{
  "message": "remind me to update unraid",
  "user_id": "sultan",  // Set by login or config
  "session_id": "session-123"
}
```

**Option B: Direct API Calls**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "what is my favorite food?",
    "user_id": "sultan",
    "session_id": "test"
  }'
```

**Option C: Default from Environment**
```bash
# .env
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000001
```

### 3. Current Single-User Setup

You're currently in **single-user mode**:
- All requests use `user_id="sultan"` (or whatever your frontend sends)
- One profile file: `user-profile-sultan.md`
- No authentication required

---

## Proposed Knowledge Extraction (Multi-User Ready)

### Implementation Design

```python
# middleware/knowledge_extractor.py

async def update_user_profile(
    facts: List[Dict[str, str]],
    user_id: str  # ← Comes from ChatRequest
) -> Optional[str]:
    """
    Update user profile - works for ANY user_id.

    Examples:
    - user_id="sultan" → /vault/facts/user-profile-sultan.md
    - user_id="ahmed" → /vault/facts/user-profile-ahmed.md
    - user_id="UUID" → /vault/facts/user-profile-{UUID}.md
    """
    vault_root = _ensure_vault_dir()
    facts_dir = vault_root / "facts"

    # Dynamic path based on user_id
    profile_path = facts_dir / f"user-profile-{user_id}.md"

    # ... rest of implementation
```

### Integration with Chat Endpoint

```python
# main.py - /chat endpoint

@app.post("/chat")
async def chat(request: ChatRequest, bg_tasks: BackgroundTasks):
    # ... workflow execution ...

    # Extract knowledge in background
    bg_tasks.add_task(
        process_knowledge_extraction,
        user_message=request.messages[-1].content,
        user_id=request.user_id,  # ← Uses user_id from request
        enabled=settings.auto_knowledge_extraction_enabled
    )
```

### File Structure (Multi-User)

```
/mnt/user/data/vault/facts/
├── user-profile-sultan.md       # User: sultan
├── user-profile-ahmed.md        # User: ahmed
├── user-profile-sarah.md        # User: sarah
└── user-profile-{uuid}.md       # User: {uuid}
```

---

## Scaling to Multi-User

### Phase 1: Current (Single-User Mode) ✅

**Status:** Already works!

```python
# Every request uses same user_id
user_id = "sultan"  # Set by frontend or default
```

**Pros:**
- Simple
- No authentication needed
- Perfect for personal use

**Cons:**
- Only one user supported
- No isolation between users

---

### Phase 2: Multi-User with Manual ID

**Implementation:** No code changes needed! Just send different `user_id` values.

```bash
# User 1: Sultan
curl -X POST /chat -d '{"user_id": "sultan", "message": "..."}'

# User 2: Ahmed
curl -X POST /chat -d '{"user_id": "ahmed", "message": "..."}'
```

**Pros:**
- Works immediately
- No authentication layer needed
- Simple for family/team use

**Cons:**
- No authentication (trust-based)
- Users can impersonate each other
- Not suitable for public deployment

---

### Phase 3: Multi-User with Authentication 🔐

**Implementation:** Add authentication middleware

#### 3.1 Add JWT Authentication

```python
# middleware/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify JWT token and extract user_id.

    Returns:
        user_id from validated token
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"]
        )
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

#### 3.2 Update Chat Endpoint

```python
# main.py

@app.post("/chat")
async def chat(
    request: ChatRequest,
    bg_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)  # ← Validated from JWT
):
    """
    Chat endpoint with authentication.

    user_id is extracted from JWT token, not from request body.
    This prevents user impersonation.
    """
    # Override request.user_id with authenticated user_id
    request.user_id = user_id

    # ... rest of implementation
```

#### 3.3 Add Login Endpoint

```python
@app.post("/login")
async def login(username: str, password: str):
    """
    Authenticate user and return JWT token.
    """
    # Verify credentials (check database)
    user = await authenticate_user(username, password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate JWT token
    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.utcnow() + timedelta(days=7)},
        settings.jwt_secret,
        algorithm="HS256"
    )

    return {"access_token": token, "token_type": "bearer"}
```

#### 3.4 Add User Management

```sql
-- Database schema for users
CREATE TABLE users (
    id TEXT PRIMARY KEY,  -- User identifier (username or UUID)
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_username ON users(username);
```

**Pros:**
- ✅ Secure user isolation
- ✅ Prevents impersonation
- ✅ Suitable for public deployment
- ✅ Industry-standard approach

**Cons:**
- More complex to implement
- Requires user registration flow
- Need to manage sessions/tokens

---

## Data Isolation Strategies

### 1. File-Based Isolation (Current) ✅

**Method:** Separate files per user

```
/vault/facts/
├── user-profile-sultan.md
├── user-profile-ahmed.md
└── user-profile-sarah.md
```

**Qdrant Collections:**
- Shared collection: `vault`
- Filter by `user_id` in metadata

```python
# Search only user's documents
results = client.search(
    collection_name="vault",
    query_vector=embedding,
    query_filter=Filter(
        must=[
            FieldCondition(
                key="user_id",
                match=MatchValue(value=user_id)
            )
        ]
    )
)
```

**Pros:**
- Simple to implement
- Easy to backup per user
- Clear file organization

**Cons:**
- Shared Qdrant collection (needs filtering)
- All users' embeddings in same space

---

### 2. Collection-Based Isolation

**Method:** Separate Qdrant collection per user

```
Qdrant:
├── vault_sultan
├── vault_ahmed
└── vault_sarah
```

**Pros:**
- Complete data isolation
- Better performance (smaller collections)
- Easy to delete user data

**Cons:**
- More complex to manage
- Resource overhead (many collections)
- May not scale to thousands of users

---

### 3. Database Row-Level Security

**Method:** PostgreSQL RLS policies

```sql
-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks
CREATE POLICY tasks_isolation ON tasks
    FOR ALL
    USING (user_id = current_setting('app.current_user_id'));
```

**Pros:**
- Database-enforced isolation
- Zero chance of data leakage
- Built-in security

**Cons:**
- Requires PostgreSQL 9.5+
- Need to set session variables
- More complex queries

---

## Recommendations

### For Personal Use (Current)

✅ **Use single-user mode with `user_id="sultan"`**

No changes needed! Your current setup is perfect.

---

### For Family/Team Use (2-10 users)

✅ **Use file-based isolation with manual user_id**

**Implementation:**
1. Frontend allows user to select their profile
2. Each user gets their own `user_id`
3. No authentication needed (trust-based)

```javascript
// Frontend dropdown
const userId = selectUser(); // "sultan", "ahmed", "sarah"

fetch('/chat', {
  body: JSON.stringify({
    user_id: userId,
    message: "..."
  })
})
```

**Estimated Effort:** 1 hour (frontend change only)

---

### For Public/Production Use (100+ users)

✅ **Use JWT authentication + file-based isolation**

**Implementation:**
1. Add user registration/login
2. JWT token validation
3. Extract `user_id` from token (not request body)
4. Filter Qdrant searches by `user_id`

**Estimated Effort:** 2-3 days

---

## Migration Path

### Step 1: Start with Single-User ✅
```python
user_id = "sultan"  # Hardcoded or from config
```

### Step 2: Add User Selector (Optional)
```python
user_id = request.user_id  # From frontend dropdown
```

### Step 3: Add Authentication (If Needed)
```python
user_id = get_current_user(token)  # From JWT
```

**Key Point:** Architecture supports all three modes! Start simple, scale when needed.

---

## Security Considerations

### 1. Prevent Path Traversal

```python
def sanitize_user_id(user_id: str) -> str:
    """
    Ensure user_id cannot escape vault directory.

    Examples:
    - "sultan" → "sultan" ✅
    - "../etc/passwd" → raises ValueError ❌
    - "user/../admin" → raises ValueError ❌
    """
    # Only allow alphanumeric, hyphens, underscores
    import re
    if not re.match(r'^[a-zA-Z0-9_-]+$', user_id):
        raise ValueError(f"Invalid user_id: {user_id}")

    return user_id

# Use in knowledge extractor
user_id = sanitize_user_id(request.user_id)
profile_path = facts_dir / f"user-profile-{user_id}.md"
```

### 2. Validate User Existence

```python
async def validate_user(user_id: str) -> bool:
    """Check if user exists in database."""
    async with get_db_pool().acquire() as conn:
        result = await conn.fetchrow(
            "SELECT id FROM users WHERE id = $1 AND is_active = true",
            user_id
        )
    return result is not None
```

### 3. Audit Logging

```python
async def log_profile_update(user_id: str, facts: List[Dict]):
    """Log all profile updates for audit trail."""
    await conn.execute(
        """
        INSERT INTO audit_log (user_id, action, details, timestamp)
        VALUES ($1, 'profile_update', $2, NOW())
        """,
        user_id,
        json.dumps({"facts_added": len(facts)})
    )
```

---

## Summary

### Current Status ✅

- **NOT hardcoded:** Path is `f"user-profile-{user_id}.md"`
- **Single-user mode:** Works perfectly for personal use
- **Multi-user ready:** Architecture supports it with zero code changes

### For Your Use Case (Personal unRAID Server)

**Recommendation:** Keep it simple!

```python
# In knowledge_extractor.py
async def update_user_profile(
    facts: List[Dict[str, str]],
    user_id: str = "sultan"  # ← Your default
) -> Optional[str]:
    """
    user_id comes from ChatRequest.user_id
    Defaults to "sultan" for single-user mode
    """
    profile_path = facts_dir / f"user-profile-{user_id}.md"
```

### If You Want Multi-User Later

Just change how `user_id` is set:
- **Now:** `user_id = "sultan"` (default)
- **Later:** `user_id = request.user_id` (from frontend)
- **Production:** `user_id = get_current_user(token)` (from JWT)

**No refactoring needed!** 🎉

---

## Next Steps

1. ✅ Implement knowledge extraction with dynamic `user_id`
2. ✅ Start with single-user mode (`user_id="sultan"`)
3. ⏸️ Add multi-user support only if needed in future
4. ⏸️ Add authentication only for public deployment

The beauty of this design: **it scales with your needs** without requiring upfront complexity!
