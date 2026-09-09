import pytest
from packages.domain.ingestion.validator import DataIngestionValidator
from packages.domain.factors.repository import FactorRepository
from packages.domain.recommendations.engine import RecommendationEngine

def test_generate_recommendations_without_llm():
    validator = DataIngestionValidator()
    result = validator.validate_csv("data/demo/sample_operations.csv")
    factor_repo = FactorRepository()
    engine = RecommendationEngine(factor_repo)

    report = engine.generate_recommendations(result.records)

    assert report.total_interventions >= 2
    assert report.potential_energy_savings_kwh > 0.0
    assert report.potential_emissions_reduction_kgco2e > 0.0
    assert len(report.items) >= 2

    # Check sorting: highest overall score first
    scores = [item.overall_score for item in report.items]
    assert scores == sorted(scores, reverse=True), "Recommendations must be sorted descending by overall_score"

def test_recommendation_scoring_transparency():
    validator = DataIngestionValidator()
    result = validator.validate_csv("data/demo/sample_operations.csv")
    factor_repo = FactorRepository()
    engine = RecommendationEngine(factor_repo)

    report = engine.generate_recommendations(result.records, data_quality_score=0.9)
    first = report.items[0]

    # Verify score components
    assert 0.0 <= first.impact_score <= 100.0
    assert 0.0 <= first.confidence_score <= 1.0
    assert 0.0 <= first.effort_score <= 1.0
    assert 0.0 <= first.data_quality_score <= 1.0
    assert 0.0 <= first.overall_score <= 100.0

    # Verify mathematical formula calculation
    expected_overall = (
        (first.impact_score * 0.45) +
        (first.confidence_score * 25.0) +
        ((1.0 - first.effort_score) * 20.0) +
        (first.data_quality_score * 10.0)
    )
    assert first.overall_score == pytest.approx(expected_overall, abs=0.2)

def test_empty_dataset_recommendations():
    factor_repo = FactorRepository()
    engine = RecommendationEngine(factor_repo)
    report = engine.generate_recommendations([])
    assert report.total_interventions == 0
    assert report.potential_energy_savings_kwh == 0.0
    assert len(report.items) == 0
