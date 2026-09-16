/**
 * PeriodComparisonChart — Visual comparative analysis for period-over-period telemetry.
 * Displays:
 *   - Visual comparative bars for baseline vs current energy
 *   - Visual comparative bars for baseline vs current emissions
 *   - Delta callout badges with direction indicators
 *   - Contextual window demarcation
 */
import React from 'react';
import { TrendUpIcon, TrendDownIcon, ClockIcon } from './icons';

export interface PeriodComparisonData {
  readonly baseline_energy_kwh: number;
  readonly current_energy_kwh: number;
  readonly energy_delta_percent: number;
  readonly baseline_emissions_kgco2e: number;
  readonly current_emissions_kgco2e: number;
  readonly emissions_delta_percent: number;
  readonly description: string;
}

export interface PeriodComparisonChartProps {
  readonly comparison: PeriodComparisonData;
}

export const PeriodComparisonChart: React.FC<PeriodComparisonChartProps> = ({ comparison }) => {
  const {
    baseline_energy_kwh, current_energy_kwh, energy_delta_percent,
    baseline_emissions_kgco2e, current_emissions_kgco2e, emissions_delta_percent,
    description,
  } = comparison;

  // Energy max for relative bar widths
  const maxEnergy = Math.max(baseline_energy_kwh, current_energy_kwh) * 1.15 || 1;
  const baselineEnergyPct = ((baseline_energy_kwh / maxEnergy) * 100).toFixed(1);
  const currentEnergyPct = ((current_energy_kwh / maxEnergy) * 100).toFixed(1);

  // Emissions max for relative bar widths
  const maxEmissions = Math.max(baseline_emissions_kgco2e, current_emissions_kgco2e) * 1.15 || 1;
  const baselineEmissionsPct = ((baseline_emissions_kgco2e / maxEmissions) * 100).toFixed(1);
  const currentEmissionsPct = ((current_emissions_kgco2e / maxEmissions) * 100).toFixed(1);

  const isEnergyUp = energy_delta_percent > 0;
  const isEmissionsUp = emissions_delta_percent > 0;

  return (
    <div className="period-comp-container">
      {/* Top Banner with timeframe description */}
      <div className="period-comp-header">
        <div className="period-comp-meta">
          <ClockIcon />
          <span>{description}</span>
        </div>
        <div className="period-comp-window-badge">
          <span>Window: 12h Baseline vs 12h Current</span>
        </div>
      </div>

      {/* Side-by-side comparative grids */}
      <div className="period-comp-grid">
        {/* Energy Comparison Column */}
        <div className="period-comp-card">
          <div className="period-comp-card-head">
            <span className="period-comp-card-title">Energy Consumption</span>
            <span className={`period-delta-badge ${isEnergyUp ? 'delta-warn' : 'delta-good'}`}>
              {isEnergyUp ? <TrendUpIcon /> : <TrendDownIcon />}
              <span>{isEnergyUp ? '+' : ''}{energy_delta_percent}% Δ</span>
            </span>
          </div>

          <div className="period-bar-stack">
            {/* Baseline bar */}
            <div className="period-bar-item">
              <div className="period-bar-labels">
                <span className="period-bar-name">First 12 Intervals (Baseline)</span>
                <span className="period-bar-num font-mono">{baseline_energy_kwh} kWh</span>
              </div>
              <div className="period-bar-track">
                <div
                  className="period-bar-fill baseline-fill"
                  style={{ width: `${baselineEnergyPct}%` }}
                />
              </div>
            </div>

            {/* Current bar */}
            <div className="period-bar-item">
              <div className="period-bar-labels">
                <span className="period-bar-name">Latter 12 Intervals (Current)</span>
                <span className="period-bar-num font-mono" style={{ color: isEnergyUp ? 'var(--amber)' : 'var(--brand)' }}>
                  {current_energy_kwh} kWh
                </span>
              </div>
              <div className="period-bar-track">
                <div
                  className={`period-bar-fill ${isEnergyUp ? 'current-up-fill' : 'current-down-fill'}`}
                  style={{ width: `${currentEnergyPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="period-card-footer">
            <span>Net Change:</span>
            <strong className="font-mono" style={{ color: isEnergyUp ? 'var(--amber)' : 'var(--brand)' }}>
              {isEnergyUp ? '+' : ''}{(current_energy_kwh - baseline_energy_kwh).toFixed(1)} kWh
            </strong>
          </div>
        </div>

        {/* Scope 2 Emissions Comparison Column */}
        <div className="period-comp-card">
          <div className="period-comp-card-head">
            <span className="period-comp-card-title">Scope 2 Location-Based Emissions</span>
            <span className={`period-delta-badge ${isEmissionsUp ? 'delta-danger' : 'delta-good'}`}>
              {isEmissionsUp ? <TrendUpIcon /> : <TrendDownIcon />}
              <span>{isEmissionsUp ? '+' : ''}{emissions_delta_percent}% Δ</span>
            </span>
          </div>

          <div className="period-bar-stack">
            {/* Baseline bar */}
            <div className="period-bar-item">
              <div className="period-bar-labels">
                <span className="period-bar-name">First 12 Intervals (Baseline)</span>
                <span className="period-bar-num font-mono">{baseline_emissions_kgco2e} kgCO₂e</span>
              </div>
              <div className="period-bar-track">
                <div
                  className="period-bar-fill baseline-fill"
                  style={{ width: `${baselineEmissionsPct}%` }}
                />
              </div>
            </div>

            {/* Current bar */}
            <div className="period-bar-item">
              <div className="period-bar-labels">
                <span className="period-bar-name">Latter 12 Intervals (Current)</span>
                <span className="period-bar-num font-mono" style={{ color: isEmissionsUp ? 'var(--red)' : 'var(--brand)' }}>
                  {current_emissions_kgco2e} kgCO₂e
                </span>
              </div>
              <div className="period-bar-track">
                <div
                  className={`period-bar-fill ${isEmissionsUp ? 'current-danger-fill' : 'current-down-fill'}`}
                  style={{ width: `${currentEmissionsPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="period-card-footer">
            <span>Net Change:</span>
            <strong className="font-mono" style={{ color: isEmissionsUp ? 'var(--red)' : 'var(--brand)' }}>
              {isEmissionsUp ? '+' : ''}{(current_emissions_kgco2e - baseline_emissions_kgco2e).toFixed(2)} kgCO₂e
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
