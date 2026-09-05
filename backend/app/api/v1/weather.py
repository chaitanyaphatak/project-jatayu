from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import uuid
from app.services.weather_service import WeatherService
from app.services.supabase_service import SupabaseService
from app.core.security import verify_clerk_token

router = APIRouter()

class SavedLocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    location_type: str = "farm"  # farm, airport, home, office, hazard_zone
    crop_stage: Optional[str] = None

class SavedLocationResponse(SavedLocationCreate):
    id: str
    clerk_user_id: str
    created_at: str

@router.get("/current")
async def get_current_weather(
    lat: float = Query(18.5204, description="Latitude"),
    lon: float = Query(73.8567, description="Longitude"),
    location_name: Optional[str] = Query("Haveli, Pune", description="Optional location label")
):
    """
    Ingests live meteorological data from Open-Meteo, WeatherAPI, and OpenWeatherMap.
    """
    data = await WeatherService.get_current_weather(lat, lon, location_name)
    return data

@router.get("/forecast")
async def get_weather_forecast(
    lat: float = Query(18.5204, description="Latitude"),
    lon: float = Query(73.8567, description="Longitude"),
    location_name: Optional[str] = Query("Haveli, Pune", description="Optional location label")
):
    """
    Provides 7-day multi-day daily and 24-hour hourly meteorological progression.
    """
    data = await WeatherService.get_detailed_forecast(lat, lon, location_name)
    return data

@router.get("/wind-grid")
async def get_wind_grid():
    """
    Provides cached GFS 10m u/v vector wind grid for Leaflet-Velocity animated streamlines.
    """
    data = await WeatherService.get_wind_grid()
    return data


@router.get("/saved-locations", response_model=List[Dict[str, Any]])
async def get_user_saved_locations(user_data: Dict[str, Any] = Depends(verify_clerk_token)):
    """
    Retrieves saved locations scoped exclusively to the authenticated Clerk user_id from Supabase.
    """
    user_id = user_data["user_id"]
    locs = await SupabaseService.get_saved_locations(user_id)
    if not locs:
        # Default farm plot if none saved
        default_loc = {
            "id": str(uuid.uuid4()),
            "clerk_user_id": user_id,
            "name": "Haveli Field Plot A",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "location_type": "farm",
            "crop_stage": "Soybean (Flowering)",
            "created_at": "2026-09-05T12:00:00Z"
        }
        await SupabaseService.add_saved_location(default_loc)
        return [default_loc]
    return locs

@router.post("/saved-locations", response_model=Dict[str, Any])
async def add_user_saved_location(
    payload: SavedLocationCreate,
    user_data: Dict[str, Any] = Depends(verify_clerk_token)
):
    """
    Saves a new location strictly tied to the verified Clerk user_id in Supabase.
    """
    user_id = user_data["user_id"]
    new_loc = {
        "clerk_user_id": user_id,
        "name": payload.name,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "location_type": payload.location_type,
        "crop_stage": payload.crop_stage
    }
    db_res = await SupabaseService.add_saved_location(new_loc)
    return db_res or new_loc
