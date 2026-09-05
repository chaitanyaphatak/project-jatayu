import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List, Optional
from datetime import datetime

class AnomalyDetector:
    """
    Hybrid Anomaly Detection Engine (PRD Section 3):
    1. Statistical Z-Score: Computes deviations against baseline regional climate distributions.
    2. Scikit-learn IsolationForest: Multi-dimensional anomaly scoring on
       [temperature, humidity, wind_speed, pressure_drop, precipitation_rate].
    """

    # Baseline distribution parameters for Indian monsoon/post-monsoon sub-regions
    BASELINES = {
        "precipitation_rate": {"mean": 4.5, "std": 8.0, "extreme_thresh": 35.0}, # mm/h
        "wind_speed": {"mean": 12.0, "std": 6.5, "extreme_thresh": 45.0},        # km/h
        "pressure_drop_3h": {"mean": 1.2, "std": 0.8, "extreme_thresh": 4.0},     # hPa
        "humidity": {"mean": 65.0, "std": 18.0, "extreme_thresh": 95.0}          # %
    }

    def __init__(self):
        # Pre-fit an IsolationForest with synthetic synthetic climatological distribution
        np.random.seed(42)
        n_samples = 2000
        synthetic_normal = np.column_stack([
            np.random.normal(27.0, 4.0, n_samples),   # temp
            np.random.normal(68.0, 15.0, n_samples),  # humidity
            np.random.normal(12.0, 5.0, n_samples),   # wind
            np.random.normal(1010.0, 4.0, n_samples), # pressure
            np.random.exponential(5.0, n_samples)     # precip
        ])
        self.iso_forest = IsolationForest(contamination=0.04, random_state=42)
        self.iso_forest.fit(synthetic_normal)

    def analyze_weather(
        self, 
        weather_telemetry: Dict[str, Any],
        custom_thresholds: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        temp = float(weather_telemetry.get("temperature", 26.0))
        humidity = float(weather_telemetry.get("humidity", 75.0))
        wind = float(weather_telemetry.get("wind_speed", 14.0))
        pressure = float(weather_telemetry.get("surface_pressure", 1008.0))
        precip_prob = float(weather_telemetry.get("precipitation_prob", 40.0))
        
        # Estimated precipitation rate from probability & cloud conditions
        precip_rate = (precip_prob / 100.0) * (38.0 if "heavy" in weather_telemetry.get("condition", "").lower() else 14.0)

        # 1. Compute Individual Z-Scores
        z_precip = (precip_rate - self.BASELINES["precipitation_rate"]["mean"]) / self.BASELINES["precipitation_rate"]["std"]
        z_wind = (wind - self.BASELINES["wind_speed"]["mean"]) / self.BASELINES["wind_speed"]["std"]
        z_humidity = (humidity - self.BASELINES["humidity"]["mean"]) / self.BASELINES["humidity"]["std"]
        
        # Max representative z-score
        max_z = max(z_precip, z_wind, z_humidity)
        max_z_rounded = round(float(max_z), 2)

        # 2. Multi-variate Isolation Forest Anomaly Score
        features = np.array([[temp, humidity, wind, pressure, precip_rate]])
        is_inlier = self.iso_forest.predict(features)[0]  # 1 for normal, -1 for anomaly
        anomaly_score = float(-self.iso_forest.score_samples(features)[0]) # Higher = more anomalous

        is_anomaly = (is_inlier == -1) or (max_z >= 2.2)

        # Severity determination
        if max_z >= 3.5 or anomaly_score > 0.65:
            severity = "extreme"
            severity_label = "CRITICAL EMERGENCY"
        elif max_z >= 2.5 or is_anomaly:
            severity = "warning"
            severity_label = "MODERATE WARNING"
        elif max_z >= 1.8:
            severity = "advisory"
            severity_label = "ADVISORY WATCH"
        else:
            severity = "info"
            severity_label = "NORMAL CONDITIONS"

        return {
            "is_anomaly": is_anomaly,
            "max_z_score": max_z_rounded,
            "isolation_forest_score": round(anomaly_score, 3),
            "severity": severity,
            "severity_label": severity_label,
            "metrics": {
                "precip_z": round(z_precip, 2),
                "wind_z": round(z_wind, 2),
                "humidity_z": round(z_humidity, 2)
            }
        }

anomaly_engine = AnomalyDetector()
