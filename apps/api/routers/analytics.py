from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from apps.api.state import app_state
from packages.domain.analytics.anomaly import AnomalyDetector, AnomalyReport
from packages.domain.analytics.forecasting import TimeSeriesForecaster, ForecastReport

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

anomaly_detector = AnomalyDetector(z_threshold=2.5)
forecaster = TimeSeriesForecaster(min_history_required=6)

@router.get("/anomalies", response_model=AnomalyReport)
async def get_anomalies(
    method: str = Query("rolling_zscore", pattern="^(rolling_zscore|isolation_forest)$"),
    threshold: float = Query(2.5, ge=1.0, le=10.0)
):

    """
    Detects operational spikes and telemetry outliers using explainable statistical
    or multi-variable ML models.
    """
    records = app_state.get_or_load_records()
    if not records:
        raise HTTPException(status_code=400, detail="No active dataset available for anomaly detection")

    if method == "isolation_forest":
        return anomaly_detector.detect_isolation_forest(records)
    else:
        detector = AnomalyDetector(z_threshold=threshold)
        return detector.detect_zscore(records)

@router.get("/forecast", response_model=ForecastReport)
async def get_forecast(
    horizon: int = Query(6, ge=1, le=48)
):
    """
    Produces deterministic near-term energy consumption forecasts with 95% confidence bounds
    and controlled insufficient data handling.
    """
    records = app_state.get_or_load_records()
    if not records:
        raise HTTPException(status_code=400, detail="No active dataset available for forecasting")

    return forecaster.forecast(records, horizon=horizon)
