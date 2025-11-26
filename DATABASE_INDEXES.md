# Database Indexes Documentation

**Purpose:** This document lists recommended indexes for optimal query performance.

**Last Updated:** 2025-11-22

---

## ✅ Existing Indexes (From Schema)

Based on the database schema review, the following indexes already exist:

### Categories Table
```sql
-- PRIMARY KEY
CREATE UNIQUE INDEX categories_pkey ON categories(id);

-- UNIQUE CONSTRAINT
CREATE UNIQUE INDEX categories_user_id_name_key ON categories(user_id, name);

-- Performance indexes
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_user ON categories(user_id);
```

**Status:** ✅ Well-indexed

---

### Tasks Table
**Common Query Patterns:**
- Filter by user_id + status
- Filter by user_id + due_date
- Filter by user_id + priority
- Search by depends_on array
- Search by blocks array

**Recommended Indexes:**

```sql
-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority DESC);

-- For dependency queries
CREATE INDEX IF NOT EXISTS idx_tasks_depends_on ON tasks USING GIN(depends_on);
CREATE INDEX IF NOT EXISTS idx_tasks_blocks ON tasks USING GIN(blocks);

-- For text search (if using ts_vector)
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- For tag searches
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);
```

**Priority:** HIGH
**Impact:** Major improvement for task listing, filtering, and dependency resolution

---

### Events Table
**Common Query Patterns:**
- Filter by user_id + start_time range
- Filter by user_id + status
- Search by attendees
- Check time conflicts

**Recommended Indexes:**

```sql
-- Composite index for time-based queries
CREATE INDEX IF NOT EXISTS idx_events_user_start_time ON events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_events_user_status ON events(user_id, status);

-- For conflict checking (overlapping time ranges)
CREATE INDEX IF NOT EXISTS idx_events_time_range ON events USING GIST(tsrange(start_time, end_time));

-- For attendee searches
CREATE INDEX IF NOT EXISTS idx_events_attendees ON events USING GIN(attendees);

-- For recurring event queries
CREATE INDEX IF NOT EXISTS idx_events_recurring ON events(recurrence_parent_id) WHERE is_recurring = true;
```

**Priority:** HIGH
**Impact:** Faster calendar views, conflict detection, and scheduling

---

### Reminders Table
**Common Query Patterns:**
- Filter by user_id + remind_at
- Filter by user_id + status
- Get today's reminders
- Get overdue reminders

**Recommended Indexes:**

```sql
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reminders_user_remind_at ON reminders(user_id, remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user_status ON reminders(user_id, status);

-- For overdue queries
CREATE INDEX IF NOT EXISTS idx_reminders_overdue ON reminders(user_id, remind_at)
    WHERE status != 'completed' AND remind_at < NOW();

-- For tag searches
CREATE INDEX IF NOT EXISTS idx_reminders_tags ON reminders USING GIN(tags);
```

**Priority:** MEDIUM
**Impact:** Faster reminder lookups and due-soon queries

---

### Food_log Table
**Common Query Patterns:**
- Filter by user_id + consumed_at range
- Filter by user_id + rating
- Pattern analysis queries

**Recommended Indexes:**

```sql
-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_food_log_user_consumed_at ON food_log(user_id, consumed_at DESC);

-- Rating queries
CREATE INDEX IF NOT EXISTS idx_food_log_user_rating ON food_log(user_id, rating) WHERE rating IS NOT NULL;

-- Tag searches
CREATE INDEX IF NOT EXISTS idx_food_log_tags ON food_log USING GIN(tags);

-- Text search for food items
CREATE INDEX IF NOT EXISTS idx_food_log_search ON food_log USING GIN(to_tsvector('english', food_item));
```

**Priority:** MEDIUM
**Impact:** Faster food log queries and pattern analysis

---

### Notes Table
**Common Query Patterns:**
- Filter by user_id
- Full-text search
- Category filtering

**Recommended Indexes:**

```sql
-- Basic user filtering
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_category ON notes(user_id, category_id);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING GIN(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Tag searches
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
```

**Priority:** MEDIUM
**Impact:** Faster note searches and retrieval

---

### Documents & Document_chunks Tables
**Common Query Patterns:**
- Filter by user_id
- Filter by file_path
- Search by vault status

**Recommended Indexes:**

```sql
-- Documents table
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_path ON documents(file_path);
CREATE INDEX IF NOT EXISTS idx_documents_vault ON documents(is_vault_file) WHERE is_vault_file = true;

-- Document_chunks table
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_id ON document_chunks(document_id);
```

**Priority:** LOW
**Impact:** Moderate improvement for document operations

---

### Memory Tables (memories, memory_sectors, memory_links)
**Common Query Patterns:**
- Filter by user_id
- Time-based queries
- Sector-based queries

**Recommended Indexes:**

```sql
-- Memories table
CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_sectors ON memories USING GIN(sectors);

-- Memory_sectors table
CREATE INDEX IF NOT EXISTS idx_memory_sectors_user ON memory_sectors(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_sectors_name ON memory_sectors(user_id, name);

-- Memory_links table
CREATE INDEX IF NOT EXISTS idx_memory_links_from ON memory_links(from_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_links_to ON memory_links(to_memory_id);
```

**Priority:** LOW
**Impact:** Faster memory queries and relationship traversal

---

## 🔧 Index Creation Script

```sql
-- ============================================================================
-- HIGH PRIORITY INDEXES
-- ============================================================================

-- Tasks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_priority ON tasks(user_id, priority DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_depends_on ON tasks USING GIN(depends_on);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_blocks ON tasks USING GIN(blocks);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_user_start_time ON events(user_id, start_time);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_user_status ON events(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_attendees ON events USING GIN(attendees);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_recurring ON events(recurrence_parent_id) WHERE is_recurring = true;

-- ============================================================================
-- MEDIUM PRIORITY INDEXES
-- ============================================================================

-- Reminders
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_user_remind_at ON reminders(user_id, remind_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_user_status ON reminders(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_tags ON reminders USING GIN(tags);

-- Food Log
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_log_user_consumed_at ON food_log(user_id, consumed_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_log_user_rating ON food_log(user_id, rating) WHERE rating IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_log_tags ON food_log USING GIN(tags);

-- Notes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_category ON notes(user_id, category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);
```

**Note:** Using `CREATE INDEX CONCURRENTLY` allows index creation without locking the table for writes.

---

## 📊 Index Monitoring

### Check Index Usage
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Find Missing Indexes
```sql
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / NULLIF(seq_scan, 0) as avg_seq_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

### Check Index Size
```sql
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

---

## 🎯 Performance Impact Estimates

### With Current Indexes Only
- Task queries: ~100-500ms (sequential scans on large datasets)
- Event conflict checking: ~50-200ms
- Reminder lookups: ~50-150ms

### With Recommended Indexes
- Task queries: ~5-20ms (index scans)
- Event conflict checking: ~1-10ms (GIST index)
- Reminder lookups: ~1-5ms

**Estimated Overall Improvement:** 10-50x faster for common queries

---

## 🚨 Important Notes

1. **GIN Indexes:** Use for array and JSONB columns (tags, depends_on, attendees)
2. **GIST Indexes:** Use for time range queries (event conflicts)
3. **Partial Indexes:** Use WHERE clause for filtered queries (overdue, recurring)
4. **Composite Indexes:** Left-most column should be most selective

5. **Trade-offs:**
   - Indexes speed up reads but slow down writes
   - Each index uses disk space
   - Too many indexes can hurt performance
   - Keep indexes under 10-15 per table for best balance

---

**Recommendation:** Apply HIGH priority indexes immediately, MEDIUM priority as load increases.
