"""
SIH 2024 — Aviation Meteorology API
ICAO-standard crosswind, ATIS, density altitude, and turbulence endpoints
"""
from fastapi import APIRouter, Query
from typing import Optional
from app.services.aviation_met_engine import AviationMetEngine

router = APIRouter()
avi = AviationMetEngine()


@router.get("/crosswind")
async def get_crosswind_analysis(
    wind_direction: float = Query(230.0, description="Wind direction in degrees (true)"),
    wind_speed_kmh: float = Query(22.0, description="Wind speed in km/h"),
    runway_heading: float = Query(280.0, description="Runway heading in degrees")
):
    """
    ICAO crosswind / headwind decomposition.
    Critical for pilot go/no-go decision and runway assignment.
    """
    return avi.compute_crosswind_headwind(wind_direction, wind_speed_kmh, runway_heading)


@router.get("/density-altitude")
async def get_density_altitude(
    elevation_m: float = Query(599.0, description="Airport elevation in meters"),
    temp_c: float = Query(33.0, description="Temperature °C"),
    qnh_hpa: float = Query(1010.0, description="QNH in hPa")
):
    """
    Pressure Altitude & Density Altitude (DA) computation.
    Critical for high-altitude Indian airports: Leh, Shimla, Pantnagar, Pakyong.
    """
    return avi.compute_density_altitude(elevation_m, temp_c, qnh_hpa)


@router.get("/turbulence-index")
async def get_turbulence_index(
    wind_shear_kmh_per_1000ft: float = Query(8.0, description="Wind shear per 1000 ft"),
    cloud_base_ft: float = Query(4500.0, description="Cloud base altitude in feet"),
    cape_jkg: float = Query(600.0, description="CAPE in J/kg"),
    temp_lapse_rate: float = Query(7.5, description="Environmental lapse rate °C/km")
):
    """
    Composite Turbulence Intensity Index.
    CAT (Clear Air Turbulence) + Convective Turbulence scoring for FL100-FL250.
    """
    return avi.compute_turbulence_index(
        wind_shear_kmh_per_1000ft=wind_shear_kmh_per_1000ft,
        cloud_base_ft=cloud_base_ft,
        cape_jkg=cape_jkg,
        temp_lapse_rate=temp_lapse_rate
    )


@router.get("/atis-briefing")
async def get_atis_briefing(
    icao: str = Query("VAPO", description="ICAO airport code (e.g. VAPO, VABB, VIDP)"),
    wind_dir: float = Query(230.0, description="Wind direction degrees"),
    wind_speed_kmh: float = Query(18.0, description="Wind speed km/h"),
    temp_c: float = Query(31.0, description="Temperature °C"),
    visibility_km: float = Query(8.0, description="Visibility in km"),
    qnh_hpa: float = Query(1011.0, description="QNH altimeter setting hPa"),
    cloud_oktas: int = Query(3, description="Cloud cover in oktas (0-8)"),
    cloud_base_ft: float = Query(5000.0, description="Cloud base in feet AGL")
):
    """
    🛫 Full ATIS Meteorological Briefing — SIH Aviation Safety Feature.
    Generates terminal aerodrome briefing for any of 6 major Indian airports.
    """
    return avi.generate_atis_briefing(
        icao_code=icao,
        wind_dir=wind_dir,
        wind_speed_kmh=wind_speed_kmh,
        temp_c=temp_c,
        visibility_km=visibility_km,
        qnh_hpa=qnh_hpa,
        cloud_oktas=cloud_oktas,
        cloud_base_ft=cloud_base_ft
    )
