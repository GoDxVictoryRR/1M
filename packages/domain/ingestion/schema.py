from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RowValidationError(BaseModel):
    row_number: int
    field: str
    rejected_value: Optional[str] = None
    message: str
    error_code: str

class NormalizedRecord(BaseModel):
    timestamp: datetime
    resource_id: str
    resource_type: str
    utilization: float = Field(ge=0.0, le=1.0)
    energy_kwh: float = Field(ge=0.0)
    region: str

class DatasetSummary(BaseModel):
    total_rows: int
    valid_rows: int
    error_count: int
    unique_resources: int
    resource_types: List[str]
    regions: List[str]
    total_energy_kwh: float
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class IngestionResult(BaseModel):
    status: str  # "success", "partial", "failed"
    summary: DatasetSummary
    errors: List[RowValidationError]
    records: List[NormalizedRecord]
    raw_sample: List[Dict[str, Any]] = []
