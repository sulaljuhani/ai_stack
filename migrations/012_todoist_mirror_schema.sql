-- Migration 012: Todoist Mirror Schema
-- Adds mirror tables for Todoist projects, sections, labels, and sync state.
-- Extends tasks with Todoist parity fields.

-- Todoist Projects
CREATE TABLE IF NOT EXISTS todoist_projects (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    parent_id TEXT REFERENCES todoist_projects(id) ON DELETE SET NULL,
    child_order INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_inbox_project BOOLEAN DEFAULT FALSE,
    view_style TEXT DEFAULT 'list',
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todoist_projects_user ON todoist_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_todoist_projects_parent ON todoist_projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_todoist_projects_order ON todoist_projects(user_id, parent_id, child_order);

CREATE TRIGGER update_todoist_projects_updated_at
    BEFORE UPDATE ON todoist_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Todoist Sections
CREATE TABLE IF NOT EXISTS todoist_sections (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES todoist_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    section_order INTEGER DEFAULT 0,
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todoist_sections_user ON todoist_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_todoist_sections_project ON todoist_sections(project_id);
CREATE INDEX IF NOT EXISTS idx_todoist_sections_order ON todoist_sections(project_id, section_order);

CREATE TRIGGER update_todoist_sections_updated_at
    BEFORE UPDATE ON todoist_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Todoist Labels
CREATE TABLE IF NOT EXISTS todoist_labels (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    item_order INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todoist_labels_user ON todoist_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_todoist_labels_order ON todoist_labels(user_id, item_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_todoist_labels_name_unique ON todoist_labels(user_id, lower(name));

CREATE TRIGGER update_todoist_labels_updated_at
    BEFORE UPDATE ON todoist_labels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sync state
CREATE TABLE IF NOT EXISTS todoist_sync_state (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sync_token TEXT,
    last_full_sync TIMESTAMP,
    last_incremental_sync TIMESTAMP,
    last_webhook_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TRIGGER update_todoist_sync_state_updated_at
    BEFORE UPDATE ON todoist_sync_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Extend tasks for Todoist parity
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS due_string TEXT,
    ADD COLUMN IF NOT EXISTS due_is_recurring BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sync_id TEXT,
    ADD COLUMN IF NOT EXISTS todoist_raw JSONB;

CREATE INDEX IF NOT EXISTS idx_tasks_sync_id ON tasks(sync_id);
