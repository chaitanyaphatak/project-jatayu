from typing import Dict, Any, Optional

class ActivityImpactScorer:
    """
    ML Scoring Model for Activity Impact (PRD Section 3):
    Combines forecast values + confidence + activity thresholds into one actionable verdict.
    Differentiator #1: Proactive Agent Mode — triggers intelligent advisories tailored to profile.
    """

    @classmethod
    def score_activity(
        cls, 
        role: str, 
        weather_telemetry: Dict[str, Any], 
        crop_stage: Optional[str] = "Soybean"
    ) -> Dict[str, Any]:
        rain_prob = weather_telemetry.get("precipitation_prob", 40)
        wind = weather_telemetry.get("wind_speed", 12.0)
        humidity = weather_telemetry.get("humidity", 75)
        temp = weather_telemetry.get("temperature", 26.0)

        if role == "farmer":
            # Agrometeorological spraying & harvesting risk
            # Droplet drift occurs above 15 km/h; chemical wash-off occurs if rain > 45% within 4h
            if rain_prob >= 55 or wind >= 18.0:
                verdict = "SUSPEND SPRAYING"
                color = "rose"
                reason = f"{rain_prob}% rain probability and {wind} km/h wind velocity will cause wash-off and spray drift on {crop_stage}."
                action = f"Delay agrochemical application by 24h. Monitor rain nowcast."
            elif rain_prob >= 35:
                verdict = "CAUTION ADVISED"
                color = "amber"
                reason = f"Moderate rain probability ({rain_prob}%). Ensure rapid-absorption surfactant is blended."
                action = f"Complete spraying before late afternoon convective cycle."
            else:
                verdict = "OPTIMAL WINDOW"
                color = "emerald"
                reason = f"Calm surface winds ({wind} km/h) and dry canopy conditions."
                action = f"Favorable for fertilization and pest control."

            return {
                "activity": f"Crop Spraying ({crop_stage})",
                "verdict": verdict,
                "color": color,
                "risk_score": rain_prob,
                "reason": reason,
                "action": action,
                "proactive_push": rain_prob >= 50
            }

        elif role == "pilot":
            # Aviation VFR / IFR crosswind and convective turbulence
            if wind >= 30.0 or rain_prob >= 70:
                verdict = "VFR NO-GO / IFR CAUTION"
                color = "rose"
                reason = f"Severe convective updrafts and surface gusts exceeding 30 km/h."
                action = "File IFR with 15nm weather deviation buffer. Check SIGMETs."
            elif wind >= 18.0:
                verdict = "MODERATE TURBULENCE"
                color = "amber"
                reason = f"Surface wind {wind} km/h with localized shear near terrain boundaries."
                action = "Expect airspeed fluctuations ±10 kts on approach."
            else:
                verdict = "VFR CLEAR"
                color = "emerald"
                reason = "High visibility (>8km) with calm atmospheric boundary layer."
                action = "Routine flight operations permitted."

            return {
                "activity": "Aviation Route Operations",
                "verdict": verdict,
                "color": color,
                "risk_score": int(wind * 2.5),
                "reason": reason,
                "action": action,
                "proactive_push": wind >= 20.0
            }

        elif role == "disaster_manager":
            # Hydrological Inundation & Runoff saturation
            if rain_prob >= 65 and humidity >= 80:
                verdict = "HIGH INUNDATION WATCH"
                color = "rose"
                reason = f"Catchment saturation index 86%. Heavy convective cells projected."
                action = "Alert low-lying culverts and activate tehsil emergency pumps."
            elif rain_prob >= 40:
                verdict = "ALERT PREPAREDNESS"
                color = "amber"
                reason = "Convective cluster organizing upwind. Inflow rates increasing."
                action = "Review drain clearances and mobilize ward response teams."
            else:
                verdict = "LOW HYDROLOGICAL RISK"
                color = "emerald"
                reason = "Normal baseflow with negligible accumulation expected."
                action = "Routine hydrological monitoring."

            return {
                "activity": "Disaster / Urban Flood Watch",
                "verdict": verdict,
                "color": color,
                "risk_score": rain_prob,
                "reason": reason,
                "action": action,
                "proactive_push": rain_prob >= 60
            }

        else: # Citizen
            if rain_prob >= 60:
                verdict = "RAIN GEAR REQUIRED"
                color = "amber"
                reason = f"High likelihood of evening downpours ({rain_prob}%)."
                action = "Carry waterproof protection. Anticipate traffic slowdowns."
            else:
                verdict = "PLEASANT OUTDOOR"
                color = "emerald"
                reason = f"Mild temperatures ({temp}°C) with comfortable breeze."
                action = "Ideal for commuting and outdoor activities."

            return {
                "activity": "Daily Commute & Outdoor Plans",
                "verdict": verdict,
                "color": color,
                "risk_score": rain_prob,
                "reason": reason,
                "action": action,
                "proactive_push": rain_prob >= 60
            }
