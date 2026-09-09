import pytest
from pathlib import Path
from packages.domain.demo_loader import load_demo_csv

DEMO_CSV_PATH = Path("data/demo/sample_operations.csv")

def test_load_valid_demo_csv():
    assert DEMO_CSV_PATH.exists(), "Sample operations CSV must exist"
    result = load_demo_csv(DEMO_CSV_PATH)
    assert result["status"] == "valid"
    assert result["row_count"] == 24
    assert result["total_energy_kwh"] > 0
    assert "srv-compute-01" in result["unique_resources"]
    assert result["start_timestamp"] is not None

def test_missing_file_error(tmp_path):
    non_existent = tmp_path / "non_existent.csv"
    with pytest.raises(FileNotFoundError):
        load_demo_csv(non_existent)

def test_missing_columns_error(tmp_path):
    bad_csv = tmp_path / "missing_cols.csv"
    bad_csv.write_text("timestamp,resource_id\n2026-03-01T00:00:00Z,srv-1\n", encoding="utf-8")
    with pytest.raises(ValueError, match="CSV missing required columns"):
        load_demo_csv(bad_csv)

def test_invalid_utilization_error(tmp_path):
    bad_util = tmp_path / "bad_util.csv"
    bad_util.write_text(
        "timestamp,resource_id,resource_type,utilization,energy_kwh,region\n"
        "2026-03-01T00:00:00Z,srv-1,compute,1.5,10.0,us-east\n",
        encoding="utf-8"
    )
    with pytest.raises(ValueError, match="Utilization must be in \\[0, 1\\]"):
        load_demo_csv(bad_util)
