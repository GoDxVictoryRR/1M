/**
 * ForecastChart — Institutional SVG visualization for energy demand forecasting.
 * Features:
 *   - 95% Statistical confidence interval corridor (shaded ribbon polygon)
 *   - Luminous predicted trajectory line with hover nodes
 *   - Precision Y/X grid calibration in Geist Mono
 *   - Accuracy metric pills (MAE, RMSE, Trend Slope)
 *   - Accompanied by tabular tabular inspection
 */
import React, { useState } from 'react';
import { ForecastReport } from '../api';
import { ActivityIcon, ClockIcon } from './icons';

export interface ForecastChartProps {
  readonly forecast: ForecastReport;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ forecast }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (forecast.status !== 'success' || !forecast.points || forecast.points.length === 0) {
    return null;
  }

  const points = forecast.points;
  // Compute chart bounds
  const allValues = points.flatMap(p => [p.lower_bound, p.predicted_energy_kwh, p.upper_bound]);
  const minVal = Math.floor(Math.min(...allValues) * 0.95);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.05);
  const range = maxVal - minVal || 1;

  // Dimensions
  const svgW = 740;
  const svgH = 220;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;
  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  // Project points to coordinates
  const coords = points.map((p, i) => {
    const x = padLeft + (i / (points.length - 1 || 1)) * plotW;
    const yPred = padTop + plotH - ((p.predicted_energy_kwh - minVal) / range) * plotH;
    const yLower = padTop + plotH - ((p.lower_bound - minVal) / range) * plotH;
    const yUpper = padTop + plotH - ((p.upper_bound - minVal) / range) * plotH;
    return { x, yPred, yLower, yUpper, point: p, idx: i };
  });

  // Generate Confidence Corridor Polygon: upper path forward, lower path backward
  const upperPath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.yUpper.toFixed(1)}`).join(' ');
  const lowerRevPath = [...coords].reverse().map(c => `L ${c.x.toFixed(1)},${c.yLower.toFixed(1)}`).join(' ');
  const ribbonPath = `${upperPath} ${lowerRevPath} Z`;

  // Trajectory line
  const predLinePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.yPred.toFixed(1)}`).join(' ');

  // Y-grid ticks (4 levels)
  const yTicks = [0, 0.33, 0.66, 1].map(frac => {
    const val = minVal + frac * range;
    const y = padTop + plotH - frac * plotH;
    return { val: val.toFixed(1), y };
  });

  return (
    <div className="forecast-chart-container">
      {/* Metrics Bar */}
      <div className="forecast-metrics-bar">
        <div className="forecast-metric-item">
          <span className="forecast-metric-label">Model Engine</span>
          <span className="forecast-metric-val">Trend-Augmented MA</span>
        </div>
        <div className="forecast-metric-item">
          <span className="forecast-metric-label">MAE (Mean Error)</span>
          <span className="forecast-metric-val font-mono">{forecast.model_metrics.mae ?? '—'} kWh</span>
        </div>
        <div className="forecast-metric-item">
          <span className="forecast-metric-label">RMSE</span>
          <span className="forecast-metric-val font-mono">{forecast.model_metrics.rmse ?? '—'} kWh</span>
        </div>
        <div className="forecast-metric-item">
          <span className="forecast-metric-label">Trend Slope</span>
          <span className="forecast-metric-val font-mono" style={{ color: 'var(--blue)' }}>
            {forecast.model_metrics.trend_slope ? `${forecast.model_metrics.trend_slope > 0 ? '+' : ''}${forecast.model_metrics.trend_slope} kWh/hr` : '—'}
          </span>
        </div>
        <div className="forecast-metric-item">
          <span className="forecast-metric-label">Confidence Band</span>
          <span className="forecast-metric-val" style={{ color: 'var(--brand)' }}>95% Two-Sided</span>
        </div>
      </div>

      {/* SVG Forecast Graph */}
      <div className="forecast-svg-wrapper">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="forecast-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="forecastRibbonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--blue)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="predLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--brand)" />
              <stop offset="100%" stopColor="var(--blue)" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines & labels */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={svgW - padRight}
                y2={t.y}
                stroke="var(--border-whisper)"
                strokeDasharray="3 3"
              />
              <text
                x={padLeft - 8}
                y={t.y + 4}
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {t.val}
              </text>
            </g>
          ))}

          {/* 95% Confidence Corridor Ribbon */}
          <path d={ribbonPath} fill="url(#forecastRibbonGrad)" />

          {/* Confidence corridor edge strokes */}
          <path
            d={upperPath}
            fill="none"
            stroke="rgba(88, 166, 255, 0.4)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <path
            d={lowerRevPath.replace(/^L/, 'M')}
            fill="none"
            stroke="rgba(88, 166, 255, 0.4)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Center predicted trajectory */}
          <path
            d={predLinePath}
            fill="none"
            stroke="url(#predLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive node points */}
          {coords.map(c => {
            const isHov = hoveredIdx === c.idx;
            return (
              <g
                key={c.idx}
                className="forecast-node-group"
                onMouseEnter={() => setHoveredIdx(c.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Vertical cursor guide on hover */}
                {isHov && (
                  <line
                    x1={c.x}
                    y1={padTop}
                    x2={c.x}
                    y2={padTop + plotH}
                    stroke="var(--brand)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.7"
                  />
                )}
                {/* Outer halo */}
                <circle
                  cx={c.x}
                  cy={c.yPred}
                  r={isHov ? 7 : 4}
                  fill={isHov ? 'var(--brand)' : 'var(--bg-elevated)'}
                  stroke="var(--brand)"
                  strokeWidth="2"
                  className="forecast-node"
                />
                {/* X Axis label */}
                <text
                  x={c.x}
                  y={svgH - 12}
                  fill={isHov ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight={isHov ? 700 : 500}
                  textAnchor="middle"
                >
                  +{c.idx + 1}h
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip / Active Inspection Bar */}
      <div className="forecast-active-inspect">
        {hoveredIdx !== null ? (
          <div className="forecast-inspect-pill">
            <ClockIcon />
            <span>Horizon: <strong>+{hoveredIdx + 1} Hour</strong> ({new Date(points[hoveredIdx].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
            <span className="inspect-sep">·</span>
            <span>Predicted: <strong style={{ color: 'var(--blue)' }}>{points[hoveredIdx].predicted_energy_kwh} kWh</strong></span>
            <span className="inspect-sep">·</span>
            <span className="text-secondary text-xs">95% CI Range: [{points[hoveredIdx].lower_bound} — {points[hoveredIdx].upper_bound} kWh]</span>
          </div>
        ) : (
          <div className="forecast-inspect-hint">
            <ActivityIcon />
            <span>Hover over any projection node (+1h to +6h) to inspect statistical bounds and interval variance</span>
          </div>
        )}
      </div>

      {/* Structured Forecast Table */}
      <div className="overflow-x-auto mt-4">
        <table className="data-table" aria-label="Energy demand forecast intervals">
          <thead>
            <tr>
              <th>Horizon</th>
              <th>Predicted Energy</th>
              <th>Lower Bound (95%)</th>
              <th>Upper Bound (95%)</th>
              <th>Variance Span</th>
            </tr>
          </thead>
          <tbody>
            {points.map((pt, idx) => {
              const span = (pt.upper_bound - pt.lower_bound).toFixed(2);
              return (
                <tr
                  key={idx}
                  className={hoveredIdx === idx ? 'table-row-active' : ''}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <td className="td-mono font-bold">
                    +{idx + 1}h ({new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </td>
                  <td className="td-mono" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                    {pt.predicted_energy_kwh} kWh
                  </td>
                  <td className="td-mono text-secondary">{pt.lower_bound} kWh</td>
                  <td className="td-mono text-secondary">{pt.upper_bound} kWh</td>
                  <td className="td-mono text-muted">±{(parseFloat(span) / 2).toFixed(2)} kWh</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
