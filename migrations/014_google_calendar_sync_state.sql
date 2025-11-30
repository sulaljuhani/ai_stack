-- Migration 014: Google Calendar Sync State
-- Stores sync tokens for incremental sync (like Todoist)

CREATE TABLE IF NOT EXISTS calendar_sync_state (
    calendar_id TEXT PRIMARY KEY,  -- 'primary', 'work@example.com', etc.
    sync_token TEXT,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE calendar_sync_state IS 'Google Calendar sync token storage for incremental sync';