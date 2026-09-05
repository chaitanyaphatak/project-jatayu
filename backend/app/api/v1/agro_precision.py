"""
SIH 2024 Advanced Climate Resilience API
Precision Agro-Met Decision Support & Water Budget Endpoints
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.sih_climate_resilience_engine import SIHClimateResilienceEngine

router = APIRouter()
engine = SIHClimateResilienceEngine()


@router.get("/delta-t")
async def get_delta_t_spray_window(
    temp: float = Query(28.5, description="Dry-bulb temperature in °C"),
    humidity: float = Query(65.0, description="Relative humidity in %"),
    crop_stage: Optional[str] = Query("Flowering", description="Crop growth stage")
):
    """
    Delta-T Spray Suitability Window (FAO + Australian APVMA standard).
    Used globally to prevent pesticide drift and evaporation losses.
    """
    result = engine.calculate_delta_t(temp, humidity)
    result["crop_stage"] = crop_stage
    result["standard"] = "APVMA / FAO Agro-Chemical Application Guidelines"
    return result


@router.get("/evapotranspiration")
async def get_penman_monteith_eto(
    temp: float = Query(28.0, description="Mean daily temperature °C"),
    humidity: float = Query(65.0, description="Relative humidity %"),
    wind_speed_kmh: float = Query(12.0, description="Wind speed km/h"),
    solar_radiation_mj: float = Query(18.5, description="Solar radiation MJ/m²/day"),
    elevation_m: float = Query(560.0, description="Station elevation in meters")
):
    """
    FAO-56 Penman-Monteith Reference Evapotranspiration.
    Computes daily irrigation scheduling volume in mm/day and Liters/acre.
    Essential for SIH2024 water resource & precision farming themes.
    """
    result = engine.calculate_fao56_penman_monteith_eto(
        temp_c=temp,
        relative_humidity=humidity,
        wind_speed_kmh=wind_speed_kmh,
        solar_radiation_mj=solar_radiation_mj,
        elevation_m=elevation_m
    )
    result["standard"] = "FAO Irrigation and Drainage Paper No. 56"
    return result


@router.get("/fungal-risk")
async def get_fungal_infection_risk(
    temp: float = Query(24.0, description="Temperature °C"),
    humidity: float = Query(82.0, description="Relative humidity %"),
    crop_type: Optional[str] = Query("Soybean", description="Crop variety"),
    leaf_wetness_hours: float = Query(5.0, description="Estimated leaf wetness duration in hours")
):
    """
    Mills-Wallin Fungal Infection Period Algorithm.
    Predicts Downy Mildew, Powdery Mildew, Anthracnose, Rust outbreak probability.
    """
    result = engine.calculate_fungal_disease_index(
        temp_c=temp,
        relative_humidity=humidity,
        crop_type=crop_type or "Crop",
        leaf_wetness_hours=leaf_wetness_hours
    )
    result["algorithm"] = "Mills-Wallin Infection Period Model"
    return result


@router.get("/heat-stress-wbgt")
async def get_heat_stress_index(
    temp: float = Query(34.0, description="Temperature °C"),
    humidity: float = Query(75.0, description="Relative humidity %"),
    wind_speed_kmh: float = Query(8.0, description="Wind speed km/h")
):
    """
    WBGT (Wet Bulb Globe Temperature) Field Labor Safety Index.
    WHO/ISO 7933 standards for heat stress in agricultural field work.
    """
    result = engine.calculate_heat_stress_wbgt(
        temp_c=temp,
        relative_humidity=humidity,
        wind_speed_kmh=wind_speed_kmh
    )
    result["standard"] = "ISO 7933 / WHO Occupational Heat Exposure"
    return result


@router.get("/full-agro-dashboard")
async def get_full_agro_decision_dashboard(
    lat: float = Query(18.5204, description="Latitude"),
    lon: float = Query(73.8567, description="Longitude"),
    temp: float = Query(28.5, description="Temperature °C"),
    humidity: float = Query(68.0, description="Relative humidity %"),
    wind_speed_kmh: float = Query(12.0, description="Wind speed km/h"),
    crop_type: Optional[str] = Query("Soybean", description="Crop type"),
    elevation_m: float = Query(560.0, description="Elevation in meters")
):
    """
    🌾 Unified SIH Agro-Meteorological Decision Dashboard
    Combines all precision agriculture modules into one comprehensive API response.
    Designed for the SIH 2024 Smart Agriculture & Climate Resilience themes.
    """
    import math
    
    delta_t = engine.calculate_delta_t(temp, humidity)
    eto = engine.calculate_fao56_penman_monteith_eto(temp, humidity, wind_speed_kmh, elevation_m=elevation_m)
    fungal = engine.calculate_fungal_disease_index(temp, humidity, crop_type or "Crop")
    heat_stress = engine.calculate_heat_stress_wbgt(temp, humidity, wind_speed_kmh)
    vapor = engine.calculate_vapor_pressure(temp, humidity)

    # Compute Crop Water Stress Index simplified
    crop_kc = 1.05  # Mid-season Kc for soybean flowering
    etc = round(eto["daily_eto_mm"] * crop_kc, 2)

    # Compute SIH Overall Farm Action Priority Score (0-100)
    priority_factors = []
    if delta_t["status"] in ["UNSUITABLE_HIGH_EVAP", "UNSUITABLE_INVERSION"]:
        priority_factors.append(40)
    elif delta_t["status"] == "MARGINAL_HIGH":
        priority_factors.append(20)
    if fungal["risk_level"] == "HIGH":
        priority_factors.append(35)
    elif fungal["risk_level"] == "MODERATE":
        priority_factors.append(15)
    if heat_stress["stress_category"] in ["WARNING", "EXTREME_DANGER"]:
        priority_factors.append(25)
    if vapor["vapor_pressure_deficit_kpa"] > 2.0:
        priority_factors.append(20)
    
    action_score = min(100, sum(priority_factors))
    
    if action_score >= 70:
        farm_alert = "CRITICAL"
        farm_summary = "Multiple high-risk agronomic factors detected. Immediate farm action required."
    elif action_score >= 35:
        farm_alert = "MODERATE"
        farm_summary = "Some adverse conditions present. Review spray schedule and irrigation plan."
    else:
        farm_alert = "NORMAL"
        farm_summary = "Farm conditions are largely favorable. Standard monitoring recommended."

    return {
        "location": {"lat": lat, "lon": lon},
        "weather_inputs": {
            "temperature_c": temp,
            "humidity_percent": humidity,
            "wind_speed_kmh": wind_speed_kmh,
            "elevation_m": elevation_m,
            "crop_type": crop_type
        },
        "farm_action_priority": {
            "score": action_score,
            "alert_level": farm_alert,
            "summary": farm_summary
        },
        "delta_t_spray_window": delta_t,
        "penman_monteith_eto": eto,
        "crop_evapotranspiration": {
            "crop_coefficient_kc": crop_kc,
            "crop_water_use_etc_mm": etc,
            "deficit_alert": etc > 6.5
        },
        "fungal_disease_risk": fungal,
        "heat_stress_wbgt": heat_stress,
        "vapor_pressure": vapor,
        "powered_by": "SIH Vayu — FAO-56 + Stull WBGT + Mills-Wallin Fungal Engine + Tetens VPD Model"
    }
