<p align="center">
  <img src="assets/jatayu_logo.png" alt="Jatayu Logo" width="380" />
</p>

<h1 align="center">🦅 JATAYU (WeatherGPT)</h1>

<p align="center">
  <strong>Proactive, Explainable, Hyperlocal Climate Intelligence Agent with Multi-Source Physics Fusion & Crowd Ground-Truth ML</strong>
</p>

<p align="center">
  <a href="https://jatayu-ebon.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-Jatayu_Intelligence-00E5FF?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://jatayu-backend-kf1f.onrender.com/docs" target="_blank">
    <img src="https://img.shields.io/badge/⚡_API_Docs-FastAPI_Swagger-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="API Docs" />
  </a>
  <a href="https://github.com/chaitanyaphatak/skysense-ai">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

<p align="center">
  <a href="https://jatayu-ebon.vercel.app/"><strong>🔗 Live Platform: Jatayu | AI Weather Intelligence & Hyperlocal Alerts</strong></a>
</p>

---

## 🛠️ Tech Stack & Ecosystem

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <br/>
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Uvicorn-2C3E50?style=for-the-badge&logo=gunicorn&logoColor=white" alt="Uvicorn" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Clerk_SSO-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
  <br/>
  <img src="https://img.shields.io/badge/Google_Gemini-8E75FF?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face" />
  <img src="https://img.shields.io/badge/Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white" alt="NumPy" />
  <img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white" alt="Pandas" />
  <br/>
  <img src="https://img.shields.io/badge/Vercel_Edge-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Render_Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render" />
</p>

---

## 📌 1. Project Overview & Problem Statement

Most conventional weather platforms are passive wrapper apps: they fetch coarse forecasts from a single API and show generic weather cards without context.

**Jatayu** is an autonomous, explainable decision-support platform engineered for **Disaster Management (NDMA)**, **Precision Agriculture (FAO-56)**, **Aviation Operations (ICAO)**, and **Citizen Resilience**. It blends multi-source atmospheric physics, verifies micro-climate conditions using crowd telemetry and computer vision, and runs specialized machine learning models to deliver proactive warnings before disasters strike.

### 🌟 Core Capabilities
1. **Tri-Source Meteorological Fusion:** Blends numerical weather prediction models (ECMWF/GFS via Open-Meteo), micro-climates (WeatherAPI), and ground telemetry (OpenWeatherMap) with consensus weighting.
2. **Explainable Forecasts ("Why?"):** Generates transparent reasoning including barometric pressure trends, dew-point depressions, and model variance.
3. **Crowd-Sourced Ground Truth ML:** Micro-area citizen observations verified via **Scikit-learn DBSCAN geo-clustering** and **Hugging Face Vision Transformers**.
4. **Time-Series NWP Bias Correction:** Dynamically corrects coarse 25km grid models using verified real-time hyperlocal ground reports.
5. **Precision Domain Modules:**
   - **Agro-Met:** FAO-56 Penman-Monteith Evapotranspiration, Delta-T spraying safety, WBGT heat stress.
   - **Disaster Risk:** NDMA Multi-Hazard Vulnerability Index (Flash Flood, Convective Wind, Heat Island).
   - **Aviation Met:** ICAO ATIS weather generator, Runway crosswind resolver, and Clear Air Turbulence (CAT) estimator.
6. **Rural Low-Connectivity Resilience:** Offline TF-IDF intent classifier responding in `<5ms` with multi-lingual audio synthesis (gTTS in English, Hindi, and Marathi).

---

## 🏛️ 2. System Architecture

```mermaid
graph TB
    subgraph Client_Layer ["Client Layer (React 18 + TypeScript + Vite)"]
        UI_Overview["📊 Command Center (Telemetry & Why?)"]
        UI_Forecast["📈 Multi-Model Forecast & Radar"]
        UI_Advisory["🚜 Precision Agro & NDMA Disaster Risk"]
        UI_Aviation["✈️ Aviation Met (ICAO ATIS / Crosswind)"]
        UI_Chat["🤖 Conversational Gemini Agent + Voice AI"]
        UI_Crowd["👥 Ground Truth & Leaderboard"]
        UI_Maps["🗺️ Interactive Leaflet + Wind-GL Radar"]
    end

    subgraph Security_Auth ["Identity & Security"]
        Clerk["🔐 Clerk SSO (Google OAuth2 / Email / RLS)"]
    end

    subgraph Edge_Gateway ["API Gateway & Routing Layer"]
        Vercel_Edge["⚡ Vercel Edge Global CDN (jatayu-ebon.vercel.app)"]
        FastAPI_Router["🚀 Render Cloud FastAPI ASGI (/api/v1)"]
    end

    subgraph Intelligent_Engines ["Machine Learning & Physics Engine Layer"]
        WeatherService["🌪️ Tri-Source Multi-Model Blender"]
        AnomalyDetector["⚠️ Isolation Forest & Z-Score Anomaly Engine"]
        CrowdML["📍 DBSCAN Spatial Clustering & Vision ML"]
        AgroEngine["🌱 FAO-56 & Delta-T Agronomy Engine"]
        DisasterEngine["🚨 NDMA Multi-Hazard Index Engine"]
        AviationEngine["🛫 ICAO ATIS & Crosswind Resolver"]
        LLMEngine["🧠 Google Gemini 3.6 Flash Conversational Brain"]
        OfflineNLU["⚡ Offline TF-IDF Intent Classifier (<5ms)"]
        VoiceService["🔊 gTTS Multi-Lingual Audio Synthesizer"]
    end

    subgraph External_APIs ["External Meteorological Feeds"]
        OpenMeteo["Open-Meteo (ECMWF & GFS Physics)"]
        OWM["OpenWeatherMap (Radar & Tiles)"]
        WeatherAPI["WeatherAPI (Micro-stations)"]
        GeminiAPI["Google Gemini AI API"]
    end

    subgraph Storage_Layer ["Data Layer (Supabase PostgreSQL)"]
        DB_Users[("👤 user_profiles")]
        DB_Locations[("📌 saved_locations")]
        DB_Alerts[("🔔 weather_alerts")]
        DB_Crowd[("📷 crowd_reports")]
        DB_Leaderboard[("🏆 community_leaderboard")]
        DB_Cache[("⚡ weather_cache")]
    end

    Client_Layer --> Clerk
    Client_Layer --> Vercel_Edge
    Vercel_Edge --> FastAPI_Router

    FastAPI_Router --> WeatherService
    FastAPI_Router --> AnomalyDetector
    FastAPI_Router --> CrowdML
    FastAPI_Router --> AgroEngine
    FastAPI_Router --> DisasterEngine
    FastAPI_Router --> AviationEngine
    FastAPI_Router --> LLMEngine
    FastAPI_Router --> OfflineNLU
    FastAPI_Router --> VoiceService

    WeatherService --> OpenMeteo
    WeatherService --> OWM
    WeatherService --> WeatherAPI
    LLMEngine --> GeminiAPI

    WeatherService --> DB_Cache
    FastAPI_Router --> DB_Users
    FastAPI_Router --> DB_Locations
    AnomalyDetector --> DB_Alerts
    CrowdML --> DB_Crowd
    CrowdML --> DB_Leaderboard
```

---

## 🤖 3. Hugging Face & Computer Vision Models

Jatayu integrates Hugging Face state-of-the-art transformer architectures for multi-modal climate intelligence:

| Model Architecture | Hugging Face Repository / Base Model | Role in Jatayu Platform | Implementation File |
|---|---|---|---|
| **Vision Transformer (ViT)** | `google/vit-base-patch16-224` | **Sky Image Cloud Classification & Verification:** Classifies uploaded sky photos into *Nimbostratus*, *Cumulonimbus*, *Stratus*, or *Clear* to mathematically verify citizen ground reports before database ingestion. | [`crowd_ml_service.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/crowd_ml_service.py) |
| **ResNet-50 / ConvNeXt** | `microsoft/resnet-50` | **Agro Crop Damage & Flood Observation:** Inspects uploaded crop & field images for waterlogging, hail damage, or heat stress anomalies. | [`crowd_ml_service.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/crowd_ml_service.py) |
| **Whisper STT** | `openai/whisper-tiny` | **Speech-to-Text Voice Transcriber:** Translates spoken Hindi, Marathi, and English voice notes into structured text queries for farmers and field workers. | [`voice.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/api/v1/voice.py) |

---

## 🧠 4. Machine Learning Models & Mathematical Formulations

Jatayu executes multiple scientific and statistical machine learning algorithms:

### 1. Tri-Source Multi-Model Ensemble Blender
Concurrently blends physics-based NWP models (ECMWF, GFS) and real-time station observations:
$$\text{Temperature}_{\text{blended}} = \sum_{i=1}^{N} w_i \cdot T_i \quad \text{where} \quad w_i = \frac{1/\sigma_i^2}{\sum 1/\sigma_k^2}$$
- **Code:** [`weather_service.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/weather_service.py)

### 2. Isolation Forest & Statistical Z-Score Anomaly Detector
Detects severe weather anomalies (such as sudden pressure drops $>3\text{ hPa / 3h}$ or convective storm bursts):
$$Z = \frac{x - \mu}{\sigma}$$
- Dispatches proactive notifications when $Z \ge +3.0\sigma$.
- **Code:** [`anomaly_detector.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/anomaly_detector.py)

### 3. DBSCAN Spatial Geo-Clustering
Groups geographic citizen observations using the spherical **Haversine metric**:
$$\text{Haversine Distance: } d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
- **Parameters:** $\epsilon = 5.0\text{ km}$, $\text{min\_samples} = 3$.
- Filters spam, verifies localized cloudbursts, and awards gamified trust points.
- **Code:** [`crowd_ml_service.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/crowd_ml_service.py)

### 4. Time-Series NWP Bias Correction Model
Adjusts official 25km coarse numerical weather prediction rainfall grids using verified ground truth signals:
$$\text{Rain}_{\text{corrected}}(t) = \alpha \cdot \text{NWP}_{\text{grid}}(t) + (1 - \alpha) \cdot \overline{\text{Crowd}}_{\text{cluster}}(t)$$
- **Code:** [`crowd_ml_service.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/crowd_ml_service.py)

### 5. FAO-56 Penman-Monteith Evapotranspiration
Calculates exact crop water requirements ($ET_0$ in mm/day):
$$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T + 273} u_2 (e_s - e_a)}{\Delta + \gamma(1 + 0.34 u_2)}$$
- **Code:** [`sih_climate_resilience_engine.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/sih_climate_resilience_engine.py)

### 6. Delta-T Agricultural Spraying Index
Computes wet-bulb depression to prevent chemical drift or droplet evaporation:
$$\Delta T = T_{\text{dry}} - T_{\text{wet}}$$
- **Safety Window:** $2^\circ\text{C} \le \Delta T \le 8^\circ\text{C}$ is Safe.
- **Code:** [`sih_climate_resilience_engine.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/sih_climate_resilience_engine.py)

### 7. Aviation Runway Crosswind Resolver
Decomposes wind vectors against runway headings:
$$V_{\text{cross}} = V_{\text{wind}} \cdot \sin(\theta_{\text{wind}} - \theta_{\text{runway}}), \quad V_{\text{head}} = V_{\text{wind}} \cdot \cos(\theta_{\text{wind}} - \theta_{\text{runway}})$$
- **Code:** [`aviation_met_engine.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/aviation_met_engine.py)

### 8. Sub-5ms Offline TF-IDF Intent Classifier
Lightweight scikit-learn NLU pipeline running on the local device/server without external API tokens during poor network connectivity.
- **Code:** [`offline_classifier.py`](file:///c:/Users/91997/OneDrive/Desktop/workspace/backend/app/services/offline_classifier.py)

---

## 🗄️ 5. Database Entity-Relationship (ER) Schema

```mermaid
erDiagram
    USER_PROFILES ||--o{ SAVED_LOCATIONS : "saves (1:N)"
    USER_PROFILES ||--o{ CROWD_REPORTS : "submits (1:N)"
    USER_PROFILES ||--o{ WEATHER_ALERTS : "receives (1:N)"
    USER_PROFILES ||--|| COMMUNITY_LEADERBOARD : "ranks_as (1:1)"

    USER_PROFILES {
        uuid id PK
        text clerk_user_id UK "Unique Clerk User ID"
        text email
        text full_name
        text role "citizen | farmer | pilot | disaster_manager"
        text occupation
        text crop_stage
        text language_preference "en | hi | mr"
        integer trust_score "Default: 100"
        timestamptz created_at
        timestamptz updated_at
    }

    SAVED_LOCATIONS {
        uuid id PK
        text clerk_user_id FK "References USER_PROFILES"
        text name "e.g. Pune Hadapsar Farm"
        double_precision latitude
        double_precision longitude
        text location_type "farm | airport | home | hazard_zone"
        text crop_stage
        timestamptz created_at
    }

    WEATHER_ALERTS {
        uuid id PK
        text clerk_user_id FK "Nullable (User or Public Broadcast)"
        text severity "info | advisory | warning | severe | extreme"
        text alert_type "flash_flood | convective_wind | anomaly"
        text title
        text description
        text location_name
        double_precision latitude
        double_precision longitude
        double_precision z_score "Statistical Sigma Value"
        boolean is_proactive
        boolean is_read
        text recommended_action
        timestamptz created_at
    }

    CROWD_REPORTS {
        uuid id PK
        text clerk_user_id FK "References USER_PROFILES"
        double_precision latitude
        double_precision longitude
        text location_name
        text observed_condition "clear | cloudy | rainy | stormy | hail"
        text intensity "light | moderate | heavy | severe"
        text image_url
        text vision_predicted_label "Hugging Face ViT Output"
        double_precision vision_confidence
        boolean is_verified "DBSCAN Cluster Verified"
        integer cluster_id "DBSCAN Cluster ID"
        integer upvotes
        timestamptz created_at
    }

    COMMUNITY_LEADERBOARD {
        uuid id PK
        text clerk_user_id UK,FK "References USER_PROFILES"
        text reporter_name
        integer trust_score
        integer reports_submitted
        integer reports_verified
        text badge "Field Observer | Disaster Sentinel"
        timestamptz updated_at
    }

    WEATHER_CACHE {
        uuid id PK
        text location_key UK "Lat_Lon Composite Hash"
        text location_name
        double_precision temperature
        double_precision feels_like
        integer humidity
        double_precision wind_speed
        double_precision precipitation_prob
        text condition
        integer air_quality_index
        text source "open-meteo | owm | weather-api"
        jsonb raw_payload "Multi-Model Forecast JSON"
        timestamptz cached_at
        timestamptz expires_at
    }
```

---

## ⚡ 6. Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10 or v3.11)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/chaitanyaphatak/skysense-ai.git
cd skysense-ai
```

### 2. Configure Environment Variables
Copy the template and fill in your keys in the root `.env` file:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 4. Run Full-Stack Development Server
```bash
# Starts both Backend (Port 8000) and Frontend (Port 5173) concurrently
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend Swagger Docs:** `http://127.0.0.1:8000/docs`

---

## 🌐 7. Live Production Links

| Service | Host | Live URL |
|---|---|---|
| **Frontend Web App** | **Vercel Global Edge** | [https://jatayu-ebon.vercel.app/](https://jatayu-ebon.vercel.app/) |
| **Backend REST API** | **Render Cloud (Singapore)** | [https://jatayu-backend-kf1f.onrender.com](https://jatayu-backend-kf1f.onrender.com) |
| **Interactive API Docs** | **Swagger UI** | [https://jatayu-backend-kf1f.onrender.com/docs](https://jatayu-backend-kf1f.onrender.com/docs) |
| **System Health Check** | **Render Web Service** | [https://jatayu-backend-kf1f.onrender.com/api/v1/health](https://jatayu-backend-kf1f.onrender.com/api/v1/health) |
| **Keepalive Ping** | **Render Web Service** | [https://jatayu-backend-kf1f.onrender.com/api/v1/ping](https://jatayu-backend-kf1f.onrender.com/api/v1/ping) |

---

## 🔄 8. Backend Keepalive (Render Free Tier)

Render's free tier suspends web services after **15 minutes of inactivity**. To prevent cold starts in production, two free external monitoring services continuously ping the `/api/v1/ping` endpoint every 5–10 minutes:

| Service | Interval | Purpose | Link |
|---|---|---|---|
| **UptimeRobot** | Every **5 min** | Primary keepalive + uptime monitoring + downtime alerts | [uptimerobot.com](https://uptimerobot.com) |
| **cron-job.org** | Every **10 min** | Secondary backup pinger (redundancy) | [cron-job.org](https://cron-job.org) |

### Ping Endpoint
```
GET /api/v1/ping  →  {"pong": true}
```
This endpoint performs **zero database or config calls** — it is the lightest possible response, purpose-built for keepalive monitoring.

### Setup (if re-deploying)
1. **UptimeRobot** → Add HTTP monitor → URL: `https://jatayu-backend-kf1f.onrender.com/api/v1/ping` → Interval: 5 min
2. **cron-job.org** → Create cronjob → Same URL → Schedule: `*/10 * * * *`

> **Note:** Both services are on free plans. Combined they ensure the backend stays warm 24/7 at ₹0 cost.

---

## 👨‍💻 9. Author & Lead Architect

Developed and Architected with ❤️ by:

**Chaitanya Phatak**  
*Full-Stack & Machine Learning Engineer*  
GitHub: [@chaitanyaphatak](https://github.com/chaitanyaphatak)

---

<p align="center">
  <sub>Built for Smart India Hackathon & Advanced Climate Intelligence. © 2026 Jatayu Intelligence. All rights reserved.</sub>
</p>
