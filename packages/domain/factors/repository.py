import json
from pathlib import Path
from typing import Dict, List, Optional
from pydantic import BaseModel

class EmissionFactor(BaseModel):
    factor_id: str
    name: str
    value: float
    unit: str
    geography: str
    scope: str
    source: str
    effective_date: Optional[str] = None
    is_synthetic: bool = False
    notes: Optional[str] = None

class FactorRepository:
    """Repository managing versioned carbon emission and intensity factors."""

    def __init__(self, factors_file_path: Optional[str | Path] = None):
        if factors_file_path is None:
            # Default location
            factors_file_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "factors" / "emission_factors.json"
        self.path = Path(factors_file_path)
        self.version: str = "unknown"
        self._factors: Dict[str, EmissionFactor] = {}
        self._region_index: Dict[str, EmissionFactor] = {}
        self._load()

    def _load(self):
        if not self.path.exists():
            raise FileNotFoundError(f"Emission factor file not found: {self.path}")

        with open(self.path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.version = data.get("version", "1.0")
        for item in data.get("factors", []):
            factor = EmissionFactor(**item)
            self._factors[factor.factor_id] = factor
            # Map geography lowercase
            self._region_index[factor.geography.lower()] = factor

    def get_by_id(self, factor_id: str) -> Optional[EmissionFactor]:
        return self._factors.get(factor_id)

    def get_for_region(self, region: str) -> EmissionFactor:
        """Finds factor for region, falling back to national or synthetic global default."""
        cleaned = region.strip().lower()
        if cleaned in self._region_index:
            return self._region_index[cleaned]
        
        # Check US fallback
        if "us" in cleaned and "us" in self._region_index:
            return self._region_index["us"]
            
        # Global synthetic fallback
        if "global-default" in self._region_index:
            return self._region_index["global-default"]

        # First factor if available
        if self._factors:
            return next(iter(self._factors.values()))

        raise ValueError(f"No emission factor found or fallback available for region '{region}'")

    def list_all(self) -> List[EmissionFactor]:
        return list(self._factors.values())
