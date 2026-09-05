-- =========================================================
-- WeatherGPT: Phase 1 — User Profiles & Permissions Schema
-- Run this in your Supabase SQL Editor
-- =========================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: user_profiles
-- Foreign key matches Clerk user ID string (e.g., 'user_2abcdef...')
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT NOT NULL UNIQUE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'farmer', 'pilot', 'disaster_manager', 'admin')),
    occupation TEXT,
    crop_stage TEXT,
    language_preference TEXT DEFAULT 'en',
    trust_score INTEGER DEFAULT 100, -- Gamification / Verified Ground Truth Leaderboard
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on clerk_user_id for ultra-fast lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON public.user_profiles (clerk_user_id);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_user_profiles_timestamp ON public.user_profiles;
CREATE TRIGGER set_user_profiles_timestamp
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Verify creation
SELECT 'Table public.user_profiles created successfully' AS status;
