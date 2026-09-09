from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
import numpy as np

from packages.domain.ingestion.schema import NormalizedRecord

class AnomalyItem(BaseModel):
    timestamp: datetime
    resource_id: str
    metric_name: str
    actual_value: float
    expected_value: float
    anomaly_score: float
    threshold: float
    severity: str  # "low", "medium", "high", "critical"
    method: str
    explanation: str

class AnomalyReport(BaseModel):
    total_records_analyzed: int
    anomalies_detected: int
    method: str
    threshold: float
    items: List[AnomalyItem]

class AnomalyDetector:
    """Detects operational energy and utilization anomalies using rolling z-scores or Isolation Forest."""

    def __init__(self, z_threshold: float = 2.5, window_size: int = 6):
        self.z_threshold = z_threshold
        self.window_size = window_size

    def _determine_severity(self, score: float) -> str:
        abs_score = abs(score)
        if abs_score >= 4.0:
            return "critical"
        elif abs_score >= 3.0:
            return "high"
        elif abs_score >= 2.5:
            return "medium"
        return "low"

    def detect_zscore(self, records: List[NormalizedRecord]) -> AnomalyReport:
        if len(records) < 4:
            return AnomalyReport(
                total_records_analyzed=len(records),
                anomalies_detected=0,
                method="rolling_zscore",
                threshold=self.z_threshold,
                items=[]
            )

        # Sort records by timestamp
        sorted_records = sorted(records, key=lambda r: r.timestamp)
        energies = [r.energy_kwh for r in sorted_records]
        
        global_mean = float(np.mean(energies))
        global_std = float(np.std(energies))
        if global_std < 1e-6:
            global_std = 1.0  # Prevent division by zero

        anomalies: List[AnomalyItem] = []

        for i, rec in enumerate(sorted_records):
            # Use rolling window of past observations if available, otherwise global baseline
            start_idx = max(0, i - self.window_size)
            window = energies[start_idx:i] if i > 1 else energies

            win_mean = float(np.mean(window)) if len(window) >= 2 else global_mean
            win_std = float(np.std(window)) if len(window) >= 2 else global_std
            if win_std < 1e-4:
                win_std = global_std if global_std > 1e-4 else 1.0

            z = (rec.energy_kwh - win_mean) / win_std

            if z >= self.z_threshold:
                severity = self._determine_severity(z)
                explanation = (
                    f"Spike detected on {rec.resource_id}: energy consumption of {rec.energy_kwh:.2f} kWh was "
                    f"{z:.2f} standard deviations above the recent baseline ({win_mean:.2f} ± {win_std:.2f} kWh). "
                    f"Utilization was {rec.utilization * 100:.1f}%."
                )
                anomalies.append(AnomalyItem(
                    timestamp=rec.timestamp,
                    resource_id=rec.resource_id,
                    metric_name="energy_kwh",
                    actual_value=round(rec.energy_kwh, 2),
                    expected_value=round(win_mean, 2),
                    anomaly_score=round(z, 2),
                    threshold=self.z_threshold,
                    severity=severity,
                    method="rolling_zscore",
                    explanation=explanation
                ))

        return AnomalyReport(
            total_records_analyzed=len(records),
            anomalies_detected=len(anomalies),
            method="rolling_zscore",
            threshold=self.z_threshold,
            items=anomalies
        )

    def detect_isolation_forest(self, records: List[NormalizedRecord], contamination: float = 0.05) -> AnomalyReport:
        if len(records) < 10:
            # Fall back to zscore if dataset is too small for isolation forest
            return self.detect_zscore(records)

        try:
            from sklearn.ensemble import IsolationForest
        except ImportError:
            return self.detect_zscore(records)

        sorted_records = sorted(records, key=lambda r: r.timestamp)
        X = np.array([[r.energy_kwh, r.utilization] for r in sorted_records])

        clf = IsolationForest(contamination=contamination, random_state=42)
        preds = clf.fit_predict(X)
        decision_scores = -clf.decision_function(X) # Higher score = more anomalous

        anomalies: List[AnomalyItem] = []
        median_energy = float(np.median(X[:, 0]))

        for i, pred in enumerate(preds):
            if pred == -1: # Outlier
                rec = sorted_records[i]
                score = float(decision_scores[i])
                explanation = (
                    f"Multi-variable outlier on {rec.resource_id}: energy {rec.energy_kwh:.2f} kWh with "
                    f"{rec.utilization * 100:.1f}% utilization deviates significantly from typical fleet distribution."
                )
                anomalies.append(AnomalyItem(
                    timestamp=rec.timestamp,
                    resource_id=rec.resource_id,
                    metric_name="energy_and_utilization",
                    actual_value=round(rec.energy_kwh, 2),
                    expected_value=round(median_energy, 2),
                    anomaly_score=round(score, 3),
                    threshold=0.0,
                    severity="high" if rec.energy_kwh > median_energy else "medium",
                    method="isolation_forest",
                    explanation=explanation
                ))

        return AnomalyReport(
            total_records_analyzed=len(records),
            anomalies_detected=len(anomalies),
            method="isolation_forest",
            threshold=0.0,
            items=anomalies
        )
