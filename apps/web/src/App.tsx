import React, { useEffect, useState, useRef } from 'react';
import {
  fetchHealth,
  loadDemoData,
  fetchMetricsSummary,
  uploadCsvFile,
  HealthResponse,
  MetricsSummary,
  IngestionResult
} from './api';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, mData] = await Promise.all([
        fetchHealth(),
        fetchMetricsSummary().catch(() => null)
      ]);
      setHealth(hData);
      setMetrics(mData);
    } catch (err: any) {
      setError(err.message || 'Error connecting to TerraOps API backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleLoadDemo = async () => {
    setActionLoading('demo');
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await loadDemoData();
      setIngestionResult(res);
      setSuccessMsg(`Successfully loaded demo dataset (${res.summary.valid_rows} rows, ${res.summary.total_energy_kwh} kWh).`);
      const mData = await fetchMetricsSummary();
      setMetrics(mData);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo data');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionLoading('upload');
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await uploadCsvFile(file);
      setIngestionResult(res);
      setSuccessMsg(`Ingested CSV: ${res.summary.valid_rows} valid records processed, ${res.summary.error_count} rejected rows.`);
      const mData = await fetchMetricsSummary();
      setMetrics(mData);
    } catch (err: any) {
      setError(err.message || 'Failed to validate and ingest CSV');
    } finally {
      setActionLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">TerraOps</h1>
            <p className="brand-tagline">Operational Sustainability Decision Support</p>
          </div>
        </div>
        <div className="sdg-badge">
          <span>●</span> UN SDG 13: Climate Action
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-card">
        <h2 className="hero-title">Deterministic Operational Metrics & Emissions Engine</h2>
        <p className="hero-description">
          Ingest operational facility telemetry to calculate verified Scope 2 emissions, energy footprints, and utilization statistics using location-based grid carbon factors.
        </p>

        {/* Action Toolbar */}
        <div className="actions-row" style={{ marginTop: '1.75rem' }}>
          <button
            className="btn"
            onClick={handleLoadDemo}
            disabled={actionLoading === 'demo'}
          >
            {actionLoading === 'demo' ? 'Loading Demo...' : 'Load Demo Operations Data'}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-upload-input"
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={actionLoading === 'upload'}
          >
            {actionLoading === 'upload' ? 'Validating CSV...' : 'Upload Operational CSV'}
          </button>

          <button className="btn btn-secondary" onClick={refreshAll}>
            Refresh
          </button>
        </div>

        {successMsg && (
          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#10b981', fontSize: '0.9rem' }}>
            ✓ {successMsg}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '8px', color: '#f43f5e', fontSize: '0.9rem' }}>
            ⚠ {error}
          </div>
        )}
      </section>

      {/* Operational KPI Grid */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
        Deterministic Sustainability Metrics ({metrics?.records_count || 0} Records Analyzed)
      </h3>

      <div className="status-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Total Energy</span>
            <span className="badge badge-success">kWh</span>
          </div>
          <div className="card-value">
            {metrics ? metrics.energy.total_energy_kwh.value.toLocaleString() : '—'} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kWh</span>
          </div>
          <div className="card-detail">
            {metrics ? `${metrics.energy.total_energy_mwh.value} MWh total (${metrics.energy.average_hourly_kwh.value} kWh/interval avg)` : 'Load dataset to compute'}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Scope 2 Emissions</span>
            <span className="badge badge-warning">CO₂e</span>
          </div>
          <div className="card-value">
            {metrics ? metrics.emissions.total_emissions_kgco2e.value.toLocaleString() : '—'} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kg</span>
          </div>
          <div className="card-detail">
            {metrics ? `${metrics.emissions.total_emissions_tco2e.value} metric tons (Location-based)` : 'Location grid factors'}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Mean Utilization</span>
            <span className="badge badge-info">Capacity</span>
          </div>
          <div className="card-value">
            {metrics ? `${(metrics.utilization.mean_utilization.value * 100).toFixed(1)}%` : '—'}
          </div>
          <div className="card-detail">
            {metrics ? `Peak: ${(metrics.utilization.peak_utilization.value * 100).toFixed(1)}% • P95: ${(metrics.utilization.p95_utilization.value * 100).toFixed(1)}%` : 'Active workload ratio'}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Idle Capacity</span>
            <span className="badge badge-warning">Optimization</span>
          </div>
          <div className="card-value">
            {metrics ? `${(metrics.utilization.idle_capacity_ratio.value * 100).toFixed(1)}%` : '—'}
          </div>
          <div className="card-detail">
            Unused allocated overhead available for right-sizing
          </div>
        </div>
      </div>

      {/* Period over Period Comparison */}
      {metrics?.period_comparison && (
        <section className="details-section" style={{ marginBottom: '2rem' }}>
          <h3 className="details-title">
            <span>Period-over-Period Trend Analysis</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {metrics.period_comparison.description}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Baseline Energy</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{metrics.period_comparison.baseline_energy_kwh} kWh</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Period Energy</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{metrics.period_comparison.current_energy_kwh} kWh</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Energy Delta</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: metrics.period_comparison.energy_delta_percent > 0 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                {metrics.period_comparison.energy_delta_percent > 0 ? '+' : ''}{metrics.period_comparison.energy_delta_percent}%
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Emissions Delta</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: metrics.period_comparison.emissions_delta_percent > 0 ? 'var(--accent-rose)' : 'var(--accent-green)' }}>
                {metrics.period_comparison.emissions_delta_percent > 0 ? '+' : ''}{metrics.period_comparison.emissions_delta_percent}%
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Provenance & Factor Traceability */}
      <section className="details-section" style={{ marginBottom: '2rem' }}>
        <h3 className="details-title">
          <span>Carbon Intensity Factors Applied & Provenance</span>
        </h3>
        <table className="details-table">
          <tbody>
            <tr>
              <td>Calculation Engine Version</td>
              <td>{metrics?.calculation_version || 'v1.0.0 (Deterministic)'}</td>
            </tr>
            <tr>
              <td>Factors in Calculation</td>
              <td>
                {metrics?.emissions.factors_applied && metrics.emissions.factors_applied.length > 0
                  ? metrics.emissions.factors_applied.join(', ')
                  : 'US EPA eGRID (RFC East: 0.312 kgCO2e/kWh)'}
              </td>
            </tr>
            <tr>
              <td>Regional Emissions Breakdown</td>
              <td>
                {metrics?.emissions.regional_breakdown
                  ? Object.entries(metrics.emissions.regional_breakdown).map(([k, v]) => `${k}: ${v} kgCO2e`).join(' | ')
                  : 'us-east: active'}
              </td>
            </tr>
            <tr>
              <td>Audit & Provenance Standard</td>
              <td>GHG Protocol Scope 2 Guidance (Location-Based Accounting)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Row-Level Ingestion Validation Errors if any */}
      {ingestionResult && ingestionResult.errors.length > 0 && (
        <section className="details-section" style={{ marginBottom: '2rem', borderColor: 'var(--accent-amber)' }}>
          <h3 className="details-title" style={{ color: 'var(--accent-amber)' }}>
            <span>Data Ingestion Diagnostics ({ingestionResult.errors.length} Rejected Rows)</span>
          </h3>
          <table className="details-table">
            <thead>
              <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.5rem 0' }}>Row #</th>
                <th>Field</th>
                <th>Error Reason</th>
                <th>Rejected Value</th>
              </tr>
            </thead>
            <tbody>
              {ingestionResult.errors.map((err, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>Row {err.row_number}</td>
                  <td>{err.field}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{err.message}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{err.rejected_value ?? 'null'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* System Environment */}
      <section className="details-section">
        <h3 className="details-title">
          <span>System Environment & Service Status</span>
        </h3>
        <table className="details-table">
          <tbody>
            <tr>
              <td>Backend API Status</td>
              <td>{health?.status.toUpperCase() || (loading ? 'CHECKING...' : 'OFFLINE')} (FastAPI Asynchronous Monolith)</td>
            </tr>
            <tr>
              <td>Database Backend</td>
              <td>{health?.components.database.type.toUpperCase() || 'SQLITE'} ({health?.components.database.path || 'data/terraops.db'})</td>
            </tr>
            <tr>
              <td>Local AI Provider</td>
              <td>Ollama ({health?.components.ai_inference.model || 'qwen3.5:4b'} - {health?.components.ai_inference.status || 'Active'})</td>
            </tr>
            <tr>
              <td>Current Project Gate</td>
              <td>Phase 2: Ingestion & Deterministic Metrics Complete</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p>TerraOps Decision Support • ₹0 Zero-Cost Open-Source Implementation • UN SDG 13 Climate Action</p>
      </footer>
    </div>
  );
};
