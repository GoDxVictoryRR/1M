import pytest
from datetime import datetime, timezone, timedelta
from packages.domain.ingestion.schema import NormalizedRecord
from packages.domain.analytics.forecasting import TimeSeriesForecaster
from packages.domain.ingestion.validator import DataIngestionValidator

def test_forecast_baseline_with_sample_data():
    validator = DataIngestionValidator()
    result = validator.validate_csv("data/demo/sample_operations.csv")
    forecaster = TimeSeriesForecaster(min_history_required=6)

    report = forecaster.forecast(result.records, horizon=6)
    assert report.status == "success"
    assert report.historical_points == 24
    assert report.horizon_intervals == 6
    assert len(report.points) == 6

    # Verify each forecast point schema and bounds
    for pt in report.points:
        assert pt.predicted_energy_kwh >= 0.0
        assert pt.lower_bound >= 0.0
        assert pt.upper_bound >= pt.lower_bound

    # Verify model evaluation metrics are recorded
    assert "mae" in report.model_metrics
    assert "rmse" in report.model_metrics
    assert "trend_slope" in report.model_metrics

def test_forecast_insufficient_data_guardrail():
    few_records = [
        NormalizedRecord(
            timestamp=datetime(2026, 3, 1, i, 0, tzinfo=timezone.utc),
            resource_id="srv-1",
            resource_type="compute",
            utilization=0.5,
            energy_kwh=10.0 + i,
            region="us-east"
        )
        for i in range(4) # Only 4 points, min is 6
    ]
    forecaster = TimeSeriesForecaster(min_history_required=6)
    report = forecaster.forecast(few_records, horizon=6)

    assert report.status == "insufficient_data"
    assert len(report.points) == 0
    assert "Insufficient history" in (report.note or "")
