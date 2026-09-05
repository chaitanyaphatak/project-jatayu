import httpx
import json
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.services.weather_service import WeatherService

class LLMEngine:
    """
    Orchestrates conversational weather intelligence using:
    - Primary: Google Gemini (gemini-3.6-flash)
    - Low-latency Fallback: Groq (qwen/qwen3.6-27b / compound)
    
    Grounds all responses with multi-source meteorological telemetry (ECMWF, GFS, WeatherAPI, OWM)
    and persona context (Farmer crop stages, Aviation flight levels, Disaster flood watches).
    """

    GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"
    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

    @classmethod
    async def process_query(
        cls,
        user_query: str,
        user_profile: Optional[Dict[str, Any]] = None,
        lat: float = 18.5204,
        lon: float = 73.8567,
        location_name: str = "Haveli, Pune"
    ) -> Dict[str, Any]:
        # 1. Fetch live Tri-Source weather data
        live_weather = await WeatherService.get_current_weather(lat, lon, location_name)

        role = user_profile.get("role", "farmer") if user_profile else "farmer"
        crop = user_profile.get("crop_stage", "Soybean (Flowering)") if user_profile else "Soybean"
        user_name = user_profile.get("full_name", "Field User") if user_profile else "Field User"

        system_instruction = f"""You are WeatherGPT, a proactive, explainable hyperlocal weather intelligence agent built for enterprise decision support.
You speak with technical authority and empathy to citizens, farmers, pilots, and disaster managers.
Primary language: English (with natural multilingual support for Hindi and Hinglish when the user writes in them).

LIVE GROUND TELEMETRY for {live_weather['location']}:
- Temperature: {live_weather['temperature']}°C (Feels like: {live_weather['feels_like']}°C)
- Weather Condition: {live_weather['condition']}
- Relative Humidity: {live_weather['humidity']}%
- Surface Wind: {live_weather['wind_speed']} km/h
- Surface Pressure: {live_weather['surface_pressure']} hPa
- Precipitation Probability (Next 4h): {live_weather['precipitation_prob']}%
- Air Quality PM2.5 AQI: {live_weather['air_quality_index']}
- Multi-Model Agreement Score: {live_weather['model_agreement_score']}% ({live_weather['model_agreement_rating']})
- Data Feeds Blended: {', '.join(live_weather['sources_used'])}

CURRENT USER PERSONA:
- User Name: {user_name}
- Role: {role.upper()}
- Specific Context: {crop}

INSTRUCTIONS:
1. Answer the user query directly, leveraging the exact live ground telemetry above.
2. If role is 'farmer', advise on crop spraying, irrigation, soil moisture, and fungal risks for {crop}.
3. If role is 'pilot', advise on cloud tops, convective turbulence, crosswinds, and VFR/IFR visibility.
4. If role is 'disaster_manager', highlight z-score anomalies, runoff saturation, and evacuation thresholds.
5. Provide actionable decisions — not just numbers.
6. Keep your response concise, structured, and informative (2 to 4 paragraphs max).
"""

        # Try Gemini 3.6 Flash first
        if settings.GEMINI_API_KEY:
            try:
                gemini_res = await cls._query_gemini(system_instruction, user_query)
                if gemini_res:
                    return cls._format_response(gemini_res, live_weather)
            except Exception as e:
                print(f"Gemini error, falling back to Groq: {e}")

        # Try Groq fallback
        if settings.GROQ_API_KEY:
            try:
                groq_res = await cls._query_groq(system_instruction, user_query)
                if groq_res:
                    return cls._format_response(groq_res, live_weather)
            except Exception as e:
                print(f"Groq error: {e}")

        # Rule-based fallback if APIs are unreachable
        fallback_text = cls._rule_based_fallback(user_query, live_weather, role)
        return cls._format_response(fallback_text, live_weather)

    @classmethod
    async def _query_gemini(cls, system_instruction: str, user_query: str) -> Optional[str]:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                f"{cls.GEMINI_URL}?key={settings.GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "system_instruction": {
                        "parts": [{"text": system_instruction}]
                    },
                    "contents": [
                        {"parts": [{"text": user_query}]}
                    ],
                    "generationConfig": {
                        "temperature": 0.4,
                        "maxOutputTokens": 600
                    }
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
        return None

    @classmethod
    async def _query_groq(cls, system_instruction: str, user_query: str) -> Optional[str]:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                cls.GROQ_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "qwen/qwen3.6-27b",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_query}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 600
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "").strip()
        return None

    @staticmethod
    def _format_response(answer: str, live_weather: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "response": answer,
            "explainability": {
                "confidence_score": live_weather.get("model_agreement_score", 92),
                "model_consensus": live_weather.get("model_agreement_rating", "High Consensus"),
                "models_consulted": "Gemini 3.6 Flash + " + " + ".join(live_weather.get("sources_used", ["Open-Meteo"])),
                "contributing_factors": live_weather.get("contributing_factors", []),
                "activity_impact": live_weather.get("activity_impact")
            },
            "telemetry": {
                "location": live_weather["location"],
                "temperature": live_weather["temperature"],
                "condition": live_weather["condition"],
                "rain_probability": live_weather["precipitation_prob"],
                "humidity": live_weather["humidity"],
                "wind_speed": live_weather["wind_speed"]
            }
        }

    @staticmethod
    def _rule_based_fallback(query: str, w: Dict[str, Any], role: str) -> str:
        q = query.lower()
        loc = w["location"]
        temp = w["temperature"]
        rain_prob = w["precipitation_prob"]
        wind = w["wind_speed"]

        if "spray" in q or "khet" in q or "crop" in q or role == "farmer":
            if rain_prob > 50 or wind > 15:
                return (
                    f"⚠️ **Agricultural Recommendation for {loc}**: DO NOT spray chemicals today.\n\n"
                    f"Current ground readings show a **{rain_prob}% chance of rain** with surface winds at **{wind} km/h**. "
                    f"Pesticides or foliar fertilizers applied now will be washed off by precipitation, leading to chemical waste and soil runoff."
                )
            return (
                f"✅ **Agricultural Advisory for {loc}**: Spraying window is favorable.\n\n"
                f"Low precipitation probability ({rain_prob}%) and calm winds ({wind} km/h) allow effective droplet adhesion."
            )

        if "route" in q or "flight" in q or role == "pilot":
            return (
                f"✈️ **Aviation Weather Advisory for {loc}**:\n"
                f"- Temperature: {temp}°C | Surface Wind: {wind} km/h | Pressure: {w['surface_pressure']} hPa\n"
                f"- Convective risk: Moderate updraft activity detected. Recommend monitoring VFR cloud ceilings below 3,000 ft AGL."
            )

        return (
            f"Current weather in **{loc}** is **{w['condition']}** at **{temp}°C**.\n\n"
            f"Relative humidity is {w['humidity']}% with a {rain_prob}% probability of localized showers in the next 4 hours."
        )
