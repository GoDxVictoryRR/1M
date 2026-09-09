from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Recommendation(BaseModel):
    id: str
    title: str
    category: str
    target_resource: str
    description: str
    estimated_energy_savings_kwh: float
    estimated_emissions_reduction_kgco2e: float
    impact_score: float = Field(ge=0.0, le=100.0)
    confidence_score: float = Field(ge=0.0, le=1.0)
    effort: str  # "low", "medium", "high"
    effort_score: float = Field(ge=0.0, le=1.0)
    data_quality_score: float = Field(ge=0.0, le=1.0)
    overall_score: float = Field(ge=0.0, le=100.0)
    suggested_action: str
    provenance: Dict[str, Any] = Field(default_factory=dict)

class RecommendationReport(BaseModel):
    total_interventions: int
    potential_energy_savings_kwh: float
    potential_emissions_reduction_kgco2e: float
    items: List[Recommendation]
