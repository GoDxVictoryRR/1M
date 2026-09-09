from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any

class MetricValue(BaseModel):
    name: str
    value: float
    unit: str
    factor_id: Optional[str] = None
    source: Optional[str] = None
    calculation_version: str = "v1.0"
    uncertainty_note: Optional[str] = None

class UtilizationMetrics(BaseModel):
    mean_utilization: MetricValue
    peak_utilization: MetricValue
    p95_utilization: MetricValue
    idle_capacity_ratio: MetricValue

class EnergyMetrics(BaseModel):
    total_energy_kwh: MetricValue
    total_energy_mwh: MetricValue
    average_hourly_kwh: MetricValue

class EmissionsMetrics(BaseModel):
    total_emissions_kgco2e: MetricValue
    total_emissions_tco2e: MetricValue
    factors_applied: List[str]
    regional_breakdown: Dict[str, float]

class PeriodComparison(BaseModel):
    baseline_energy_kwh: float
    current_energy_kwh: float
    energy_delta_percent: float
    baseline_emissions_kgco2e: float
    current_emissions_kgco2e: float
    emissions_delta_percent: float
    description: str

class MetricsSummary(BaseModel):
    calculation_version: str = "v1.0"
    records_count: int
    energy: EnergyMetrics
    emissions: EmissionsMetrics
    utilization: UtilizationMetrics
    period_comparison: Optional[PeriodComparison] = None
    by_resource_type: Dict[str, Dict[str, float]] = Field(default_factory=dict)
