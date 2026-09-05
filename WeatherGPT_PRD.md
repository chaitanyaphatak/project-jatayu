# WeatherGPT — Product Requirements Document (PRD)
### Conversational AI for Weather Forecasting, Alerts & Climate Intelligence
**Target:** Production-Grade Full-Stack Hyperlocal Weather Intelligence Platform

---

## 1. Vision Statement

WeatherGPT is not "just another chatbot on top of a weather API." It is a **proactive, explainable, hyperlocal weather intelligence agent** with real ML models underneath it, not just an LLM wrapper — that talks to citizens, farmers, pilots, and disaster managers in their own language and their own voice, and doesn't wait to be asked when danger is coming.

**Winning angle for judges:** Every team will build "ask weather in chat." We differentiate on (a) real ML models doing the heavy lifting, (b) proactive agentic alerts, (c) hyperlocal accuracy via crowd-sourced ground truth, (d) explainability, (e) offline/low-connectivity rural fallback, and (f) proper per-user authentication so each user's data/history is theirs alone.

> **Note:** Landing page (GSAP scrollytelling) is intentionally **excluded from this PRD**. It will be designed and built separately, manually, after the core product is done.

---

## 2. Unique Differentiators

| # | Feature | Why it wins |
|---|---|---|
| 1 | **Proactive Agent Mode** — messages the user before they ask, based on saved profile (farmer's crop stage, pilot's route) | "AI that acts," not just "AI that answers" |
| 2 | **Hyperlocal Nowcasting via Crowd Reports** — photo/one-tap ground reports + ML correction of official forecast for micro-areas | Solves India's real village-level forecast gap |
| 3 | **Explainable Forecast ("Why?")** — confidence %, contributing factors, model agreement shown | Builds trust, shows technical depth |
| 4 | **Activity Impact Score** — ML-scored recommendation ("Spraying today: NOT recommended, 72% rain in 4hrs") | Direct tie to "decision support" ask |
| 5 | **Offline/Low-Bandwidth Fallback** — SMS/IVR-style degrade path, plus a lightweight offline-capable intent classifier | Directly addresses rural accessibility |
| 6 | **Multilingual + Code-Mixed Understanding** (Hinglish/Marathi-English) | More realistic than typical demos |
| 7 | **Multiple Working Maps** — live radar/satellite overlay map, crowd-report heatmap, route map (aviation/marine) | Visually strong, functionally different views |
| 8 | **Per-User Authenticated Experience** — each user's queries, reports, saved locations, and advisories are private to them | Real product feel, not a shared demo toy |
| 9 | **Community Trust Score / Leaderboard** for verified ground-truth reporters | Gamification, engagement, data quality |

---

## 3. Machine Learning Models Used

| Model / Algorithm | Purpose | Where it's used |
|---|---|---|
| **Time-series correction model** (lightweight LSTM or Prophet/ARIMA) | Blends official NWP forecast with local crowd/satellite signals for hyperlocal correction | Hyperlocal Nowcasting |
| **Image classification model (CNN / HF Vision Transformer)** | Classifies user-submitted sky photos: clear / cloudy / rainy / stormy | Crowd report verification, via Hugging Face |
| **DBSCAN / geo-clustering** | Groups nearby crowd reports to confirm/reject a localized event | Hyperlocal Nowcasting |
| **Anomaly detection (Isolation Forest / statistical z-score)** | Flags extreme readings beyond simple fixed thresholds, for early warning | Alerts Engine |
| **Lightweight intent classifier (scikit-learn / small transformer, offline-capable)** | Fallback NLU when LLM API is unreachable (rural low-connectivity) | Voice + Offline mode |
| **Regression / trend decomposition** | Historical climate trend analysis — temperature/rainfall pattern shift over years | Climate Analytics module |
| **Scoring model for Activity Impact Score** | Combines forecast values + confidence + activity thresholds into one actionable verdict | Advisory generation |

---

## 4. Authentication & Per-User Data Access

**Provider: Clerk** (handles auth, sessions, and user management) with **GitHub OAuth** enabled as a login provider, alongside email/password and Google (optional, your call).

**How it works:**
- Every user signs in via Clerk (GitHub OAuth or email) → Clerk issues a verified `user_id`.
- All user-specific tables in Supabase (saved locations, query history, crowd reports submitted, advisory subscriptions, trust score) store this `user_id` as a foreign key.
- Backend (FastAPI) verifies the Clerk session/JWT on every request, then scopes every DB query to `WHERE user_id = <verified_id>` — so a user can only ever read/write their own data.
- Public data (general forecasts, community heatmap aggregate) stays open; personal data (my saved farms, my report history, my alerts) is locked to that user only.
- Admin/disaster-manager role (optional stretch): a `role` field on the user record for elevated access (e.g., viewing aggregated regional data for disaster response).

**Why Clerk specifically:** ready-made GitHub OAuth + email auth out of the box, clean React SDK, no need to hand-roll JWT/session logic — saves hackathon time while still being a "real" production-grade auth system, which is a strong point when judges ask "is this a real login system or just a demo?"

**Needed from you when we reach this phase:** Clerk publishable key + secret key (from Clerk dashboard), and confirmation that GitHub OAuth app is set up in your Clerk project (Clerk makes this a toggle — I'll guide you through the GitHub OAuth app creation on GitHub's side too if needed).

---

## 5. Tech Stack (Final)

| Layer | Choice | Reasoning |
|---|---|---|
| Backend API | **Python + FastAPI** | Async, best fit for ML + LLM together |
| Authentication | **Clerk** (GitHub OAuth + email) | Ready-made per-user auth, real production feel |
| LLM Orchestration | **Gemini API** (primary) + **Groq/Llama 3** (fast fallback) | Free tiers, function-calling, low latency option |
| ML/Vision Models | **Hugging Face (Inference API + Transformers library)** | Free/low-cost pretrained models for tasks in Section 3 |
| Database | **Supabase (PostgreSQL + PostGIS)** | Structured + geospatial, realtime; auth handled by Clerk, not Supabase auth |
| Vector/RAG store | **Supabase pgvector** | Climate-history RAG, no extra service |
| Realtime alerts | **Supabase Realtime + WebSocket** | No hand-rolled pub/sub needed |
| Voice STT | **Whisper (via Hugging Face Inference API)** | Free, decent Indian accent handling |
| Voice TTS | **gTTS** (ElevenLabs as stretch goal) | Free for prototype |
| Weather Data | **Your existing APIs** — asked only when that phase needs it | Redundant sources = resilience talking point |
| Maps | **Mapbox / Leaflet + OpenStreetMap**, multiple layers | Free tier, flexible layering |
| Frontend (App) | **React + Vite + pnpm** | pnpm for faster installs/CI |
| Deployment | **Frontend → Vercel, Backend → Render**, Dockerized backend | Matches your existing setup |
| Responsiveness | **Mobile-first responsive (Tailwind breakpoints)**, tested on desktop + mobile | Judges view on both laptop and phone |

**Package manager note:** every `npm install` step uses **pnpm** instead (`pnpm install`, `pnpm add <pkg>`).

---

## 6. Database — Manual Query Workflow

- I will **write the exact SQL** (table creation, indexes, PostGIS setup, RLS policies scoped to Clerk `user_id`, seed data) for every phase that needs a DB change.
- I hand you the query block and say *"Run this in Supabase SQL Editor"* — you run it, confirm, I proceed.
- I will **never** ask for your Supabase service key for this workflow — only if the backend later needs to programmatically connect (env variable), asked once, separately.

---

## 7. Maps — Multiple Working Views

1. **Live Weather Overlay Map** — radar/cloud/satellite tile overlay on base map
2. **Crowd Report Heatmap** — density map of user-submitted ground reports, color-coded by type
3. **Route/Advisory Map** — aviation/marine use case, route with waypoint-level risk markers

All three toggle-able from one map component (tabs/layer switcher).

---

## 8. API Key / Credential Policy

- **Weather APIs:** already yours — asked one at a time, only when that specific phase's code needs it.
- **Hugging Face:** asked when we reach vision/voice phase.
- **Gemini/Groq:** asked when we reach the LLM engine phase.
- **Supabase:** no key upfront — see Section 6. Connection env var asked once, when backend needs to connect.
- **Clerk:** publishable + secret key asked when we reach the Authentication phase.
- **Mapbox (if used over Leaflet/OSM):** asked at the Maps phase.

---

## 9. Phase-Wise Build Plan

> At the start of each phase I'll confirm exactly what's needed (SQL to run, or a specific key) and pause for you before writing that phase's code.

### Phase 0 — Project Setup & Environment
**Stack:** Git repo, FastAPI skeleton, pnpm-based frontend scaffold, Docker base
**Needed from you:** GitHub repo link (or "local only")

### Phase 1 — Authentication (Clerk + GitHub OAuth)
**Stack:** Clerk React SDK (frontend), Clerk backend SDK/JWT verification (FastAPI), user table SQL
**Needed from you:** Clerk publishable + secret key; confirm GitHub OAuth app set up in Clerk

### Phase 2 — Core Data Layer & Weather Ingestion
**Stack:** FastAPI routes, your weather APIs, Supabase tables (locations, forecasts, alerts) via manual SQL, all scoped to authenticated `user_id` where relevant
**Needed from you:** SQL run confirmation; the specific weather API key you want wired first

### Phase 3 — LLM Query Understanding Engine
**Stack:** Gemini/Groq function-calling, intent routing
**Needed from you:** Gemini API key and/or Groq API key; confirm demo language priority

### Phase 4 — Alerts, Anomaly Detection & Proactive Agent
**Stack:** Isolation Forest/threshold hybrid, Supabase Realtime, Activity Impact Score model
**Needed from you:** Alert threshold preferences (rainfall mm, wind speed, etc.)

### Phase 5 — Hyperlocal Crowd Reports + Vision + ML Nowcasting
**Stack:** Image upload endpoint, Hugging Face vision model, DBSCAN clustering, time-series correction model
**Needed from you:** Hugging Face API token

### Phase 6 — Voice Layer + Offline Intent Classifier
**Stack:** Whisper via HF, gTTS, lightweight offline intent classifier
**Needed from you:** Nothing new — reuses HF token from Phase 5

### Phase 7 — Frontend Chat App + Multiple Maps
**Stack:** React + Vite + pnpm, chat UI, 3 map layers, fully responsive (mobile + desktop), Clerk-authenticated views
**Needed from you:** Mapbox API key (only if chosen over free Leaflet+OSM)

### Phase 8 — Deployment & Demo Polish
**Stack:** Docker, Render (backend), Vercel (frontend), mobile performance pass
**Needed from you:** Render + Vercel accounts (free), or confirm "local demo only"

### Phase 9 — Presentation & Executive Materials
**Stack:** N/A — content generation
**Deliverables:** Comprehensive architecture and executive overview briefs

---

## 10. Continuity Log System

A file named **`PROGRESS_LOG.md`** is maintained in the project root. Format:

```
## [Phase X - Module Name] - Status: DONE / IN PROGRESS / BLOCKED
Date:
What was built:
- ...
Files touched:
- ...
Pending/Next step:
- ...
Credentials still needed:
- ...
```

Any new model session (Antigravity or otherwise) should:
1. Read `PROGRESS_LOG.md` top to bottom
2. Identify the last "IN PROGRESS" or first missing phase
3. Resume from there without re-asking for already-provided credentials

---

## 11. Evaluation Criteria Mapping

| Evaluation Criteria | How we address it |
|---|---|
| Accuracy & relevance | Multi-source data fusion + real ML correction models + explainability layer |
| Response latency | Groq fast-inference fallback path |
| Multilingual capability | Gemini/Groq native multilingual + code-mixed handling |
| UI/accessibility | Mobile+desktop responsive, voice-first, offline fallback |
| Scalability | Supabase + Docker + stateless FastAPI |
| Real-time integration | Realtime alerts via Supabase + WebSocket |
| Security/Privacy | Clerk-based per-user auth, data scoped strictly to owner |
| Innovation | ML nowcasting, crowd-verification, explainable AI, activity scoring |

---

## 12. Immediate Next Step

Starting **Phase 0**. Please just confirm:
1. GitHub repo link (or "local only")

No keys needed yet. Right after scaffolding, Phase 1 (Authentication) will need your **Clerk keys**.
