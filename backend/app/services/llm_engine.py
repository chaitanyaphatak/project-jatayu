import httpx
import json
import re
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.services.weather_service import WeatherService

class LLMEngine:
    """
    Orchestrates conversational weather intelligence using:
    - Primary: Google Gemini (gemini-flash-latest)
    - Low-latency Fallback: Groq (openai/gpt-oss-120b / groq/compound)
    
    Grounds all responses with multi-source meteorological telemetry (ECMWF, GFS, WeatherAPI, OWM)
    and persona context (Farmer crop stages, Aviation flight levels, Disaster flood watches).
    """

    GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

    @staticmethod
    def _clean_llm_output(text: Optional[str]) -> str:
        """
        Strips internal reasoning chains, <think>...</think> blocks, and model thoughts.
        Guarantees that substantive response is never wiped out.
        """
        if not text:
            return ""
        
        cleaned = text.strip()
        
        # 1. If closing tag exists, extract the content after it
        if '</think>' in cleaned:
            parts = cleaned.split('</think>')
            cleaned = parts[-1].strip()
        elif '</thought>' in cleaned:
            parts = cleaned.split('</thought>')
            cleaned = parts[-1].strip()
        elif '</reasoning>' in cleaned:
            parts = cleaned.split('</reasoning>')
            cleaned = parts[-1].strip()
        
        # 2. Strip any leftover open tags
        cleaned = cleaned.replace('<think>', '').replace('</think>', '').replace('<thought>', '').replace('</thought>', '').replace('<reasoning>', '').replace('</reasoning>', '').strip()
        
        # 3. Remove "Here's a thinking process:" preamble
        cleaned = re.sub(r"(?i)^Here's a thinking process:.*?(?=\n\n|\Z)", '', cleaned, flags=re.DOTALL).strip()
        
        return cleaned if cleaned else text.strip()

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

        system_instruction = f"""You are WeatherGPT (Vayu AI), an expert multilingual weather & agriculture AI assistant.
Respond fluently and naturally in the language of the user's prompt (English, Hindi, Marathi, Punjabi, Gujarati, Bengali, Tamil, Telugu, etc.).

LIVE GROUND TELEMETRY for {live_weather['location']}:
- Temperature: {live_weather['temperature']}°C (Feels like: {live_weather['feels_like']}°C)
- Condition: {live_weather['condition']}
- Relative Humidity: {live_weather['humidity']}%
- Wind Speed: {live_weather['wind_speed']} km/h
- Surface Pressure: {live_weather['surface_pressure']} hPa
- Precipitation Probability (Next 4h): {live_weather['precipitation_prob']}%
- PM2.5 Air Quality (AQI): {live_weather['air_quality_index']}
- Multi-Model Agreement Score: {live_weather['model_agreement_score']}% ({live_weather['model_agreement_rating']})

USER CONTEXT:
- Persona: {role.upper()}
- Agricultural Context: {crop}

RULES:
1. Provide a direct, actionable, friendly, and complete advisory based on the live weather data above.
2. If the user asks about crop spraying or farming, evaluate temperature, wind, humidity, and rain probability for {crop}.
3. If the user asks about flight or travel, evaluate convective hazards and visibility.
4. Keep the output clean, structured with bullet points or short paragraphs.
5. NEVER include thinking process, reasoning tags, or <think> tags.
"""

        # 1. Try Gemini
        if settings.GEMINI_API_KEY:
            try:
                gemini_res = await cls._query_gemini(system_instruction, user_query)
                cleaned_res = cls._clean_llm_output(gemini_res)
                if cleaned_res:
                    return cls._format_response(cleaned_res, live_weather)
            except Exception as e:
                print(f"Gemini error, falling back to Groq: {e}")

        # 2. Try Groq
        if settings.GROQ_API_KEY:
            try:
                groq_res = await cls._query_groq(system_instruction, user_query)
                cleaned_res = cls._clean_llm_output(groq_res)
                if cleaned_res:
                    return cls._format_response(cleaned_res, live_weather)
            except Exception as e:
                print(f"Groq error: {e}")

        # 3. Rule-based fallback
        fallback_text = cls._rule_based_fallback(user_query, live_weather, role)
        return cls._format_response(fallback_text, live_weather)

    @classmethod
    async def _query_gemini(cls, system_instruction: str, user_query: str) -> Optional[str]:
        async with httpx.AsyncClient(timeout=14.0) as client:
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
                        "temperature": 0.3,
                        "maxOutputTokens": 800
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
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                cls.GROQ_URL,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-oss-120b",
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_query}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 800
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
                "confidence_score": live_weather.get("model_agreement_score", 94),
                "model_consensus": live_weather.get("model_agreement_rating", "High Consensus"),
                "models_consulted": "Gemini AI + Multi-Source Weather Telemetry (ECMWF, GFS, OWM)",
                "contributing_factors": live_weather.get("contributing_factors", []),
                "activity_impact": live_weather.get("activity_impact")
            },
            "telemetry": {
                "location": live_weather.get("location", "Selected Location"),
                "temperature": live_weather.get("temperature", 26.0),
                "condition": live_weather.get("condition", "Partly Cloudy"),
                "rain_probability": live_weather.get("precipitation_prob", 20),
                "humidity": live_weather.get("humidity", 75),
                "wind_speed": live_weather.get("wind_speed", 10.0)
            }
        }

    @staticmethod
    def _rule_based_fallback(query: str, w: Dict[str, Any], role: str) -> str:
        q = query.lower()
        loc = w.get("location", "Selected Location")
        temp = w.get("temperature", 26.0)
        rain_prob = w.get("precipitation_prob", 20)
        wind = w.get("wind_speed", 10.0)
        humidity = w.get("humidity", 75)
        cond = w.get("condition", "Partly Cloudy")

        is_hindi = any('\u0900' <= char <= '\u097F' for char in query) or "hindi" in q
        is_marathi = "marathi" in q or "पाऊस" in query or "फवारणी" in query

        if is_hindi:
            if "छिड़काव" in query or "कीटनाशक" in query or "स्प्रे" in query or role == "farmer":
                if rain_prob > 40 or wind > 15:
                    return (
                        f"⚠️ **कृषि मौसम सलाह ({loc})**:\n\n"
                        f"आज कीटनाशक या रासायनिक छिड़काव के लिए मौसम **अनुकूल नहीं है**।\n"
                        f"• **बारिश की संभावना**: {rain_prob}%\n"
                        f"• **हवा की गति**: {wind} km/h\n"
                        f"• **आर्द्रता**: {humidity}%\n\n"
                        f"सलाह: बारिश या तेज हवा से दवा धुलने और रासायनिक रिसाव का जोखिम है। मौसम साफ होने की प्रतीक्षा करें।"
                    )
                return (
                    f"✅ **कृषि मौसम सलाह ({loc})**:\n\n"
                    f"आज कीटनाशक छिड़काव के लिए मौसम **अनुकूल है**।\n"
                    f"• **तापमान**: {temp}°C | **हवा की गति**: {wind} km/h (शांत)\n"
                    f"• **बारिश की संभावना**: {rain_prob}% (न्यूनतम)\n"
                    f"• **आर्द्रता**: {humidity}%\n\n"
                    f"सलाह: सुबह 7:00 से 10:00 बजे या शाम 4:30 के बाद छिड़काव करना सर्वोत्तम रहेगा।"
                )
            return (
                f"🌤️ **{loc} के लिए लाइव मौसम अपडेट**:\n\n"
                f"• **स्थिति**: {cond}\n"
                f"• **तापमान**: {temp}°C (आर्द्रता: {humidity}%)\n"
                f"• **हवा**: {wind} km/h | **बारिश की संभावना**: {rain_prob}%\n\n"
                f"दिन के समय बाहरी गतिविधियों और खेती के कार्यों के लिए मौसम सामान्य बना रहेगा।"
            )

        if is_marathi:
            return (
                f"🌤️ **{loc} साठी हवामान सल्ला**:\n\n"
                f"• **सध्याचे तापमान**: {temp}°C\n"
                f"• **हवामानाची स्थिती**: {cond}\n"
                f"• **आर्द्रता**: {humidity}% | **वाऱ्याचा वेग**: {wind} km/h\n"
                f"• **पावसाची शक्यता**: {rain_prob}%\n\n"
                f"सध्या शेतीविषयक कामे आणि नियोजनासाठी हवामान अनुकूल आहे."
            )

        return (
            f"🌤️ **Live Weather & Advisory for {loc}**:\n\n"
            f"• **Current Condition**: {cond}\n"
            f"• **Temperature**: {temp}°C | **Relative Humidity**: {humidity}%\n"
            f"• **Surface Wind**: {wind} km/h | **Precipitation Chance**: {rain_prob}%\n\n"
            f"Weather conditions are stable for scheduled operations and agricultural activities today."
        )

