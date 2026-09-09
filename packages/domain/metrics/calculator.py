import numpy as np
from typing import List, Dict
from collections import defaultdict

from packages.domain.ingestion.schema import NormalizedRecord
from packages.domain.factors.repository import FactorRepository
from packages.domain.metrics.models import (
    MetricValue,
    EnergyMetrics,
    EmissionsMetrics,
    UtilizationMetrics,
    PeriodComparison,
    MetricsSummary
)

CALCULATION_VERSION = "v1.0.0"

class MetricsCalculator:
    """Calculates deterministic energy, emissions, and utilization metrics."""

    def __init__(self, factor_repository: FactorRepository):
        self.factor_repo = factor_repository

    def calculate(self, records: List[NormalizedRecord]) -> MetricsSummary:
        if not records:
            raise ValueError("Cannot calculate metrics on empty records list")

        # 1. Energy metrics
        energy_values = [r.energy_kwh for r in records]
        total_energy_kwh = sum(energy_values)
        total_energy_mwh = total_energy_kwh / 1000.0
        avg_hourly_kwh = float(np.mean(energy_values))

        energy_summary = EnergyMetrics(
            total_energy_kwh=MetricValue(
                name="Total Energy Consumption",
                value=round(total_energy_kwh, 3),
                unit="kWh",
                calculation_version=CALCULATION_VERSION,
                uncertainty_note="Sum of reported operational energy telemetry"
            ),
            total_energy_mwh=MetricValue(
                name="Total Energy (MWh)",
                value=round(total_energy_mwh, 4),
                unit="MWh",
                calculation_version=CALCULATION_VERSION
            ),
            average_hourly_kwh=MetricValue(
                name="Average Hourly Energy Rate",
                value=round(avg_hourly_kwh, 3),
                unit="kWh/interval",
                calculation_version=CALCULATION_VERSION
            )
        )

        # 2. Emissions metrics
        total_emissions_kg = 0.0
        regional_breakdown: Dict[str, float] = defaultdict(float)
        applied_factors = set()
        by_resource: Dict[str, Dict[str, float]] = defaultdict(lambda: {"energy_kwh": 0.0, "emissions_kgco2e": 0.0})

        for r in records:
            factor = self.factor_repo.get_for_region(r.region)
            applied_factors.add(f"{factor.factor_id} ({factor.value} {factor.unit})")
            emissions = r.energy_kwh * factor.value
            total_emissions_kg += emissions
            regional_breakdown[r.region] += emissions
            by_resource[r.resource_type]["energy_kwh"] += r.energy_kwh
            by_resource[r.resource_type]["emissions_kgco2e"] += emissions

        total_emissions_t = total_emissions_kg / 1000.0

        emissions_summary = EmissionsMetrics(
            total_emissions_kgco2e=MetricValue(
                name="Estimated Scope 2 Emissions",
                value=round(total_emissions_kg, 3),
                unit="kgCO2e",
                source="Derived from regional location-based grid emission factors",
                calculation_version=CALCULATION_VERSION,
                uncertainty_note="Scope 2 location-based estimate based on reported kWh"
            ),
            total_emissions_tco2e=MetricValue(
                name="Estimated Scope 2 Emissions (Metric Tons)",
                value=round(total_emissions_t, 4),
                unit="tCO2e",
                calculation_version=CALCULATION_VERSION
            ),
            factors_applied=sorted(list(applied_factors)),
            regional_breakdown={k: round(v, 3) for k, v in regional_breakdown.items()}
        )

        # 3. Utilization statistics
        util_values = [r.utilization for r in records]
        mean_util = float(np.mean(util_values))
        peak_util = float(np.max(util_values))
        p95_util = float(np.percentile(util_values, 95))
        idle_ratio = max(0.0, 1.0 - mean_util)

        util_summary = UtilizationMetrics(
            mean_utilization=MetricValue(
                name="Mean Utilization",
                value=round(mean_util, 4),
                unit="ratio",
                calculation_version=CALCULATION_VERSION
            ),
            peak_utilization=MetricValue(
                name="Peak Utilization",
                value=round(peak_util, 4),
                unit="ratio",
                calculation_version=CALCULATION_VERSION
            ),
            p95_utilization=MetricValue(
                name="95th Percentile Utilization",
                value=round(p95_util, 4),
                unit="ratio",
                calculation_version=CALCULATION_VERSION
            ),
            idle_capacity_ratio=MetricValue(
                name="Estimated Idle Capacity",
                value=round(idle_ratio, 4),
                unit="ratio",
                calculation_version=CALCULATION_VERSION,
                uncertainty_note="Fraction of unused allocated capacity (1.0 - mean_utilization)"
            )
        )

        # 4. Period-over-Period Comparison
        period_comp = None
        if len(records) >= 4:
            sorted_records = sorted(records, key=lambda x: x.timestamp)
            halfway = len(sorted_records) // 2
            baseline = sorted_records[:halfway]
            current = sorted_records[halfway:]

            b_energy = sum(r.energy_kwh for r in baseline)
            c_energy = sum(r.energy_kwh for r in current)
            energy_delta_pct = round(((c_energy - b_energy) / b_energy * 100.0) if b_energy > 0 else 0.0, 2)

            b_emissions = sum(r.energy_kwh * self.factor_repo.get_for_region(r.region).value for r in baseline)
            c_emissions = sum(r.energy_kwh * self.factor_repo.get_for_region(r.region).value for r in current)
            emissions_delta_pct = round(((c_emissions - b_emissions) / b_emissions * 100.0) if b_emissions > 0 else 0.0, 2)

            period_comp = PeriodComparison(
                baseline_energy_kwh=round(b_energy, 2),
                current_energy_kwh=round(c_energy, 2),
                energy_delta_percent=energy_delta_pct,
                baseline_emissions_kgco2e=round(b_emissions, 2),
                current_emissions_kgco2e=round(c_emissions, 2),
                emissions_delta_percent=emissions_delta_pct,
                description=f"Comparison of first {halfway} intervals against latter {len(current)} intervals"
            )

        # Round resource breakdown
        formatted_by_resource = {
            res: {k: round(v, 3) for k, v in vals.items()}
            for res, vals in by_resource.items()
        }

        return MetricsSummary(
            calculation_version=CALCULATION_VERSION,
            records_count=len(records),
            energy=energy_summary,
            emissions=emissions_summary,
            utilization=util_summary,
            period_comparison=period_comp,
            by_resource_type=formatted_by_resource
        )
