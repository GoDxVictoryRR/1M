"""API Router for TerraOps Benchmark Evaluation."""
from fastapi import APIRouter
from packages.domain.evaluation.evaluator import BenchmarkEvaluator, EvaluationReport

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])

_evaluator = BenchmarkEvaluator()
_cached_report: EvaluationReport | None = None


@router.get("/run", response_model=EvaluationReport)
async def run_evaluation_suite():
    """Execute the empirical benchmark suite and calculate verified quality metrics."""
    global _cached_report
    report = await _evaluator.run_evaluation()
    _cached_report = report
    return report


@router.get("/latest", response_model=EvaluationReport)
async def get_latest_evaluation():
    """Retrieve the latest executed benchmark evaluation metrics."""
    global _cached_report
    if _cached_report is None:
        _cached_report = await _evaluator.run_evaluation()
    return _cached_report
