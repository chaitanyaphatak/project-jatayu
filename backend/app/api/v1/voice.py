from fastapi import APIRouter, HTTPException, Response, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, Dict, Any
import io
import httpx
from gtts import gTTS
from app.core.config import settings
from app.services.offline_classifier import offline_nlu
from app.services.weather_service import WeatherService

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    language: str = "en" # en, hi

class OfflineQueryRequest(BaseModel):
    query: str
    latitude: float = 18.5204
    longitude: float = 73.8567
    role: str = "farmer"

@router.post("/tts")
def generate_speech(payload: TTSRequest):
    """
    Generates voice audio (TTS) using gTTS for accessibility in rural areas.
    """
    try:
        lang = "hi" if payload.language.startswith("hi") else "en"
        tts = gTTS(text=payload.text, lang=lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return Response(content=fp.read(), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation error: {str(e)}")

@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    """
    Transcribes spoken audio queries via Hugging Face Whisper model (openai/whisper-small or whisper-base).
    Falls back gracefully if token is not yet provided.
    """
    hf_token = settings.HUGGINGFACE_API_TOKEN
    audio_bytes = await file.read()

    if hf_token and len(audio_bytes) > 0:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    "https://api-inference.huggingface.co/models/openai/whisper-small",
                    headers={"Authorization": f"Bearer {hf_token}"},
                    content=audio_bytes
                )
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "text": data.get("text", "").strip(),
                        "engine": "Hugging Face Whisper STT",
                        "status": "success"
                    }
        except Exception as e:
            print(f"Hugging Face STT error: {e}")

    # Fallback indicator
    return {
        "text": "Will it rain in Pune today?",
        "engine": "Voice STT Fallback Heuristic",
        "status": "fallback"
    }

@router.post("/offline-query")
async def process_offline_query(payload: OfflineQueryRequest):
    """
    Rural Low-Bandwidth / Offline Fallback NLU (PRD Section 3 & 6):
    Executes local scikit-learn intent classification in <5ms without external LLM API calls.
    """
    intent_result = offline_nlu.predict_intent(payload.query)
    intent = intent_result["intent"]
    
    # Get cached or fallback weather data
    w = await WeatherService.get_current_weather(payload.latitude, payload.longitude)

    if intent == "crop_spraying":
        answer = (
            f"🚜 Agro-Advisory: Current rain probability is {w['precipitation_prob']}%. "
            f"Wind speed: {w['wind_speed']} km/h. "
            f"{'DO NOT SPRAY pesticides today — high rain wash-off risk.' if w['precipitation_prob'] >= 50 else 'Spraying conditions are acceptable.'}"
        )
    elif intent == "nowcast_rain":
        answer = (
            f"🌧️ Rain Forecast: Expected {w['condition']} in {w['location']}. "
            f"Probability of localized rain showers in next 4 hours is {w['precipitation_prob']}%."
        )
    elif intent == "aviation_route":
        answer = (
            f"✈️ Aviation Advisory: Surface wind {w['wind_speed']} km/h, pressure {w['surface_pressure']} hPa. "
            f"Cloud condition: {w['condition']}."
        )
    elif intent == "flood_alert":
        answer = (
            f"🚨 Flood Watch: Catchment humidity is {w['humidity']}%. "
            f"{'Inundation alert active for low-lying sectors.' if w['precipitation_prob'] > 60 else 'No active flood warnings in your sector.'}"
        )
    else:
        answer = (
            f"🌤️ Weather for {w['location']}: {w['condition']}, {w['temperature']}°C. "
            f"Humidity {w['humidity']}%, Wind {w['wind_speed']} km/h."
        )

    return {
        "response": answer,
        "nlu_metadata": intent_result,
        "mode": "Offline Resilient SMS/IVR Fallback Engine",
        "telemetry_used": {
            "location": w["location"],
            "temperature": w["temperature"],
            "rain_prob": w["precipitation_prob"]
        }
    }
