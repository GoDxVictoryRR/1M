import csv
from pathlib import Path
from typing import Dict, Any, List

REQUIRED_COLUMNS = {
    "timestamp",
    "resource_id",
    "resource_type",
    "utilization",
    "energy_kwh",
    "region"
}

def load_demo_csv(file_path: str | Path) -> Dict[str, Any]:
    """
    Validates and loads the demo CSV file.
    Returns dataset metadata and parsed rows.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Demo CSV not found at {path}")

    rows: List[Dict[str, Any]] = []
    with open(path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError("CSV file is empty or has no header")
        
        missing = REQUIRED_COLUMNS - set(reader.fieldnames)
        if missing:
            raise ValueError(f"CSV missing required columns: {', '.join(missing)}")

        total_energy = 0.0
        resource_ids = set()
        for idx, row in enumerate(reader):
            try:
                util = float(row["utilization"])
                energy = float(row["energy_kwh"])
            except ValueError as e:
                raise ValueError(f"Invalid numeric value at row {idx + 1}: {e}")

            if util < 0 or util > 1.0:
                raise ValueError(f"Utilization must be in [0, 1] at row {idx + 1}, got {util}")
            if energy < 0:
                raise ValueError(f"Energy kWh cannot be negative at row {idx + 1}, got {energy}")

            total_energy += energy
            resource_ids.add(row["resource_id"])
            rows.append(row)

    return {
        "status": "valid",
        "row_count": len(rows),
        "total_energy_kwh": round(total_energy, 2),
        "unique_resources": list(resource_ids),
        "start_timestamp": rows[0]["timestamp"] if rows else None,
        "end_timestamp": rows[-1]["timestamp"] if rows else None,
        "rows": rows
    }
