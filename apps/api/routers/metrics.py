from fastapi import APIRouter, HTTPException
from typing import List

from apps.api.state import app_state
from packages.domain.metrics.models import MetricsSummary
from packages.domain.factors.repository import EmissionFactor

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

@router.get("/summary", response_model=MetricsSummary)
async def get_metrics_summary():
    """
    Returns deterministic carbon, energy, utilization, and period-over-period metrics
    calculated from the active dataset.
    """
    records = app_state.get_or_load_records()
    if not records:
        raise HTTPException(status_code=400, detail="No records available to calculate metrics")

    if app_state.last_metrics is None:
        app_state.last_metrics = app_state.metrics_calc.calculate(records)

    return app_state.last_metrics

@router.get("/factors", response_model=List[EmissionFactor])
async def list_emission_factors():
    """Returns the versioned emission factor registry."""
    return app_state.factor_repo.list_all()
