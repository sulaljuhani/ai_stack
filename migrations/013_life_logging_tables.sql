-- 013_life_logging_tables.sql

-- Menstrual Cycle Tracking
CREATE TABLE IF NOT EXISTS menstrual_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    flow_intensity VARCHAR(50), -- e.g., "Light", "Medium", "Heavy"
    symptoms JSONB DEFAULT '{}'::jsonb, -- e.g., ["Cramps", "Headache"]
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_id ON menstrual_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_start_date ON menstrual_cycles(start_date);

-- Intimate Activity Tracking
CREATE TABLE IF NOT EXISTS activities_sex (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    partner_id VARCHAR(255),
    protection_used BOOLEAN,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_sex_user_id ON activities_sex(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_sex_occurred_at ON activities_sex(occurred_at);

-- Miscellaneous Life Events (Haircuts, Doctor, etc.)
CREATE TABLE IF NOT EXISTS events_misc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL, -- "Haircut", "Dentist", "Car Service"
    cost DECIMAL(10, 2),
    location VARCHAR(255),
    notes TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_misc_user_id ON events_misc(user_id);
CREATE INDEX IF NOT EXISTS idx_events_misc_category ON events_misc(category);
CREATE INDEX IF NOT EXISTS idx_events_misc_occurred_at ON events_misc(occurred_at);
