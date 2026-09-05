# WeatherGPT — Project Executive Brief & System Architecture

## 1. Project Overview
- **Project Name:** WeatherGPT
- **Tagline:** Proactive, Explainable, Hyperlocal Weather Intelligence Agent with Multi-Source ML Fusion & Crowd Ground Truth
- **Category:** Disaster Management / Agriculture / Climate Intelligence / Aviation

---

## 2. Executive Pitch & Core Capabilities
Most conventional weather applications only provide basic "ask weather in a chat" wrappers around single forecast APIs. 

**WeatherGPT is an active decision-support agent powered by machine learning & ground truth fusion:**
1. **Tri-Source Data Fusion:** Concurrently blends ECMWF & GFS physics (Open-Meteo), micro-climates (WeatherAPI.com), and atmospheric observations (OpenWeatherMap).
2. **Explainable Forecasts ("Why?"):** Never presents black-box numbers. Calculates model consensus %, pressure delta, and contributing factors.
3. **Hyperlocal Ground Truth ML:** Micro-area crowd reports verified by **Scikit-learn DBSCAN geo-clustering** and **Hugging Face Vision Transformer**.
4. **Time-Series Nowcast Correction:** Blends official NWP models with verified local ground truth to eliminate village-level forecast gaps.
5. **Proactive Agent Mode:** Alerts farmers (crop spraying windows), pilots (turbulence & crosswinds), and disaster managers (flash flood peaks) **before** they ask.
6. **Rural Low-Connectivity Resilience:** Offline-capable lightweight scikit-learn intent classifier running in <5ms without consuming external API tokens + voice TTS.
7. **Per-User Authenticated Security:** Enterprise-grade Clerk authentication (GitHub OAuth + email), scoping user farms, flight corridors, and telemetry.

---

## 3. Machine Learning Models Summary

| ML Model / Algorithm | Purpose | Location in Codebase |
|---|---|---|
| **Tri-Source Ensemble Blender** | Multi-model convergence & agreement scoring | `backend/app/services/weather_service.py` |
| **Isolation Forest & Statistical Z-Score** | Extreme weather anomaly detection (precipitation & updraft spikes) | `backend/app/services/anomaly_detector.py` |
| **DBSCAN Geo-Clustering (Haversine)** | Groups nearby user observations to verify local weather events | `backend/app/services/crowd_ml_service.py` |
| **Time-Series NWP Correction Model** | Adjusts official NWP forecast with real-time ground truth signals | `backend/app/services/crowd_ml_service.py` |
| **Sky Vision Transformer / CNN** | Verifies sky photos (nimbostratus, convective clouds, clear) | `backend/app/services/crowd_ml_service.py` |
| **Activity Impact Scoring Model** | Scores spraying safety, flight clearance, and flood risk | `backend/app/services/activity_scorer.py` |
| **Offline TF-IDF Intent Classifier** | Sub-5ms rural fallback NLU when LLM is unreachable | `backend/app/services/offline_classifier.py` |

---

## 4. Live Demo Flow (Presentation Script)

### Step 1: Personalized Authentication & Proactive Alert Ticker
- Show Clerk user profile and live community trust points.
- Point to the animated **Top Alert Banner** computing live Isolation Forest z-scores (+1.0σ to +3.9σ).
- Switch personas (**Farmer**, **Aviation**, **Disaster Manager**, **Citizen**) to show the proactive alert ticker morph dynamically.

### Step 2: Live Ground Telemetry & Explainable "Why?"
- Demonstrate the live Tri-Source weather panel converging Open-Meteo, WeatherAPI, and OpenWeatherMap.
- Point to the **Activity Impact Score** card: "Soybean Spraying: SAFE TO PROCEED" based on surface wind <15 km/h and rain probability.
- Point to the **Explainable Forecast** card displaying 92% model consensus and barometric stability.

### Step 3: Conversational Intelligence (Gemini 3.6 Flash)
- Ask: *"Should I spray fungicide on my soybean crop today?"*
- Watch Gemini 3.6 Flash synthesize live telemetry, crop stage, and droplet drift physics into a structured, technical recommendation.
- Click the **Voice Speaker Icon** to demonstrate gTTS voice synthesis for accessibility.

### Step 4: Triple Working Maps (Leaflet Interactive)
- Switch to the **Triple Maps** tab:
  - **1. Live Radar Overlay:** Shows live precipitation tile layers + 25km Doppler echo coverage.
  - **2. Crowd Heatmap:** Shows DBSCAN-verified ground truth clusters.
  - **3. Route Advisory:** Demonstrates the Pune-to-Mumbai airway corridor with waypoint-level turbulence risk markers.

### Step 5: Crowd Ground Truth & Hyperlocal Time-Series Correction
- Switch to **Crowd & Leaderboard** tab:
  - Demonstrate the **Time-Series Correction Model** updating official 25km GFS rain forecasts using local DBSCAN ground reports.
  - Click **"+ Report Ground Truth"** to submit a live observation with sky photo verification.
  - Show the **Community Trust Leaderboard** automatically awarding trust points.
