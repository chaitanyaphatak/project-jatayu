from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from app.services.llm_engine import LLMEngine
from app.services.supabase_service import SupabaseService
from app.core.security import verify_clerk_token, get_optional_user

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    latitude: Optional[float] = 18.5204
    longitude: Optional[float] = 73.8567
    location_name: Optional[str] = "Haveli, Pune"
    role_override: Optional[str] = None
    crop_stage: Optional[str] = None

class ChatHistoryItem(BaseModel):
    sender: str
    text: str
    explain: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

class ChatHistorySyncRequest(BaseModel):
    messages: List[ChatHistoryItem]
    session_title: Optional[str] = None

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

# In-memory user chat sessions cache
_user_chat_sessions: Dict[str, List[Dict[str, Any]]] = {}

@router.post("/query", response_model=ChatResponse)
async def query_weather_intelligence(
    payload: ChatRequest,
    user_data: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Submits a conversational weather query to Gemini 3.6 Flash / Groq.
    Open to everyone: Anonymous guests receive instant one-off answers;
    Logged-in users get personalized persona grounding & cloud sync.
    """
    profile = {
        "full_name": "Guest Visitor",
        "role": payload.role_override or "farmer",
        "crop_stage": payload.crop_stage or "Soybean (Flowering)"
    }

    if user_data:
        user_id = user_data["user_id"]
        db_profile = await SupabaseService.get_user_profile(user_id)
        if db_profile:
            profile = db_profile
        else:
            profile["full_name"] = user_data.get("claims", {}).get("name", "Jatayu Member")
    
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

@router.get("/history")
async def get_saved_chat_history(
    user_data: Dict[str, Any] = Depends(verify_clerk_token)
):
    """
    PROTECTED: Retrieves saved chat history sessions strictly for the authenticated Clerk user.
    """
    user_id = user_data["user_id"]
    return _user_chat_sessions.get(user_id, [])

@router.post("/history")
async def sync_saved_chat_history(
    payload: ChatHistorySyncRequest,
    user_data: Dict[str, Any] = Depends(verify_clerk_token)
):
    """
    PROTECTED: Syncs and persists chat history for the authenticated Clerk user.
    """
    user_id = user_data["user_id"]
    saved_session = {
        "id": str(uuid.uuid4()),
        "clerk_user_id": user_id,
        "title": payload.session_title or f"Weather Query on {datetime.utcnow().strftime('%b %d, %H:%M')}",
        "messages": [m.dict() for m in payload.messages],
        "updated_at": datetime.utcnow().isoformat()
    }
    if user_id not in _user_chat_sessions:
        _user_chat_sessions[user_id] = []
    _user_chat_sessions[user_id].append(saved_session)
    return {"status": "saved", "session_id": saved_session["id"]}

@router.delete("/history")
async def clear_saved_chat_history(
    user_data: Dict[str, Any] = Depends(verify_clerk_token)
):
    """
    PROTECTED: Clears saved chat history for the authenticated Clerk user.
    """
    user_id = user_data["user_id"]
    if user_id in _user_chat_sessions:
        _user_chat_sessions[user_id] = []
    return {"status": "cleared"}
