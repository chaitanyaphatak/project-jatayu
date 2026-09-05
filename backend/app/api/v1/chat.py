from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.services.llm_engine import LLMEngine
from app.services.supabase_service import SupabaseService
from app.core.security import verify_clerk_token

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    latitude: Optional[float] = 18.5204
    longitude: Optional[float] = 73.8567
    location_name: Optional[str] = "Haveli, Pune"
    role_override: Optional[str] = None
    crop_stage: Optional[str] = None

class ExplainabilityResponse(BaseModel):
    confidence_score: float
    model_consensus: str
    models_consulted: str
    contributing_factors: List[str]
    activity_impact: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    explainability: ExplainabilityResponse
    telemetry: Dict[str, Any]

@router.post("/query", response_model=ChatResponse)
async def query_weather_intelligence(
    payload: ChatRequest,
    user_data: Dict[str, Any] = Depends(verify_clerk_token)
):
    """
    Submits a conversational weather query to Gemini 3.6 Flash / Groq.
    Grounded with real-time Tri-Source meteorological telemetry and scoped to user role.
    """
    user_id = user_data["user_id"]
    profile = await SupabaseService.get_user_profile(user_id)
    if not profile:
        profile = {
            "full_name": user_data.get("claims", {}).get("name", "Field Officer"),
            "role": payload.role_override or "farmer",
            "crop_stage": payload.crop_stage or "Soybean (Flowering)"
        }
    
    # Allow request override if user switched persona tab in frontend
    if payload.role_override:
        profile["role"] = payload.role_override
    if payload.crop_stage:
        profile["crop_stage"] = payload.crop_stage

    result = await LLMEngine.process_query(
        user_query=payload.query,
        user_profile=profile,
        lat=payload.latitude or 18.5204,
        lon=payload.longitude or 73.8567,
        location_name=payload.location_name or "Haveli, Pune"
    )

    return result
