from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
from pydantic import BaseModel
import numpy as np

from packages.domain.ingestion.schema import NormalizedRecord

class ForecastPoint(BaseModel):
    timestamp: datetime
    predicted_energy_kwh: float
    lower_bound: float
    upper_bound: float

class ForecastReport(BaseModel):
    status: str  # "success" or "insufficient_data"
    method: str
    historical_points: int
    horizon_intervals: int
    points: List[ForecastPoint]
    model_metrics: Dict[str, float] = {}
    note: Optional[str] = None

class TimeSeriesForecaster:
    """Produces near-term baseline energy forecasts with uncertainty bounds and data guardrails."""

    def __init__(self, min_history_required: int = 6):
        self.min_history_required = min_history_required

    def forecast(
        self,
        records: List[NormalizedRecord],
        horizon: int = 6,
        method: str = "trend_augmented_moving_average"
    ) -> ForecastReport:
        if len(records) < self.min_history_required:
            return ForecastReport(
                status="insufficient_data",
                method=method,
                historical_points=len(records),
                horizon_intervals=horizon,
                points=[],
                model_metrics={},
                note=f"Insufficient history: {len(records)} data points available, but at least {self.min_history_required} are required for forecasting."
            )

        sorted_records = sorted(records, key=lambda r: r.timestamp)
        energies = [r.energy_kwh for r in sorted_records]
        timestamps = [r.timestamp for r in sorted_records]

        # Calculate time step interval
        if len(timestamps) >= 2:
            delta_seconds = (timestamps[-1] - timestamps[-2]).total_seconds()
            step_delta = timedelta(seconds=max(60, delta_seconds))
        else:
            step_delta = timedelta(hours=1)

        # Fit simple trend line using linear regression
        n = len(energies)
        x = np.arange(n)
        y = np.array(energies)

        # Slope and intercept: y = slope * x + intercept
        slope, intercept = np.polyfit(x, y, 1)

        # Residual standard error for confidence intervals
        fitted = slope * x + intercept
        residuals = y - fitted
        std_err = float(np.std(residuals)) if len(residuals) > 1 else 1.0
        z_multiplier = 1.96  # 95% confidence interval

        # Model evaluation metrics on historical backtest
        mae = float(np.mean(np.abs(residuals)))
        rmse = float(np.sqrt(np.mean(residuals ** 2)))

        points: List[ForecastPoint] = []
        last_time = timestamps[-1]

        for step in range(1, horizon + 1):
            future_x = n + step - 1
            pred = float(slope * future_x + intercept)
            # Combine trend prediction with recent moving average weight
            recent_ma = float(np.mean(energies[-min(6, n):]))
            blended_pred = 0.6 * pred + 0.4 * recent_ma
            blended_pred = max(0.0, blended_pred)

            margin = z_multiplier * std_err * np.sqrt(1 + 1/n + ((future_x - np.mean(x))**2) / np.sum((x - np.mean(x))**2 + 1e-6))
            lower = max(0.0, blended_pred - margin)
            upper = blended_pred + margin

            future_time = last_time + (step_delta * step)
            points.append(ForecastPoint(
                timestamp=future_time,
                predicted_energy_kwh=round(blended_pred, 2),
                lower_bound=round(lower, 2),
                upper_bound=round(upper, 2)
            ))

        return ForecastReport(
            status="success",
            method=method,
            historical_points=n,
            horizon_intervals=horizon,
            points=points,
            model_metrics={
                "mae": round(mae, 3),
                "rmse": round(rmse, 3),
                "trend_slope": round(float(slope), 4)
            },
            note="Baseline forecast generated using trend-augmented moving average with 95% confidence bounds."
        )
