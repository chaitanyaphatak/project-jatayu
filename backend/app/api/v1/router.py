from fastapi import APIRouter
from app.api.v1 import health, auth, weather, chat, alerts, crowd, voice

api_router = APIRouter()
api_router.include_router(health.router, tags=["System"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profiles"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather Ingestion & Locations"])
api_router.include_router(chat.router, prefix="/chat", tags=["Conversational LLM Engine"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Anomaly Detection & Proactive Alerts"])
api_router.include_router(crowd.router, prefix="/crowd", tags=["Crowd Ground Truth & ML Nowcasting"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice & Offline Resilient NLU"])
