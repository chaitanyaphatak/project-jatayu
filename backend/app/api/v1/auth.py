from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.core.security import verify_clerk_token
from app.services.supabase_service import SupabaseService

router = APIRouter()

_user_profiles_cache: Dict[str, Dict[str, Any]] = {}

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = "citizen"  # citizen, farmer, pilot, disaster_manager
    occupation: Optional[str] = None
    crop_stage: Optional[str] = None
    language_preference: Optional[str] = "en"

class UserProfileResponse(BaseModel):
    clerk_user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: str = "citizen"
    occupation: Optional[str] = None
    crop_stage: Optional[str] = None
    language_preference: str = "en"
    trust_score: int = 100
    saved_locations: List[Dict[str, Any]] = []

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(user_data: Dict[str, Any] = Depends(verify_clerk_token)):
    user_id = user_data["user_id"]
    
    # 1. Check live Supabase
    db_profile = await SupabaseService.get_user_profile(user_id)
    if db_profile:
        saved_locs = await SupabaseService.get_saved_locations(user_id)
        db_profile["saved_locations"] = saved_locs
        return db_profile

    # 2. Check local memory
    if user_id in _user_profiles_cache:
        return _user_profiles_cache[user_id]

    # 3. Auto-provision new profile
    new_profile = {
        "clerk_user_id": user_id,
        "email": user_data.get("email"),
        "full_name": user_data.get("claims", {}).get("name", "Field Officer"),
        "role": "farmer",
        "occupation": "Soybean & Cotton Cultivator",
        "crop_stage": "Flowering & Pod Formation",
        "language_preference": "en",
        "trust_score": 100
    }
    
    # Save to live Supabase
    await SupabaseService.upsert_user_profile(new_profile)
    new_profile["saved_locations"] = []
    _user_profiles_cache[user_id] = new_profile
    return new_profile

@router.post("/sync", response_model=UserProfileResponse)
async def sync_clerk_user(payload: ProfileUpdateRequest, user_data: Dict[str, Any] = Depends(verify_clerk_token)):
    user_id = user_data["user_id"]
    
    profile_payload = {
        "clerk_user_id": user_id,
        "email": user_data.get("email"),
        "full_name": payload.full_name or "WeatherGPT User",
        "role": payload.role or "citizen",
        "occupation": payload.occupation,
        "crop_stage": payload.crop_stage,
        "language_preference": payload.language_preference or "en"
    }

    # Upsert to live Supabase
    db_res = await SupabaseService.upsert_user_profile(profile_payload)
    saved_locs = await SupabaseService.get_saved_locations(user_id)
    
    result = db_res or profile_payload
    result["saved_locations"] = saved_locs
    result["trust_score"] = result.get("trust_score", 100)
    _user_profiles_cache[user_id] = result
    return result
