"""
SIH Climate Resilience & Agro-Meteorological Decision Engine
Advanced Physics + Statistical Machine Learning models for precision agriculture,
crop disease risk forecasting, soil water balance, and farm resilience.
"""

import math
from typing import Dict, Any, List, Optional
from datetime import datetime

class SIHClimateResilienceEngine:
    """
    Precision Agricultural Meteorology Engine implementing FAO-56 Penman-Monteith,
    Delta-T spraying suitability, Soil Runoff Potential, and Fungal Risk curves.
    """

    @staticmethod
    def calculate_vapor_pressure(temp_c: float, relative_humidity: float) -> Dict[str, float]:
        """
        Calculates saturation vapor pressure (es) and actual vapor pressure (ea) in kPa.
        Formula: Tetens equation.
        """
        es = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
        ea = es * (relative_humidity / 100.0)
        vpd = max(0.0, es - ea)
        return {
            "saturation_vapor_pressure_kpa": round(es, 3),
            "actual_vapor_pressure_kpa": round(ea, 3),
            "vapor_pressure_deficit_kpa": round(vpd, 3)
        }

    @staticmethod
    def calculate_wet_bulb_temp(temp_c: float, relative_humidity: float) -> float:
        """
        Stull's equation for Wet-Bulb Temperature (Tw).
        Critical for Delta-T calculation for chemical pesticide drift prevention.
        """
        T = temp_c
        RH = relative_humidity
        tw = (
            T * math.atan(0.151977 * math.pow(RH + 8.313659, 0.5))
            + math.atan(T + RH)
            - math.atan(RH - 1.676331)
            + 0.00391838 * math.pow(RH, 1.5) * math.atan(0.023101 * RH)
            - 4.686035
        )
        return round(tw, 2)

    @classmethod
    def calculate_delta_t(cls, temp_c: float, relative_humidity: float) -> Dict[str, Any]:
        """
        Delta-T (°C) = Dry-Bulb Temp - Wet-Bulb Temp.
        Global agricultural standard for spray droplet survival and drift risk.
        - Optimal: 2.0°C to 8.0°C
        - Marginal: 8.0°C to 10.0°C or 1.0°C to 2.0°C
        - High Drift / Evaporation: > 10.0°C
        - High Inversion / Survival: < 2.0°C
        """
        wet_bulb = cls.calculate_wet_bulb_temp(temp_c, relative_humidity)
        delta_t = round(temp_c - wet_bulb, 2)

        if 2.0 <= delta_t <= 8.0:
            status = "EXCELLENT"
            color = "emerald"
            recommendation = "Optimal spraying window. Droplet size remains stable with minimal evaporation and zero inversion risk."
        elif 8.0 < delta_t <= 10.0:
            status = "MARGINAL_HIGH"
            color = "amber"
            recommendation = "Caution: Droplets may evaporate before reaching target foliage. Use coarse nozzle droplets."
        elif delta_t > 10.0:
            status = "UNSUITABLE_HIGH_EVAP"
            color = "rose"
            recommendation = "Do not spray! Extreme droplet evaporation risk leading to chemical wastage and crop burn."
        else:
            status = "UNSUITABLE_INVERSION"
            color = "rose"
            recommendation = "Avoid spraying: High humidity with stagnant air may cause chemical mist drift to neighboring plots."

        return {
            "dry_bulb_temp": temp_c,
            "wet_bulb_temp": wet_bulb,
            "delta_t_celsius": delta_t,
            "status": status,
            "color": color,
            "recommendation": recommendation
        }

    @staticmethod
    def calculate_fao56_penman_monteith_eto(
        temp_c: float,
        relative_humidity: float,
        wind_speed_kmh: float,
        solar_radiation_mj: float = 18.5,
        elevation_m: float = 560.0
    ) -> Dict[str, Any]:
        """
        Standard FAO-56 Reference Crop Evapotranspiration (ETo in mm/day).
        Enables precise water budgeting for Indian farmers (drip irrigation scheduling).
        """
        # Atmospheric pressure in kPa
        p = 101.3 * math.pow((293.0 - 0.0065 * elevation_m) / 293.0, 5.26)
        # Psychrometric constant (gamma)
        gamma = 0.000665 * p
        # Slope of saturation vapor pressure curve (Delta)
        delta = 4098.0 * (0.6108 * math.exp((17.27 * temp_c) / (temp_c + 237.3))) / math.pow(temp_c + 237.3, 2)
        # Wind speed at 2m height (u2 in m/s)
        u2 = (wind_speed_kmh / 3.6) * 0.75

        # Net radiation estimate (Rn) and soil heat flux (G ~ 0 for daily)
        rn = solar_radiation_mj * 0.408
        g = 0.0

        es = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
        ea = es * (relative_humidity / 100.0)
        vpd = max(0.0, es - ea)

        # Penman-Monteith equation
        numerator = 0.408 * delta * (rn - g) + gamma * (900.0 / (temp_c + 273.0)) * u2 * vpd
        denominator = delta + gamma * (1.0 + 0.34 * u2)

        eto = max(0.5, round(numerator / denominator, 2))
        water_req_liters_per_acre = round(eto * 4046.86, 0)

        return {
            "daily_eto_mm": eto,
            "water_requirement_liters_per_acre": water_req_liters_per_acre,
            "atmospheric_pressure_kpa": round(p, 2),
            "vapor_pressure_deficit_kpa": round(vpd, 2),
            "irrigation_advice": f"Apply approximately {eto} mm ({water_req_liters_per_acre:,.0f} L/acre) of irrigation today."
        }

    @staticmethod
    def calculate_fungal_disease_index(
        temp_c: float,
        relative_humidity: float,
        crop_type: str = "Soybean / Pulses",
        leaf_wetness_hours: float = 4.5
    ) -> Dict[str, Any]:
        """
        Computes Fungal Infection Index (Downy Mildew, Rust, Anthracnose, Blight).
        Based on Mills & Wallin infection period algorithms.
        """
        # Optimum fungal spore germination range: 18°C - 28°C and RH > 80%
        temp_factor = 1.0 - (min(abs(temp_c - 23.5), 12.0) / 12.0)
        rh_factor = max(0.0, (relative_humidity - 60.0) / 40.0)
        wetness_factor = min(1.0, leaf_wetness_hours / 8.0)

        infection_prob = round((temp_factor * 0.4 + rh_factor * 0.4 + wetness_factor * 0.2) * 100, 1)

        if infection_prob >= 70:
            risk_level = "HIGH"
            alert = f"High fungal sporulation risk for {crop_type}. Prophylactic bio-fungicide (Trichoderma) spray recommended."
            action_code = "RED"
        elif infection_prob >= 40:
            risk_level = "MODERATE"
            alert = f"Moderate leaf dampness. Monitor underside of leaves for early rust or mildew spots."
            action_code = "YELLOW"
        else:
            risk_level = "LOW"
            alert = f"Foliar moisture is low. Crop canopy is healthy with negligible fungal pressure."
            action_code = "GREEN"

        return {
            "infection_risk_percent": infection_prob,
            "risk_level": risk_level,
            "action_code": action_code,
            "leaf_wetness_hours": leaf_wetness_hours,
            "advisory": alert
        }

    @staticmethod
    def calculate_heat_stress_wbgt(
        temp_c: float,
        relative_humidity: float,
        wind_speed_kmh: float
    ) -> Dict[str, Any]:
        """
        Wet Bulb Globe Temperature (WBGT) simplified for field labor safety & livestock thermal comfort.
        """
        tw = SIHClimateResilienceEngine.calculate_wet_bulb_temp(temp_c, relative_humidity)
        wbgt = round(0.7 * tw + 0.3 * temp_c, 1)

        if wbgt >= 32.0:
            stress = "EXTREME_DANGER"
            work_rest_ratio = "15 min work / 45 min rest in shade"
            advisory = "Hazardous thermal stress! Suspend heavy field labor between 12:00 PM and 4:00 PM."
        elif wbgt >= 29.0:
            stress = "WARNING"
            work_rest_ratio = "30 min work / 30 min rest"
            advisory = "High heat load. Ensure abundant hydration and shaded resting spaces for farm workers."
        elif wbgt >= 26.0:
            stress = "CAUTION"
            work_rest_ratio = "45 min work / 15 min rest"
            advisory = "Moderate thermal load. Stay hydrated during direct sun exposure."
        else:
            stress = "SAFE"
            work_rest_ratio = "Normal standard work schedule"
            advisory = "Pleasant ambient working conditions."

        return {
            "wbgt_celsius": wbgt,
            "stress_category": stress,
            "work_rest_ratio": work_rest_ratio,
            "advisory": advisory
        }

# Singleton instance
climate_resilience_engine = SIHClimateResilienceEngine()
