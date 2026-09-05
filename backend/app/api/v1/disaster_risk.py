"""
SIH 2024 — Multi-Hazard Composite Index (MHCI) API
Disaster Risk Reduction & Early Warning System endpoints
"""
from fastapi import APIRouter, Query
from typing import Optional
from app.services.disaster_resilience_engine import MultiHazardCompositeIndex

router = APIRouter()
mhci = MultiHazardCompositeIndex()


@router.get("/flood-risk")
async def get_flood_risk(
    rainfall_mm_3day: float = Query(85.0, description="Cumulative 3-day rainfall in mm"),
    soil_moisture_pct: float = Query(65.0, description="Soil moisture saturation %"),
    slope_pct: float = Query(3.5, description="Terrain slope in %"),
    urban_drainage_score: float = Query(0.6, description="Drainage capacity 0-1 (1=excellent)")
):
    """
    SCS Curve Number Flood Risk Index.
    Based on NDMA & IMD flood vulnerability standards for Indian districts.
    """
    return mhci.compute_flood_risk_index(
        rainfall_mm_3day=rainfall_mm_3day,
        soil_moisture_pct=soil_moisture_pct,
        slope_pct=slope_pct,
        urban_drainage_score=urban_drainage_score
    )


@router.get("/drought-stress")
async def get_drought_stress(
    rainfall_deficit_pct: float = Query(35.0, description="Seasonal rainfall deficit %"),
    soil_moisture_pct: float = Query(40.0, description="Current soil moisture %"),
    reservoir_capacity_pct: float = Query(55.0, description="Reservoir level as % of total capacity")
):
    """
    Composite Agricultural Drought Stress Index.
    Supports PMFBY crop insurance integration and SIH water conservation themes.
    """
    return mhci.compute_drought_stress_index(
        rainfall_deficit_pct=rainfall_deficit_pct,
        soil_moisture_pct=soil_moisture_pct,
        reservoir_capacity_pct=reservoir_capacity_pct
    )


@router.get("/lightning-risk")
async def get_lightning_risk(
    cape_jkg: float = Query(800.0, description="CAPE in J/kg (0-3000)"),
    lifted_index: float = Query(-3.0, description="Lifted Index (negative = unstable)"),
    cloud_top_temp_c: float = Query(-45.0, description="Cloud top temperature in °C")
):
    """
    Thunderstorm & Lightning Strike Probability using CAPE, Lifted Index, and cloud-top radiometry.
    Aligned with IMD Color-Code Warning framework (Green/Yellow/Orange/Red).
    """
    return mhci.compute_lightning_risk(
        cape_jkg=cape_jkg,
        lifted_index=lifted_index,
        cloud_top_temp_c=cloud_top_temp_c
    )


@router.get("/mhci-composite")
async def get_full_mhci(
    lat: float = Query(18.5204, description="Latitude"),
    lon: float = Query(73.8567, description="Longitude"),
    temp_c: float = Query(30.0, description="Current temperature °C"),
    rainfall_3day_mm: float = Query(80.0, description="3-day cumulative rainfall mm"),
    rainfall_deficit_pct: float = Query(20.0, description="Seasonal rainfall deficit %"),
    humidity_pct: float = Query(72.0, description="Relative humidity %"),
    soil_moisture_pct: float = Query(55.0, description="Soil moisture %"),
    cape_jkg: float = Query(600.0, description="CAPE J/kg")
):
    """
    🚨 Full Multi-Hazard Composite Index (MHCI) — SIH 2024 Grand Feature
    Unified disaster risk dashboard combining Flood + Drought + Lightning + Heat stress.
    Powers early-warning system for village-level climate resilience decision support.
    """
    result = mhci.compute_full_mhci(
        temp_c=temp_c,
        rainfall_3day_mm=rainfall_3day_mm,
        rainfall_deficit_pct=rainfall_deficit_pct,
        humidity_pct=humidity_pct,
        soil_moisture_pct=soil_moisture_pct,
        cape_jkg=cape_jkg
    )
    result["location"] = {"lat": lat, "lon": lon}
    return result
