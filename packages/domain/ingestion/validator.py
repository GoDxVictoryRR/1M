import csv
import io
from datetime import datetime, timezone
from typing import List, Dict, Any, Union
from pathlib import Path

from packages.domain.ingestion.schema import (
    NormalizedRecord,
    RowValidationError,
    DatasetSummary,
    IngestionResult
)

REQUIRED_COLUMNS = [
    "timestamp",
    "resource_id",
    "resource_type",
    "utilization",
    "energy_kwh",
    "region"
]

def parse_iso_datetime(value: str) -> datetime:
    """Parses ISO timestamp string into timezone-aware datetime."""
    cleaned = value.strip()
    if cleaned.endswith("Z"):
        cleaned = cleaned[:-1] + "+00:00"
    dt = datetime.fromisoformat(cleaned)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

class DataIngestionValidator:
    """Validates and parses operational telemetry CSV data."""

    def __init__(self, strict: bool = False):
        self.strict = strict

    def validate_csv(self, content_or_path: Union[str, Path, io.StringIO]) -> IngestionResult:
        if isinstance(content_or_path, Path) or (isinstance(content_or_path, str) and "\n" not in content_or_path and Path(content_or_path).exists()):
            with open(content_or_path, "r", encoding="utf-8") as f:
                content = f.read()
        elif isinstance(content_or_path, io.StringIO):
            content = content_or_path.getvalue()
        else:
            content = str(content_or_path)

        if not content or not content.strip():
            raise ValueError("CSV input is empty")

        reader = csv.DictReader(io.StringIO(content.strip()))
        if not reader.fieldnames:
            raise ValueError("CSV input is missing headers")

        fieldnames_set = {fn.strip() for fn in reader.fieldnames if fn}
        missing_cols = [col for col in REQUIRED_COLUMNS if col not in fieldnames_set]
        if missing_cols:
            raise ValueError(f"CSV missing required columns: {', '.join(missing_cols)}")

        normalized_records: List[NormalizedRecord] = []
        errors: List[RowValidationError] = []
        raw_rows: List[Dict[str, Any]] = []

        total_energy = 0.0
        unique_resources = set()
        resource_types = set()
        regions = set()
        timestamps = []

        for row_num, raw in enumerate(reader, start=2): # 1-based index with header at row 1
            raw_clean = {k.strip(): v.strip() for k, v in raw.items() if k and v is not None}
            if len(raw_rows) < 50:
                raw_rows.append(raw_clean)

            row_has_error = False

            # 1. Validate timestamp
            raw_ts = raw_clean.get("timestamp", "")
            parsed_dt = None
            if not raw_ts:
                errors.append(RowValidationError(
                    row_number=row_num,
                    field="timestamp",
                    rejected_value=raw_ts,
                    message="Timestamp cannot be empty",
                    error_code="MISSING_TIMESTAMP"
                ))
                row_has_error = True
            else:
                try:
                    parsed_dt = parse_iso_datetime(raw_ts)
                except Exception as e:
                    errors.append(RowValidationError(
                        row_number=row_num,
                        field="timestamp",
                        rejected_value=raw_ts,
                        message=f"Invalid ISO timestamp format: {e}",
                        error_code="INVALID_TIMESTAMP_FORMAT"
                    ))
                    row_has_error = True

            # 2. Validate resource_id
            res_id = raw_clean.get("resource_id", "")
            if not res_id:
                errors.append(RowValidationError(
                    row_number=row_num,
                    field="resource_id",
                    rejected_value=res_id,
                    message="Resource ID cannot be empty",
                    error_code="EMPTY_RESOURCE_ID"
                ))
                row_has_error = True

            # 3. Validate resource_type
            res_type = raw_clean.get("resource_type", "")
            if not res_type:
                errors.append(RowValidationError(
                    row_number=row_num,
                    field="resource_type",
                    rejected_value=res_type,
                    message="Resource type cannot be empty",
                    error_code="EMPTY_RESOURCE_TYPE"
                ))
                row_has_error = True

            # 4. Validate utilization
            raw_util = raw_clean.get("utilization", "")
            util_val = None
            try:
                util_val = float(raw_util)
                if util_val < 0.0 or util_val > 1.0:
                    errors.append(RowValidationError(
                        row_number=row_num,
                        field="utilization",
                        rejected_value=raw_util,
                        message="Utilization must be a ratio between 0.0 and 1.0",
                        error_code="UTILIZATION_OUT_OF_BOUNDS"
                    ))
                    row_has_error = True
            except (ValueError, TypeError):
                errors.append(RowValidationError(
                    row_number=row_num,
                    field="utilization",
                    rejected_value=raw_util,
                    message="Utilization must be a valid floating point number",
                    error_code="INVALID_UTILIZATION_NUMBER"
                ))
                row_has_error = True

            # 5. Validate energy_kwh
            raw_energy = raw_clean.get("energy_kwh", "")
            energy_val = None
            try:
                energy_val = float(raw_energy)
                if energy_val < 0.0:
                    errors.append(RowValidationError(
                        row_number=row_num,
                        field="energy_kwh",
                        rejected_value=raw_energy,
                        message="Energy consumption (kWh) cannot be negative",
                        error_code="NEGATIVE_ENERGY"
                    ))
                    row_has_error = True
            except (ValueError, TypeError):
                errors.append(RowValidationError(
                    row_number=row_num,
                    field="energy_kwh",
                    rejected_value=raw_energy,
                    message="Energy consumption must be a valid number",
                    error_code="INVALID_ENERGY_NUMBER"
                ))
                row_has_error = True

            # 6. Validate region
            region_val = raw_clean.get("region", "")
            if not region_val:
                errors.append(RowValidationError(
                    row_number=row_num,
                    field="region",
                    rejected_value=region_val,
                    message="Region cannot be empty",
                    error_code="EMPTY_REGION"
                ))
                row_has_error = True

            if row_has_error and self.strict:
                raise ValueError(f"Strict validation failed at row {row_num}: {errors[-1].message}")

            if not row_has_error and parsed_dt and util_val is not None and energy_val is not None:
                record = NormalizedRecord(
                    timestamp=parsed_dt,
                    resource_id=res_id,
                    resource_type=res_type,
                    utilization=util_val,
                    energy_kwh=energy_val,
                    region=region_val
                )
                normalized_records.append(record)
                total_energy += energy_val
                unique_resources.add(res_id)
                resource_types.add(res_type)
                regions.add(region_val)
                timestamps.append(parsed_dt)

        total_rows = len(normalized_records) + len({e.row_number for e in errors})
        timestamps.sort()

        summary = DatasetSummary(
            total_rows=total_rows,
            valid_rows=len(normalized_records),
            error_count=len(errors),
            unique_resources=len(unique_resources),
            resource_types=sorted(list(resource_types)),
            regions=sorted(list(regions)),
            total_energy_kwh=round(total_energy, 3),
            start_time=timestamps[0] if timestamps else None,
            end_time=timestamps[-1] if timestamps else None
        )

        status = "success" if not errors else ("partial" if normalized_records else "failed")

        return IngestionResult(
            status=status,
            summary=summary,
            errors=errors,
            records=normalized_records,
            raw_sample=raw_rows
        )
