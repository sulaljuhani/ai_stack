-- Migration 015: Events Table Google Calendar Updates
-- Add missing fields for full Google Calendar compatibility

-- Add conferencing field (Google Meet links)
ALTER TABLE events ADD COLUMN IF NOT EXISTS conference_data JSONB;

-- Add color_id (Google Calendar color scheme)
ALTER TABLE events ADD COLUMN IF NOT EXISTS color_id TEXT;

-- Add visibility (default, public, private)
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'default';

-- Add hangout_link (deprecated but still used)
ALTER TABLE events ADD COLUMN IF NOT EXISTS hangout_link TEXT;

-- Add source (where event was created: 'google', 'agent', 'manual')
ALTER TABLE events ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Index for source filtering
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);

COMMENT ON COLUMN events.conference_data IS 'Google Meet or other conference details (JSONB)';
COMMENT ON COLUMN events.source IS 'Event creation source: google, agent, manual';