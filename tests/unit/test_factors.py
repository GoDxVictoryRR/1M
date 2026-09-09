import pytest
from packages.domain.factors.repository import FactorRepository

def test_load_factor_repository():
    repo = FactorRepository()
    factors = repo.list_all()
    assert len(factors) >= 4
    factor_ids = [f.factor_id for f in factors]
    assert "us-epa-egrid-rfce-2024" in factor_ids
    assert "us-epa-egrid-us-avg-2024" in factor_ids

def test_regional_factor_lookup():
    repo = FactorRepository()
    # Direct match
    east = repo.get_for_region("us-east")
    assert east.factor_id == "us-epa-egrid-rfce-2024"
    assert east.value == 0.312
    assert east.unit == "kgCO2e/kWh"

    # Case insensitive match
    west = repo.get_for_region(" US-WEST ")
    assert west.factor_id == "us-epa-egrid-camx-2024"
    assert west.value == 0.218

def test_factor_fallback():
    repo = FactorRepository()
    # Unmatched region should fall back to synthetic global default
    unknown = repo.get_for_region("unknown-region-xyz")
    assert unknown.factor_id == "synthetic-global-default-2026"
    assert unknown.is_synthetic is True
