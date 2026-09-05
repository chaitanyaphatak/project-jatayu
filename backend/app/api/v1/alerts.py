from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.services.weather_service import WeatherService
from app.services.anomaly_detector import anomaly_engine
from app.services.activity_scorer import ActivityImpactScorer
from app.core.security import verify_clerk_token

router = APIRouter()

# In-memory alerts registry (synced with Supabase public.weather_alerts)
_alerts_registry: List[Dict[str, Any]] = []

class AnomalyEvaluationResponse(BaseModel):
    is_anomaly: bool
    max_z_score: float
    severity: str
    severity_label: str
    activity_impact: Dict[str, Any]
    telemetry_snapshot: Dict[str, Any]
    proactive_message: str

@router.get("", response_model=List[Dict[str, Any]])
async def get_active_alerts(
    lat: float = Query(18.5204),
    lon: float = Query(73.8567),
    role: str = Query("farmer"),
    crop_stage: Optional[str] = Query("Soybean")
):
    """
    Returns active proactive alerts for the given coordinate, evaluated by Isolation Forest and Z-Score engine.
    """
    weather = await WeatherService.get_current_weather(lat, lon)
    anomaly_result = anomaly_engine.analyze_weather(weather)
    activity_result = ActivityImpactScorer.score_activity(role, weather, crop_stage)

    # Formulate proactive message
    alert_item = {
        "id": str(uuid.uuid4()),
        "severity": anomaly_result["severity"],
        "severity_label": anomaly_result["severity_label"],
        "alert_type": "hybrid_isolation_forest",
        "title": f"{activity_result['activity']}: {activity_result['verdict']}",
        "description": f"{activity_result['reason']} (Z-Score: +{anomaly_result['max_z_score']}σ)",
        "location_name": weather["location"],
        "latitude": lat,
        "longitude": lon,
        "z_score": anomaly_result["max_z_score"],
        "isolation_score": anomaly_result["isolation_forest_score"],
        "recommended_action": activity_result["action"],
        "is_proactive": activity_result["proactive_push"],
        "created_at": datetime.utcnow().isoformat()
    }
    return [alert_item]

@router.post("/evaluate", response_model=AnomalyEvaluationResponse)
async def evaluate_proactive_alert(
    lat: float = 18.5204,
    lon: float = 73.8567,
    role: str = "farmer",
    crop_stage: Optional[str] = "Soybean"
):
    """
    Live proactive agent evaluation endpoint.
    """
    weather = await WeatherService.get_current_weather(lat, lon)
    anomaly_result = anomaly_engine.analyze_weather(weather)
    activity_result = ActivityImpactScorer.score_activity(role, weather, crop_stage)

    msg = (
        f"🚨 Proactive Notice for {role.upper()}: {activity_result['action']} "
        f"Anomaly detected at +{anomaly_result['max_z_score']}σ above seasonal baseline."
    )

    return {
        "is_anomaly": anomaly_result["is_anomaly"],
        "max_z_score": anomaly_result["max_z_score"],
        "severity": anomaly_result["severity"],
        "severity_label": anomaly_result["severity_label"],
        "activity_impact": activity_result,
        "telemetry_snapshot": weather,
        "proactive_message": msg
    }
