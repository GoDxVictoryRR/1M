/**
 * Shared primitive components:
 *   - ScoreBar
 *   - Chip
 *   - EmptyState
 *   - InfoBlock
 *   - MetricRow
 *   - PeriodCell
 *
 * Per stitch::react-components: no hardcoded hex values, all via CSS tokens.
 */
import React from 'react';

/* ── ScoreBar ───────────────────────────────────────────────────────── */

export interface ScoreBarProps {
  readonly score: number;  // 0–100
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ score }) => (
  <div className="score-bar">
    <div className="score-bar-track">
      <div className="score-bar-fill" style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }} />
    </div>
    <span className="score-bar-label">{score}</span>
  </div>
);

/* ── Chip ───────────────────────────────────────────────────────────── */

export type ChipVariant = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan' | 'muted';

export interface ChipProps {
  readonly variant?: ChipVariant;
  readonly children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({ variant = 'muted', children }) => (
  <span className={`chip chip-${variant}`}>{children}</span>
);

/* ── EmptyState ─────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  readonly icon: React.ReactNode;
  readonly text: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, text }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <p className="empty-text">{text}</p>
  </div>
);

/* ── InfoBlock ──────────────────────────────────────────────────────── */

export type InfoVariant = 'ok' | 'warn' | 'info' | 'error';

export interface InfoBlockProps {
  readonly variant?: InfoVariant;
  readonly icon?: React.ReactNode;
  readonly children: React.ReactNode;
}

export const InfoBlock: React.FC<InfoBlockProps> = ({ variant = 'info', icon, children }) => (
  <div className={`info-block info-block--${variant}`}>
    {icon && <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>}
    <span>{children}</span>
  </div>
);

/* ── MetricRow ──────────────────────────────────────────────────────── */

export interface MetricRowProps {
  readonly label: string;
  readonly value: React.ReactNode;
}

export const MetricRow: React.FC<MetricRowProps> = ({ label, value }) => (
  <div className="metric-row">
    <span className="metric-key">{label}</span>
    <span className="metric-val">{value}</span>
  </div>
);

/* ── PeriodCell ─────────────────────────────────────────────────────── */

export interface PeriodCellProps {
  readonly label: string;
  readonly value: string;
  readonly valueColor?: string;
}

export const PeriodCell: React.FC<PeriodCellProps> = ({ label, value, valueColor }) => (
  <div className="period-cell">
    <div className="period-cell-label">{label}</div>
    <div className="period-cell-val" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
  </div>
);
