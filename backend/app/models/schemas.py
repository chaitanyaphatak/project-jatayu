from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class UserProfile(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: str = "citizen"  # citizen, farmer, pilot, disaster_manager
    occupation: Optional[str] = None
    crop_stage: Optional[str] = None
    saved_locations: List[Dict[str, Any]] = []

class WeatherQuery(BaseModel):
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    language: str = "en"  # en, hi, mr, hinglish
    include_explanation: bool = True

class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    precipitation_prob: float
    condition: str
    air_quality_index: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Explainable forecast elements
    confidence_score: float = 0.85
    contributing_factors: List[str] = []
    model_agreement: str = "High"
    activity_impact: Optional[Dict[str, Any]] = None

class CrowdReportCreate(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    condition: str  # clear, cloudy, rainy, stormy
    intensity: Optional[str] = "moderate"  # light, moderate, heavy, extreme
    image_url: Optional[str] = None
    notes: Optional[str] = None

class AnomalyAlert(BaseModel):
    id: str
    severity: str  # low, moderate, severe, extreme
    alert_type: str
    title: str
    description: str
    location: str
    affected_radius_km: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    recommended_action: str
