/**
 * RecommendationCard — Institutional-grade sustainability intervention card.
 * Features:
 *   - Precision rank badge (#01, #02) with metallic accent
 *   - Prominent carbon & energy reduction badges
 *   - Dual score progress gauges (Impact Score & Confidence)
 *   - High-contrast execution target and prescribed action box
 */
import React from 'react';
import { Chip, ChipVariant } from './primitives';
import { TargetIcon, BoltIcon, LeafIcon, CheckIcon } from './icons';

export interface RecommendationItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly effort: string;
  readonly overall_score: number;
  readonly confidence_score: number;
  readonly target_resource: string;
  readonly estimated_energy_savings_kwh: number;
  readonly estimated_emissions_reduction_kgco2e: number;
  readonly suggested_action: string;
}

export interface RecommendationCardProps {
  readonly item: RecommendationItem;
  readonly rank: number;
}

const EFFORT_VARIANT: Record<string, ChipVariant> = {
  low: 'green',
  medium: 'blue',
  high: 'amber',
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ item, rank }) => {
  const effortVariant: ChipVariant = EFFORT_VARIANT[item.effort] ?? 'muted';
  const rankStr = rank < 10 ? `0${rank}` : `${rank}`;

  return (
    <article className="rec-card">
      {/* Top row: Rank, Title, Tags */}
      <div className="rec-card-header">
        <div className="rec-rank-badge">
          <span className="rec-rank-hash">#</span>
          <span className="rec-rank-num font-mono">{rankStr}</span>
        </div>

        <div className="rec-header-content">
          <div className="rec-title-row">
            <h3 className="rec-title">{item.title}</h3>
            <div className="rec-tags">
              <Chip variant="muted">{item.category.replace(/_/g, ' ')}</Chip>
              <Chip variant={effortVariant}>{item.effort.toUpperCase()} EFFORT</Chip>
            </div>
          </div>
          <p className="rec-desc">{item.description}</p>
        </div>
      </div>

      {/* Middle row: Savings Callout & Gauges */}
      <div className="rec-body-grid">
        {/* Savings summary pill group */}
        <div className="rec-savings-block">
          <div className="rec-saving-pill rec-saving-energy">
            <BoltIcon />
            <div className="rec-saving-data">
              <span className="rec-saving-label">Potential Energy Savings</span>
              <strong className="rec-saving-val font-mono">-{item.estimated_energy_savings_kwh} kWh</strong>
            </div>
          </div>

          <div className="rec-saving-pill rec-saving-carbon">
            <LeafIcon />
            <div className="rec-saving-data">
              <span className="rec-saving-label">Scope 2 Reduction</span>
              <strong className="rec-saving-val font-mono">-{item.estimated_emissions_reduction_kgco2e} kgCO₂e</strong>
            </div>
          </div>
        </div>

        {/* Dual Score Bars */}
        <div className="rec-scores-block">
          <div className="rec-score-row">
            <div className="rec-score-label-row">
              <span className="rec-score-label">Priority Score</span>
              <span className="rec-score-val font-mono">{item.overall_score.toFixed(1)} / 100</span>
            </div>
            <div className="rec-score-track">
              <div
                className="rec-score-fill score-brand-fill"
                style={{ width: `${Math.min(Math.max(item.overall_score, 0), 100)}%` }}
              />
            </div>
          </div>

          <div className="rec-score-row">
            <div className="rec-score-label-row">
              <span className="rec-score-label">Algorithmic Confidence</span>
              <span className="rec-score-val font-mono">{Math.round(item.confidence_score * 100)}%</span>
            </div>
            <div className="rec-score-track">
              <div
                className="rec-score-fill score-blue-fill"
                style={{ width: `${Math.min(Math.max(item.confidence_score * 100, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Target resource and suggested execution action */}
      <div className="rec-footer-row">
        <div className="rec-target-pill">
          <TargetIcon />
          <span>Target Resource:</span>
          <strong className="font-mono">{item.target_resource}</strong>
        </div>

        <div className="rec-action-pill">
          <CheckIcon />
          <span>Action: <strong>{item.suggested_action}</strong></span>
        </div>
      </div>
    </article>
  );
};
