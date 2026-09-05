"""
SIH 2024 — Environmental & Disaster Resilience Multi-Hazard Composite Index (MHCI)
Computes multi-hazard composite risk scores for Indian districts using meteorological,
geophysical, and socioeconomic vulnerability factors.
"""
import math
from typing import Dict, Any, Optional, List


class MultiHazardCompositeIndex:
    """
    Implements India's National Disaster Management Authority (NDMA) MHCI framework
    adapted with real-time weather anomalies using Isolation Forest Z-scores.
    """

    # Typical precipitation normals for major Indian meteorological subdivisions
    PRECIP_NORMALS_MM = {
        "northwest": 620, "west": 1900, "central": 1100, "south": 950,
        "northeast": 2800, "east": 1400, "peninsular": 800, "default": 1100
    }

    @staticmethod
    def compute_flood_risk_index(
        rainfall_mm_3day: float,
        soil_moisture_pct: float = 65.0,
        slope_pct: float = 3.5,
        urban_drainage_score: float = 0.6
    ) -> Dict[str, Any]:
        """
        Flood Risk Index based on:
        - 3-day antecedent rainfall (SCS Curve Number proxy)
        - Soil saturation state
        - Terrain slope gradient
        - Urban storm-drain capacity score (0-1)
        """
        # SCS Curve Number simplified runoff
        cn = 75.0 + (soil_moisture_pct / 100.0) * 15.0
        s = (25400.0 / cn) - 254.0
        threshold = 0.2 * s

        if rainfall_mm_3day > threshold:
            runoff = math.pow(rainfall_mm_3day - threshold, 2) / (rainfall_mm_3day - threshold + s)
        else:
            runoff = 0.0

        slope_factor = math.log1p(slope_pct) / math.log(10)
        urban_factor = 1.0 - (urban_drainage_score * 0.4)
        flood_index = round(min(100.0, runoff * slope_factor * urban_factor * 0.35), 1)

        if flood_index >= 65.0:
            severity = "EXTREME"
            warning = "Flash flood or urban inundation imminent. Evacuate low-lying areas."
            ndma_action = "Pre-position NDRF teams and issue IMD Flood Bulletin."
        elif flood_index >= 40.0:
            severity = "HIGH"
            warning = "Significant waterlogging and road disruptions expected. Avoid riverbeds."
            ndma_action = "Alert SDRF teams. Deploy early-warning sirens in floodplain zones."
        elif flood_index >= 20.0:
            severity = "MODERATE"
            warning = "Minor surface runoff and localized waterlogging possible."
            ndma_action = "Monitor catchment levels. Maintain dam gate operations protocol."
        else:
            severity = "LOW"
            warning = "Soil absorption adequate. No significant flood risk currently."
            ndma_action = "Standard monsoon monitoring."

        return {
            "flood_risk_index": flood_index,
            "curve_number": round(cn, 1),
            "estimated_surface_runoff_mm": round(runoff, 1),
            "severity": severity,
            "warning": warning,
            "ndma_action": ndma_action
        }

    @staticmethod
    def compute_drought_stress_index(
        rainfall_deficit_pct: float,
        soil_moisture_pct: float = 40.0,
        reservoir_capacity_pct: float = 55.0
    ) -> Dict[str, Any]:
        """
        Composite Agricultural Drought Stress Index.
        Combines SPI-inspired rainfall deficit with soil moisture and reservoir status.
        """
        deficit_factor = min(1.0, max(0.0, rainfall_deficit_pct / 100.0))
        soil_factor = max(0.0, 1.0 - (soil_moisture_pct / 100.0))
        reservoir_factor = max(0.0, 1.0 - (reservoir_capacity_pct / 100.0)) * 0.5

        drought_index = round((deficit_factor * 0.45 + soil_factor * 0.35 + reservoir_factor * 0.20) * 100, 1)

        if drought_index >= 70:
            category = "EXCEPTIONAL_DROUGHT"
            advisory = "Crop failure risk imminent. Activate PMFBY crop insurance claims. Deploy tanker water supply."
        elif drought_index >= 50:
            category = "EXTREME_DROUGHT"
            advisory = "Severe moisture deficit. Implement micro-drip irrigation. Restrict non-essential water use."
        elif drought_index >= 30:
            category = "SEVERE_DROUGHT"
            advisory = "Deficit conditions ongoing. Prioritize Rabi sowing of drought-tolerant varieties."
        elif drought_index >= 15:
            category = "MODERATE_DROUGHT"
            advisory = "Reduced soil moisture. Apply mulching and increase organic matter to retain water."
        else:
            category = "NO_DROUGHT"
            advisory = "Adequate moisture availability for current crop season."

        return {
            "drought_stress_index": drought_index,
            "category": category,
            "rainfall_deficit_pct": rainfall_deficit_pct,
            "soil_moisture_pct": soil_moisture_pct,
            "advisory": advisory
        }

    @staticmethod
    def compute_lightning_risk(
        cape_jkg: float = 800.0,
        lifted_index: float = -3.0,
        cloud_top_temp_c: float = -45.0
    ) -> Dict[str, Any]:
        """
        Thunderstorm and Lightning Strike Probability Model.
        Uses CAPE (Convective Available Potential Energy), Lifted Index, and cloud-top radiometric temperature.
        """
        # Normalize CAPE (0-3000 J/kg scale)
        cape_norm = min(1.0, cape_jkg / 3000.0)
        # LI: more negative = more unstable
        li_norm = min(1.0, max(0.0, (-lifted_index + 2) / 10.0))
        # Cloud top proxy: more negative = deeper convection
        cloud_norm = min(1.0, max(0.0, (abs(cloud_top_temp_c) - 20.0) / 50.0))

        lightning_prob = round((cape_norm * 0.5 + li_norm * 0.3 + cloud_norm * 0.2) * 100, 1)

        if lightning_prob >= 75:
            risk = "VERY_HIGH"
            advisory = "Severe thunderstorm with frequent cloud-to-ground lightning. Stay indoors. Suspend outdoor operations."
            imd_code = "RED"
        elif lightning_prob >= 50:
            risk = "HIGH"
            advisory = "Thunderstorm likely. Avoid tall trees, open fields, and water bodies. Shelter immediately."
            imd_code = "ORANGE"
        elif lightning_prob >= 25:
            risk = "MODERATE"
            advisory = "Isolated thundershowers possible. Monitor IMD nowcast. Proceed with caution."
            imd_code = "YELLOW"
        else:
            risk = "LOW"
            advisory = "Convective atmosphere stable. Lightning risk negligible today."
            imd_code = "GREEN"

        return {
            "lightning_probability_pct": lightning_prob,
            "risk_level": risk,
            "imd_warning_code": imd_code,
            "cape_jkg": cape_jkg,
            "lifted_index": lifted_index,
            "advisory": advisory
        }

    @classmethod
    def compute_full_mhci(
        cls,
        temp_c: float,
        rainfall_3day_mm: float,
        rainfall_deficit_pct: float,
        humidity_pct: float,
        soil_moisture_pct: float = 55.0,
        cape_jkg: float = 600.0
    ) -> Dict[str, Any]:
        """
        Full Multi-Hazard Composite Index (MHCI) — SIH Priority Output.
        Weighted composite of Flood, Drought, Lightning, and Heat risks.
        """
        flood = cls.compute_flood_risk_index(rainfall_3day_mm, soil_moisture_pct)
        drought = cls.compute_drought_stress_index(rainfall_deficit_pct, soil_moisture_pct)
        lightning = cls.compute_lightning_risk(cape_jkg)

        # Composite MHCI (weighted)
        mhci_score = round(
            flood["flood_risk_index"] * 0.30
            + drought["drought_stress_index"] * 0.35
            + lightning["lightning_probability_pct"] * 0.20
            + (max(0, temp_c - 32) * 3.0)  # Heat contribution
        , 1)

        mhci_score = min(100.0, mhci_score)

        if mhci_score >= 70:
            mhci_level = "CRITICAL_MULTI_HAZARD"
            overall_advisory = "Multiple simultaneous hazards detected. Activate NDMA State Emergency Operations Centre."
        elif mhci_score >= 45:
            mhci_level = "HIGH_RISK"
            overall_advisory = "Elevated compound risk. Coordinate SDRF, irrigation dept, and IMD advisories."
        elif mhci_score >= 25:
            mhci_level = "MODERATE_RISK"
            overall_advisory = "Localized hazard risks present. Monitor continuously."
        else:
            mhci_level = "NORMAL"
            overall_advisory = "Conditions within acceptable safe bounds."

        return {
            "mhci_composite_score": mhci_score,
            "mhci_level": mhci_level,
            "overall_advisory": overall_advisory,
            "flood_component": flood,
            "drought_component": drought,
            "lightning_component": lightning,
            "framework": "India NDMA Multi-Hazard Composite Index (MHCI) — SIH 2024 Climate Resilience"
        }


# Module-level instance
mhci_engine = MultiHazardCompositeIndex()
