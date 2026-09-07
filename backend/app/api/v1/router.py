from fastapi import APIRouter
from app.api.v1 import health, auth, weather, chat, alerts, crowd, voice, agro_precision, disaster_risk, aviation_met, spray_safety

api_router = APIRouter()
api_router.include_router(health.router, tags=["System"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profiles"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather Ingestion & Locations"])
api_router.include_router(chat.router, prefix="/chat", tags=["Conversational LLM Engine"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Anomaly Detection & Proactive Alerts"])
api_router.include_router(crowd.router, prefix="/crowd", tags=["Crowd Ground Truth & ML Nowcasting"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice & Offline Resilient NLU"])
# SIH 2024 Advanced Modules
api_router.include_router(agro_precision.router, prefix="/agro", tags=["SIH — Precision Agro-Met (FAO-56, Delta-T, WBGT, Fungal)"])
api_router.include_router(spray_safety.router, prefix="/agro", tags=["SIH — GO/NO-GO Spray Safety Engine"])
api_router.include_router(disaster_risk.router, prefix="/disaster", tags=["SIH — Multi-Hazard Composite Index (NDMA)"])
api_router.include_router(aviation_met.router, prefix="/aviation", tags=["SIH — Aviation Met (ICAO ATIS, Crosswind, CAT)"])
