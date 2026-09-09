from typing import List, Dict, Optional
from collections import defaultdict
import numpy as np

from packages.domain.ingestion.schema import NormalizedRecord
from packages.domain.factors.repository import FactorRepository
from packages.domain.analytics.anomaly import AnomalyDetector
from packages.domain.recommendations.models import Recommendation, RecommendationReport

class RecommendationEngine:
    """Generates transparent, rule-based recommendations with deterministic multi-attribute scoring."""

    def __init__(self, factor_repository: FactorRepository):
        self.factor_repo = factor_repository
        self.anomaly_detector = AnomalyDetector(z_threshold=2.5)

    def generate_recommendations(
        self,
        records: List[NormalizedRecord],
        data_quality_score: float = 0.95
    ) -> RecommendationReport:
        if not records:
            return RecommendationReport(
                total_interventions=0,
                potential_energy_savings_kwh=0.0,
                potential_emissions_reduction_kgco2e=0.0,
                items=[]
            )

        total_fleet_energy = sum(r.energy_kwh for r in records)
        if total_fleet_energy <= 0.0:
            total_fleet_energy = 1.0

        recommendations: List[Recommendation] = []

        # Group records by resource
        by_resource: Dict[str, List[NormalizedRecord]] = defaultdict(list)
        for r in records:
            by_resource[r.resource_id].append(r)

        rec_counter = 1

        # 1. Evaluate Right-Sizing Rule
        for res_id, res_records in by_resource.items():
            utils = [r.utilization for r in res_records]
            mean_util = float(np.mean(utils))
            peak_util = float(np.max(utils))
            res_energy = sum(r.energy_kwh for r in res_records)
            region = res_records[0].region
            factor = self.factor_repo.get_for_region(region)

            # If average utilization is below 50% or peak is below 70%
            if mean_util < 0.50 and peak_util < 0.70:
                savings_kwh = res_energy * 0.35  # ~35% energy reduction from right-sizing
                emissions_reduction = savings_kwh * factor.value

                impact_score = min(100.0, (savings_kwh / total_fleet_energy) * 100.0 * 2.5)
                confidence = 0.90 if len(res_records) >= 10 else 0.75
                effort_score = 0.45  # Medium effort

                overall = (
                    (impact_score * 0.45) +
                    (confidence * 25.0) +
                    ((1.0 - effort_score) * 20.0) +
                    (data_quality_score * 10.0)
                )

                recommendations.append(Recommendation(
                    id=f"REC-RIGHTSIZE-{rec_counter:02d}",
                    title=f"Right-size Underutilized Resource {res_id}",
                    category="right_sizing",
                    target_resource=res_id,
                    description=(
                        f"Resource {res_id} exhibits an average utilization of {mean_util * 100:.1f}% "
                        f"(peak: {peak_util * 100:.1f}%). Downsizing instance allocation or CPU cores will "
                        f"eliminate idle capacity without impacting peak workloads."
                    ),
                    estimated_energy_savings_kwh=round(savings_kwh, 2),
                    estimated_emissions_reduction_kgco2e=round(emissions_reduction, 2),
                    impact_score=round(impact_score, 1),
                    confidence_score=round(confidence, 2),
                    effort="medium",
                    effort_score=effort_score,
                    data_quality_score=data_quality_score,
                    overall_score=round(overall, 1),
                    suggested_action=f"Reduce virtual allocation for {res_id} to match observed peak demand.",
                    provenance={
                        "rule": "mean_utilization < 0.50",
                        "observed_mean_util": round(mean_util, 3),
                        "observed_peak_util": round(peak_util, 3),
                        "factor_id": factor.factor_id,
                        "carbon_intensity": factor.value
                    }
                ))
                rec_counter += 1

        # 2. Evaluate Off-Peak Scheduling Rule
        for res_id, res_records in by_resource.items():
            offpeak_records = [r for r in res_records if r.timestamp.hour in [22, 23, 0, 1, 2, 3, 4, 5]]
            if offpeak_records:
                offpeak_utils = [r.utilization for r in offpeak_records]
                mean_offpeak_util = float(np.mean(offpeak_utils))
                offpeak_energy = sum(r.energy_kwh for r in offpeak_records)
                region = res_records[0].region
                factor = self.factor_repo.get_for_region(region)

                if mean_offpeak_util < 0.45 and offpeak_energy > 0.0:
                    savings_kwh = offpeak_energy * 0.60  # ~60% power down during idle night hours
                    emissions_reduction = savings_kwh * factor.value

                    impact_score = min(100.0, (savings_kwh / total_fleet_energy) * 100.0 * 2.5)
                    confidence = 0.85
                    effort_score = 0.20  # Low effort (automated cron / shutdown policy)

                    overall = (
                        (impact_score * 0.45) +
                        (confidence * 25.0) +
                        ((1.0 - effort_score) * 20.0) +
                        (data_quality_score * 10.0)
                    )

                    recommendations.append(Recommendation(
                        id=f"REC-SCHEDULE-{rec_counter:02d}",
                        title=f"Schedule Off-Peak Sleep Mode for {res_id}",
                        category="scheduling",
                        target_resource=res_id,
                        description=(
                            f"{res_id} consumed {offpeak_energy:.1f} kWh during off-peak hours (22:00–06:00) "
                            f"with low utilization averaging {mean_offpeak_util * 100:.1f}%. Scheduling automated standby "
                            f"avoids parasitic baseline consumption."
                        ),
                        estimated_energy_savings_kwh=round(savings_kwh, 2),
                        estimated_emissions_reduction_kgco2e=round(emissions_reduction, 2),
                        impact_score=round(impact_score, 1),
                        confidence_score=round(confidence, 2),
                        effort="low",
                        effort_score=effort_score,
                        data_quality_score=data_quality_score,
                        overall_score=round(overall, 1),
                        suggested_action=f"Apply automated off-peak power schedule to {res_id}.",
                        provenance={
                            "rule": "offpeak_utilization < 0.45",
                            "offpeak_hours_analyzed": len(offpeak_records),
                            "offpeak_energy_kwh": round(offpeak_energy, 2),
                            "factor_id": factor.factor_id
                        }
                    ))
                    rec_counter += 1

        # 3. Evaluate Anomaly Mitigation Rule
        anomaly_report = self.anomaly_detector.detect_zscore(records)
        critical_or_high = [a for a in anomaly_report.items if a.severity in ["critical", "high"]]
        if critical_or_high:
            for spike in critical_or_high[:2]: # Top 2 spikes
                excess_kwh = max(0.0, spike.actual_value - spike.expected_value)
                factor = self.factor_repo.get_for_region("us-east") # default region
                emissions_reduction = excess_kwh * factor.value

                impact_score = min(100.0, (excess_kwh / total_fleet_energy) * 100.0 * 3.0)
                confidence = 0.95
                effort_score = 0.30

                overall = (
                    (impact_score * 0.45) +
                    (confidence * 25.0) +
                    ((1.0 - effort_score) * 20.0) +
                    (data_quality_score * 10.0)
                )

                recommendations.append(Recommendation(
                    id=f"REC-ANOMALY-{rec_counter:02d}",
                    title=f"Remediate Power Surge on {spike.resource_id}",
                    category="anomaly_mitigation",
                    target_resource=spike.resource_id,
                    description=(
                        f"Observed an abnormal energy spike of {spike.actual_value:.1f} kWh on {spike.resource_id} "
                        f"({spike.anomaly_score:.1f} standard deviations above rolling baseline). Remediating the root "
                        f"cause will prevent recurring consumption spikes."
                    ),
                    estimated_energy_savings_kwh=round(excess_kwh, 2),
                    estimated_emissions_reduction_kgco2e=round(emissions_reduction, 2),
                    impact_score=round(impact_score, 1),
                    confidence_score=round(confidence, 2),
                    effort="low",
                    effort_score=effort_score,
                    data_quality_score=data_quality_score,
                    overall_score=round(overall, 1),
                    suggested_action=f"Inspect system processes and thermal cooling on {spike.resource_id} during timestamp {spike.timestamp.isoformat()}.",
                    provenance={
                        "rule": "z_score >= 2.5",
                        "anomaly_score": spike.anomaly_score,
                        "excess_kwh": round(excess_kwh, 2)
                    }
                ))
                rec_counter += 1

        # 4. Sort recommendations by overall_score descending
        recommendations.sort(key=lambda x: x.overall_score, reverse=True)

        tot_savings_kwh = sum(r.estimated_energy_savings_kwh for r in recommendations)
        tot_emissions_red = sum(r.estimated_emissions_reduction_kgco2e for r in recommendations)

        return RecommendationReport(
            total_interventions=len(recommendations),
            potential_energy_savings_kwh=round(tot_savings_kwh, 2),
            potential_emissions_reduction_kgco2e=round(tot_emissions_red, 2),
            items=recommendations
        )
