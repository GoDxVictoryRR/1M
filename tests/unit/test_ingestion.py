import pytest
from packages.domain.ingestion.validator import DataIngestionValidator

VALID_CSV = """timestamp,resource_id,resource_type,utilization,energy_kwh,region
2026-03-01T00:00:00Z,srv-1,compute,0.50,10.0,us-east
2026-03-01T01:00:00Z,srv-1,compute,0.60,12.0,us-east
"""

def test_valid_csv_ingestion():
    validator = DataIngestionValidator()
    result = validator.validate_csv(VALID_CSV)
    assert result.status == "success"
    assert result.summary.total_rows == 2
    assert result.summary.valid_rows == 2
    assert result.summary.error_count == 0
    assert result.summary.total_energy_kwh == 22.0
    assert len(result.records) == 2
    assert result.records[0].resource_id == "srv-1"
    assert result.records[0].utilization == 0.50

def test_missing_columns_error():
    validator = DataIngestionValidator()
    bad_csv = "timestamp,resource_id\n2026-03-01T00:00:00Z,srv-1\n"
    with pytest.raises(ValueError, match="CSV missing required columns"):
        validator.validate_csv(bad_csv)

def test_empty_content_error():
    validator = DataIngestionValidator()
    with pytest.raises(ValueError, match="CSV input is empty"):
        validator.validate_csv("   \n  ")

def test_row_level_validation_errors():
    validator = DataIngestionValidator(strict=False)
    csv_with_errors = """timestamp,resource_id,resource_type,utilization,energy_kwh,region
2026-03-01T00:00:00Z,srv-1,compute,0.40,10.0,us-east
invalid-time,srv-2,compute,0.50,15.0,us-east
2026-03-01T02:00:00Z,srv-3,compute,1.80,20.0,us-east
2026-03-01T03:00:00Z,srv-4,compute,0.30,-5.0,us-east
2026-03-01T04:00:00Z,srv-5,compute,0.70,14.0,us-east
"""
    result = validator.validate_csv(csv_with_errors)
    assert result.status == "partial"
    assert result.summary.valid_rows == 2  # srv-1 and srv-5
    assert result.summary.error_count == 3
    error_fields = [e.field for e in result.errors]
    assert "timestamp" in error_fields
    assert "utilization" in error_fields
    assert "energy_kwh" in error_fields

def test_strict_mode_failure():
    validator = DataIngestionValidator(strict=True)
    bad_row_csv = """timestamp,resource_id,resource_type,utilization,energy_kwh,region
2026-03-01T00:00:00Z,srv-1,compute,1.5,10.0,us-east
"""
    with pytest.raises(ValueError, match="Strict validation failed"):
        validator.validate_csv(bad_row_csv)
