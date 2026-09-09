import pytest
from datetime import datetime, timezone
from packages.domain.ingestion.schema import NormalizedRecord
from packages.domain.factors.repository import FactorRepository
from packages.domain.metrics.calculator import MetricsCalculator

@pytest.fixture
def sample_records():
    return [
        NormalizedRecord(
            timestamp=datetime(2026, 3, 1, 0, 0, tzinfo=timezone.utc),
            resource_id="srv-1",
            resource_type="compute",
            utilization=0.40,
            energy_kwh=10.0,
            region="us-east"
        ),
        NormalizedRecord(
            timestamp=datetime(2026, 3, 1, 1, 0, tzinfo=timezone.utc),
            resource_id="srv-1",
            resource_type="compute",
            utilization=0.60,
            energy_kwh=20.0,
            region="us-east"
        ),
        NormalizedRecord(
            timestamp=datetime(2026, 3, 1, 2, 0, tzinfo=timezone.utc),
            resource_id="srv-1",
            resource_type="compute",
            utilization=0.80,
            energy_kwh=30.0,
            region="us-east"
        ),
        NormalizedRecord(
            timestamp=datetime(2026, 3, 1, 3, 0, tzinfo=timezone.utc),
            resource_id="srv-1",
            resource_type="compute",
            utilization=0.70,
            energy_kwh=40.0,
            region="us-east"
        ),
    ]

def test_metrics_energy_calculation(sample_records):
    repo = FactorRepository()
    calc = MetricsCalculator(repo)
    result = calc.calculate(sample_records)

    assert result.energy.total_energy_kwh.value == 100.0
    assert result.energy.total_energy_mwh.value == 0.1
    assert result.energy.average_hourly_kwh.value == 25.0
    assert result.energy.total_energy_kwh.unit == "kWh"

def test_metrics_emissions_calculation(sample_records):
    repo = FactorRepository()
    calc = MetricsCalculator(repo)
    result = calc.calculate(sample_records)

    # us-east factor is 0.312 kgCO2e/kWh
    # 100 kWh * 0.312 = 31.2 kgCO2e
    assert result.emissions.total_emissions_kgco2e.value == 31.2
    assert result.emissions.total_emissions_tco2e.value == 0.0312
    assert result.emissions.total_emissions_kgco2e.unit == "kgCO2e"
    assert "us-east" in result.emissions.regional_breakdown
    assert result.emissions.regional_breakdown["us-east"] == 31.2

def test_metrics_utilization_statistics(sample_records):
    repo = FactorRepository()
    calc = MetricsCalculator(repo)
    result = calc.calculate(sample_records)

    # Utils: 0.4, 0.6, 0.8, 0.7 -> mean = 0.625, peak = 0.8
    assert result.utilization.mean_utilization.value == 0.625
    assert result.utilization.peak_utilization.value == 0.8
    assert result.utilization.idle_capacity_ratio.value == pytest.approx(0.375, rel=1e-3)

def test_period_comparison(sample_records):
    repo = FactorRepository()
    calc = MetricsCalculator(repo)
    result = calc.calculate(sample_records)

    assert result.period_comparison is not None
    # baseline = 10 + 20 = 30 kWh, current = 30 + 40 = 70 kWh
    assert result.period_comparison.baseline_energy_kwh == 30.0
    assert result.period_comparison.current_energy_kwh == 70.0
    # (70 - 30) / 30 * 100 = 133.33%
    assert result.period_comparison.energy_delta_percent == 133.33
