-- =========================================================
-- WeatherGPT: Phase 5 — Crowd Ground Truth & Vision ML Schema
-- Run this as Query 4 in your Supabase SQL Editor
-- =========================================================

-- 1. Table: crowd_reports (Hyperlocal ground observations & sky photos)
CREATE TABLE IF NOT EXISTS public.crowd_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name TEXT NOT NULL,
    observed_condition TEXT NOT NULL CHECK (observed_condition IN ('clear', 'cloudy', 'rainy', 'stormy', 'hail')),
    intensity TEXT DEFAULT 'moderate' CHECK (intensity IN ('light', 'moderate', 'heavy', 'severe')),
    image_url TEXT,
    vision_predicted_label TEXT,
    vision_confidence DOUBLE PRECISION,
    is_verified BOOLEAN DEFAULT false,
    cluster_id INTEGER DEFAULT -1, -- Assigned by DBSCAN clustering algorithm
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crowd_reports_coords ON public.crowd_reports (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_crowd_reports_user ON public.crowd_reports (clerk_user_id);

-- 2. Table: community_leaderboard (Gamified Trust Scores for Ground Reporters)
CREATE TABLE IF NOT EXISTS public.community_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL UNIQUE,
    reporter_name TEXT NOT NULL,
    trust_score INTEGER DEFAULT 100,
    reports_submitted INTEGER DEFAULT 0,
    reports_verified INTEGER DEFAULT 0,
    badge TEXT DEFAULT 'Field Observer' CHECK (badge IN ('Field Observer', 'Trusted Meteorologist', 'Village Scout', 'Disaster Sentinel')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.crowd_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crowd_reports
DROP POLICY IF EXISTS "Allow public read of crowd reports" ON public.crowd_reports;
CREATE POLICY "Allow public read of crowd reports" ON public.crowd_reports
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user to insert crowd reports" ON public.crowd_reports;
CREATE POLICY "Allow user to insert crowd reports" ON public.crowd_reports
    FOR INSERT WITH CHECK (true);

-- RLS Policies for community_leaderboard
DROP POLICY IF EXISTS "Allow public read of leaderboard" ON public.community_leaderboard;
CREATE POLICY "Allow public read of leaderboard" ON public.community_leaderboard
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update of leaderboard" ON public.community_leaderboard;
CREATE POLICY "Allow update of leaderboard" ON public.community_leaderboard
    FOR UPDATE USING (true);

SELECT 'Phase 5 crowd reports and leaderboard tables created successfully' AS status;
