-- Migration 016: Calendar Webhook Channels
-- Stores Google Calendar push notification channel information

CREATE TABLE IF NOT EXISTS calendar_webhook_channels (
    calendar_id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    expiration TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_expiration ON calendar_webhook_channels(expiration);

COMMENT ON TABLE calendar_webhook_channels IS 'Google Calendar webhook push notification channels';
COMMENT ON COLUMN calendar_webhook_channels.channel_id IS 'Unique channel ID generated for the watch request';
COMMENT ON COLUMN calendar_webhook_channels.resource_id IS 'Resource ID returned by Google Calendar API';
COMMENT ON COLUMN calendar_webhook_channels.expiration IS 'Channel expiration timestamp (max 7 days from creation)';
