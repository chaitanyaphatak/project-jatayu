from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from app.services.crowd_ml_service import CrowdMLService
from app.services.weather_service import WeatherService
from app.services.supabase_service import SupabaseService
from app.core.security import verify_clerk_token

router = APIRouter()

class CrowdReportInput(BaseModel):
    latitude: float
    longitude: float
    location_name: str
    observed_condition: str  # clear, cloudy, rainy, stormy, hail
    intensity: str = "moderate"
    image_data_or_url: Optional[str] = None
    notes: Optional[str] = None

@router.post("/report")
async def submit_crowd_report(
    payload: CrowdReportInput,
    user_data: Dict[str, Any] = Depends(verify_clerk_token)
):
    """
    Submits a ground truth report, runs Vision verification and DBSCAN,
    and persists directly to Supabase public.crowd_reports.
    """
    user_id = user_data["user_id"]
    reporter_name = user_data.get("claims", {}).get("name", "Local Observer")

    # 1. Vision classification if image provided
    vision_result = {"predicted_label": payload.observed_condition, "confidence": 0.92, "model": "Self-Reported"}
    if payload.image_data_or_url:
        vision_result = await CrowdMLService.verify_sky_photo(payload.image_data_or_url)

    new_report = {
        "clerk_user_id": user_id,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "location_name": payload.location_name,
        "observed_condition": payload.observed_condition,
        "intensity": payload.intensity,
        "image_url": payload.image_data_or_url,
        "vision_predicted_label": vision_result["predicted_label"],
        "vision_confidence": vision_result["confidence"],
        "is_verified": False,
        "cluster_id": -1,
        "upvotes": 1
    }

    # Persist to live Supabase
    db_res = await SupabaseService.insert_crowd_report(new_report)
    saved_report = db_res or new_report
    saved_report["reporter_name"] = reporter_name

    # Fetch all reports to re-run DBSCAN clustering
    all_reports = await SupabaseService.get_crowd_reports()
    CrowdMLService.run_dbscan_clustering(all_reports)

    return {
        "status": "success",
        "report": saved_report,
        "vision_verification": vision_result,
        "trust_points_awarded": 15
    }

@router.get("/reports")
async def get_crowd_reports():
    """
    Returns active ground truth reports from Supabase clustered by DBSCAN.
    """
    reports = await SupabaseService.get_crowd_reports()
    for r in reports:
        if "reporter_name" not in r:
            r["reporter_name"] = "Verified Local Reporter"
    clustered = CrowdMLService.run_dbscan_clustering(reports)
    return clustered

@router.get("/nowcast-correction")
async def get_hyperlocal_nowcast_correction(
    lat: float = Query(18.5204),
    lon: float = Query(73.8567)
):
    """
    Blends official NWP forecast with local crowd reports from Supabase.
    """
    official = await WeatherService.get_current_weather(lat, lon)
    reports = await SupabaseService.get_crowd_reports()
    correction = CrowdMLService.apply_timeseries_correction(official, reports)
    
    return {
        "location": official["location"],
        "official_forecast": {
            "rain_prob": official["precipitation_prob"],
            "temperature": official["temperature"],
            "condition": official["condition"]
        },
        "ml_corrected_nowcast": {
            "rain_prob": correction["corrected_rain_prob"],
            "temperature": correction["corrected_temp"],
            "ground_weight_alpha": correction["ground_truth_weight_alpha"],
            "verified_peer_reports": correction.get("verified_peer_reports", 0)
        },
        "explanation": correction["explanation"]
    }

@router.get("/leaderboard")
async def get_community_leaderboard():
    """
    Returns verified ground reporters leaderboard directly from Supabase.
    """
    return await SupabaseService.get_leaderboard()
