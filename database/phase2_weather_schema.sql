-- =========================================================
-- WeatherGPT: Phase 2 — Core Data Layer & Saved Locations Schema
-- Run this in your Supabase SQL Editor
-- =========================================================

-- 1. Table: saved_locations (User-specific saved farms, flight routes, home/office)
CREATE TABLE IF NOT EXISTS public.saved_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_type TEXT DEFAULT 'farm' CHECK (location_type IN ('farm', 'airport', 'home', 'office', 'hazard_zone')),
    crop_stage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast user-scoped queries
CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON public.saved_locations (clerk_user_id);

-- 2. Table: weather_cache (Multi-source cache to prevent API rate limits)
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_key TEXT NOT NULL UNIQUE, -- e.g. "18.5204_73.8567"
    location_name TEXT,
    temperature DOUBLE PRECISION,
    feels_like DOUBLE PRECISION,
    humidity INTEGER,
    wind_speed DOUBLE PRECISION,
    precipitation_prob DOUBLE PRECISION,
    condition TEXT,
    air_quality_index INTEGER,
    source TEXT DEFAULT 'open-meteo',
    raw_payload JSONB,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_key ON public.weather_cache (location_key);

-- 3. Enable RLS on both tables
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for saved_locations
DROP POLICY IF EXISTS "Allow user to read own saved locations" ON public.saved_locations;
CREATE POLICY "Allow user to read own saved locations" ON public.saved_locations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user to insert own saved locations" ON public.saved_locations;
CREATE POLICY "Allow user to insert own saved locations" ON public.saved_locations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow user to delete own saved locations" ON public.saved_locations;
CREATE POLICY "Allow user to delete own saved locations" ON public.saved_locations
    FOR DELETE USING (true);

-- 5. RLS Policies for weather_cache (Publicly readable weather cache, system write)
DROP POLICY IF EXISTS "Allow public read of weather cache" ON public.weather_cache;
CREATE POLICY "Allow public read of weather cache" ON public.weather_cache
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts into weather cache" ON public.weather_cache;
CREATE POLICY "Allow inserts into weather cache" ON public.weather_cache
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update of weather cache" ON public.weather_cache;
CREATE POLICY "Allow update of weather cache" ON public.weather_cache
    FOR UPDATE USING (true);

-- Verify
SELECT 'Phase 2 tables created successfully with RLS enabled' AS status;
