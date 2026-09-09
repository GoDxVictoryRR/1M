from pathlib import Path
from typing import List, Optional

from packages.domain.factors.repository import FactorRepository
from packages.domain.ingestion.schema import NormalizedRecord, DatasetSummary, IngestionResult
from packages.domain.ingestion.validator import DataIngestionValidator
from packages.domain.metrics.calculator import MetricsCalculator
from packages.domain.metrics.models import MetricsSummary

class AppStateManager:
    """Manages in-memory state, active dataset, and analytical services."""

    def __init__(self):
        factors_path = Path(__file__).resolve().parent.parent.parent / "data" / "factors" / "emission_factors.json"
        self.factor_repo = FactorRepository(factors_path)
        self.metrics_calc = MetricsCalculator(self.factor_repo)
        self.validator = DataIngestionValidator(strict=False)
        
        self.records: List[NormalizedRecord] = []
        self.summary: Optional[DatasetSummary] = None
        self.last_ingestion_result: Optional[IngestionResult] = None
        self.last_metrics: Optional[MetricsSummary] = None

    def set_ingestion_result(self, result: IngestionResult):
        self.records = result.records
        self.summary = result.summary
        self.last_ingestion_result = result
        if self.records:
            self.last_metrics = self.metrics_calc.calculate(self.records)
        else:
            self.last_metrics = None

    def load_demo_data(self) -> IngestionResult:
        demo_path = Path(__file__).resolve().parent.parent.parent / "data" / "demo" / "sample_operations.csv"
        result = self.validator.validate_csv(demo_path)
        self.set_ingestion_result(result)
        return result

    def get_or_load_records(self) -> List[NormalizedRecord]:
        if not self.records:
            self.load_demo_data()
        return self.records

app_state = AppStateManager()
