/**
 * KpiCard — Institutional-grade operational metric card.
 * Features:
 *   - Geist Mono typography for high-density numbers
 *   - Micro SVG Sparklines with gradient area fill
 *   - Utilization & capacity multi-stop gauges
 *   - Glassmorphic surface with dynamic accent lighting
 *   - Trend badges with direction vectors
 */
import React from 'react';
import { TrendUpIcon, TrendDownIcon } from './icons';

export interface KpiCardProps {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly unit?: string;
  readonly detail?: string;
  /** CSS color value — sets bottom stripe + badge color */
  readonly accent?: string;
  readonly badgeLabel?: string;
  readonly badgeBg?: string;
  readonly badgeBorder?: string;
  readonly trend?: {
    readonly value: string;
    readonly isPositive?: boolean;
    readonly label?: string;
  };
  readonly sparklineData?: number[];
  readonly progress?: {
    readonly value: number;
    readonly max?: number;
    readonly peak?: number;
    readonly p95?: number;
  };
  readonly isEmpty?: boolean;
}

/** Helper to generate smooth SVG path from numerical series */
function generateSparklinePath(data: number[], width = 160, height = 36): { linePath: string; areaPath: string } {
  if (!data || data.length < 2) return { linePath: '', areaPath: '' };

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;
  const usableH = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * usableH;
    return [x, y] as [number, number];
  });

  // Polyline path
  const linePath = points.reduce((acc, [x, y], i) => `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`, '');
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return { linePath, areaPath };
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label, value, unit, detail,
  accent = 'var(--brand)',
  badgeLabel, badgeBg, badgeBorder,
  trend, sparklineData, progress,
  isEmpty = false,
}) => {
  const customProps = {
    '--kpi-accent': accent,
    '--kpi-badge-bg': badgeBg ?? 'var(--brand-dim)',
    '--kpi-badge-border': badgeBorder ?? 'rgba(0,212,126,0.25)',
  } as React.CSSProperties;

  const gradId = React.useId().replace(/:/g, '');
  const { linePath, areaPath } = sparklineData && sparklineData.length > 1
    ? generateSparklinePath(sparklineData)
    : { linePath: '', areaPath: '' };

  return (
    <div className="kpi-card" style={customProps}>
      {/* Top row: Label + Badges */}
      <div className="kpi-card-header">
        <span className="kpi-label">{label}</span>
        <div className="kpi-badges">
          {trend && (
            <span className={`kpi-trend-pill ${trend.isPositive ? 'trend-up' : 'trend-down'}`}>
              {trend.isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
              <span>{trend.value}</span>
            </span>
          )}
          {badgeLabel && (
            <span
              className="kpi-badge"
              style={{
                background: 'var(--kpi-badge-bg)',
                color: accent,
                borderColor: 'var(--kpi-badge-border)',
              }}
            >
              {badgeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Main value display */}
      <div className="kpi-value-row">
        {isEmpty ? (
          <div className="kpi-value kpi-empty">
            <span>Awaiting telemetry</span>
          </div>
        ) : (
          <div className="kpi-value">
            <span className="kpi-num">{value}</span>
            {unit && <span className="kpi-unit">{unit}</span>}
          </div>
        )}
      </div>

      {/* Inline Data Visualizations */}
      {!isEmpty && sparklineData && sparklineData.length > 1 && (
        <div className="kpi-sparkline-wrap" aria-hidden="true">
          <svg viewBox="0 0 160 36" className="kpi-sparkline" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
                <stop offset="100%" stopColor={accent} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#spark-${gradId})`} />
            <path d={linePath} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Progress / Gauge bar */}
      {!isEmpty && progress && (
        <div className="kpi-progress-wrap" aria-label={`Capacity: ${progress.value}%`}>
          <div className="kpi-progress-bar">
            <div
              className="kpi-progress-fill"
              style={{
                width: `${Math.min(Math.max(progress.value, 0), 100)}%`,
                background: accent,
              }}
            />
            {progress.p95 !== undefined && (
              <div
                className="kpi-progress-marker p95-marker"
                style={{ left: `${Math.min(progress.p95, 100)}%` }}
                title={`P95: ${progress.p95}%`}
              />
            )}
            {progress.peak !== undefined && (
              <div
                className="kpi-progress-marker peak-marker"
                style={{ left: `${Math.min(progress.peak, 100)}%` }}
                title={`Peak: ${progress.peak}%`}
              />
            )}
          </div>
          <div className="kpi-progress-meta">
            <span>0%</span>
            {progress.p95 !== undefined && <span>P95 {progress.p95}%</span>}
            {progress.peak !== undefined && <span>Peak {progress.peak}%</span>}
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Detail caption */}
      {detail && !isEmpty && <div className="kpi-detail">{detail}</div>}
    </div>
  );
};
