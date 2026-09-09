from fastapi import APIRouter, HTTPException
from typing import Optional

from apps.api.state import app_state
from packages.domain.recommendations.models import Recommendation, RecommendationReport
from packages.domain.recommendations.engine import RecommendationEngine

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

engine = RecommendationEngine(app_state.factor_repo)

@router.get("", response_model=RecommendationReport)
async def get_recommendations():
    """
    Generates prioritized sustainability recommendations ranked by multi-factor scoring
    (impact, confidence, effort, data quality). Calculated 100% deterministically.
    """
    records = app_state.get_or_load_records()
    if not records:
        raise HTTPException(status_code=400, detail="No active dataset available for recommendations")

    # Data quality score from summary if available
    dq_score = 0.95
    if app_state.summary and app_state.summary.total_rows > 0:
        dq_score = app_state.summary.valid_rows / app_state.summary.total_rows

    return engine.generate_recommendations(records, data_quality_score=dq_score)

@router.get("/{rec_id}", response_model=Recommendation)
async def get_recommendation_by_id(rec_id: str):
    """Fetches details and calculation provenance for a specific recommendation."""
    report = await get_recommendations()
    for item in report.items:
        if item.id.lower() == rec_id.lower():
            return item
    raise HTTPException(status_code=404, detail=f"Recommendation '{rec_id}' not found")
