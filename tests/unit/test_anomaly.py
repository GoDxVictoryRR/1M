import pytest
from datetime import datetime, timezone, timedelta
from packages.domain.ingestion.schema import NormalizedRecord
from packages.domain.analytics.anomaly import AnomalyDetector
from packages.domain.ingestion.validator import DataIngestionValidator

def test_detect_known_anomaly_in_sample_csv():
    validator = DataIngestionValidator()
    result = validator.validate_csv("data/demo/sample_operations.csv")
    assert result.status == "success"

    detector = AnomalyDetector(z_threshold=2.5)
    report = detector.detect_zscore(result.records)

    assert report.total_records_analyzed == 24
    assert report.anomalies_detected >= 1

    # Check for the known spike at 13:00 (energy_kwh = 35.4)
    spike_items = [item for item in report.items if item.actual_value >= 35.0]
    assert len(spike_items) == 1
    spike = spike_items[0]
    assert spike.resource_id == "srv-compute-01"
    assert spike.anomaly_score >= 2.5
    assert spike.severity in ["medium", "high", "critical"]
    assert "Spike detected" in spike.explanation
    assert "standard deviations" in spike.explanation

def test_detect_isolation_forest():
    validator = DataIngestionValidator()
    result = validator.validate_csv("data/demo/sample_operations.csv")
    detector = AnomalyDetector()

    report = detector.detect_isolation_forest(result.records, contamination=0.08)
    assert report.method == "isolation_forest"
    assert report.total_records_analyzed == 24
    assert report.anomalies_detected >= 1

def test_insufficient_records_for_anomaly():
    few_records = [
        NormalizedRecord(
            timestamp=datetime(2026, 3, 1, i, 0, tzinfo=timezone.utc),
            resource_id="srv-1",
            resource_type="compute",
            utilization=0.5,
            energy_kwh=10.0,
            region="us-east"
        )
        for i in range(2)
    ]
    detector = AnomalyDetector()
    report = detector.detect_zscore(few_records)
    assert report.anomalies_detected == 0
    assert len(report.items) == 0
