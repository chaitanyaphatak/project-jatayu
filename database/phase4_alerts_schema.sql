-- =========================================================
-- WeatherGPT: Phase 4 — Alerts & Anomaly Engine Schema
-- Run this in your Supabase SQL Editor
-- =========================================================

-- Table: weather_alerts
CREATE TABLE IF NOT EXISTS public.weather_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT, -- Null for regional public alerts, or specific user_id for proactive personalized alerts
    severity TEXT NOT NULL CHECK (severity IN ('info', 'advisory', 'warning', 'severe', 'extreme')),
    alert_type TEXT NOT NULL, -- e.g. 'precipitation_anomaly', 'convective_wind', 'flash_flood', 'heat_stress'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    z_score DOUBLE PRECISION, -- Statistical anomaly metric (e.g. +3.2)
    is_proactive BOOLEAN DEFAULT true, -- Proactive agent dispatched alert
    is_read BOOLEAN DEFAULT false,
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.weather_alerts (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.weather_alerts (severity);

-- Enable RLS
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public read of weather alerts" ON public.weather_alerts;
CREATE POLICY "Allow public read of weather alerts" ON public.weather_alerts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert of weather alerts" ON public.weather_alerts;
CREATE POLICY "Allow insert of weather alerts" ON public.weather_alerts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update of weather alerts" ON public.weather_alerts;
CREATE POLICY "Allow update of weather alerts" ON public.weather_alerts
    FOR UPDATE USING (true);

SELECT 'Table public.weather_alerts created successfully with RLS enabled' AS status;
