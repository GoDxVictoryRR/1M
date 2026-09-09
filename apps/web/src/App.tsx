import React, { useEffect, useState, useRef } from 'react';
import {
  fetchHealth,
  loadDemoData,
  fetchMetricsSummary,
  uploadCsvFile,
  fetchAnomalies,
  fetchForecast,
  fetchRecommendations,
  searchRagKnowledge,
  HealthResponse,
  MetricsSummary,
  IngestionResult,
  AnomalyReport,
  ForecastReport,
  RecommendationReport,
  RagSearchResponse
} from './api';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyReport | null>(null);
  const [forecast, setForecast] = useState<ForecastReport | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationReport | null>(null);
  const [anomalyMethod, setAnomalyMethod] = useState<string>('rolling_zscore');
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [ragQuery, setRagQuery] = useState<string>('right-sizing compute instances');
  const [ragResult, setRagResult] = useState<RagSearchResponse | null>(null);
  const [ragLoading, setRagLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshAnalyticsAndRecs = async (method = anomalyMethod) => {
    try {
      const [anomData, fcData, recData] = await Promise.all([
        fetchAnomalies(method).catch(() => null),
        fetchForecast(6).catch(() => null),
        fetchRecommendations().catch(() => null)
      ]);
      setAnomalies(anomData);
      setForecast(fcData);
      setRecommendations(recData);
    } catch (e) {
      console.error(e);
    }
  };

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
      await refreshAnalyticsAndRecs();
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
      await refreshAnalyticsAndRecs();
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
      await refreshAnalyticsAndRecs();
    } catch (err: any) {
      setError(err.message || 'Failed to validate and ingest CSV');
    } finally {
      setActionLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMethodChange = async (method: string) => {
    setAnomalyMethod(method);
    try {
      const data = await fetchAnomalies(method);
      setAnomalies(data);
    } catch (e) {
      console.error(e);
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
        <h2 className="hero-title">Prioritized, Explainable Sustainability Interventions</h2>
        <p className="hero-description">
          Deterministic decision-support transforming operational telemetry into audited carbon reductions, explainable anomaly mitigations, and ranked energy conservation measures.
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
        Deterministic Operational Metrics ({metrics?.records_count || 0} Records Analyzed)
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

      {/* Prioritized Recommendations Section */}
      <section className="details-section" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="details-title" style={{ marginBottom: '0.25rem' }}>
              <span>Prioritized Sustainability Interventions (Deterministic Ranking)</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Transparent multi-attribute scoring combining estimated emissions impact (45%), statistical confidence (25%), implementation ease (20%), and data quality (10%).
            </p>
          </div>
          {recommendations && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                ⚡ -{recommendations.potential_energy_savings_kwh} kWh
              </div>
              <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                🌱 -{recommendations.potential_emissions_reduction_kgco2e} kgCO₂e
              </div>
            </div>
          )}
        </div>

        {recommendations && recommendations.items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.items.map((rec, index) => (
              <div key={rec.id} style={{ padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                      {rec.title}
                    </span>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                      {rec.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
                      Score: {rec.overall_score}/100
                    </span>
                    <span className={`badge ${rec.effort === 'low' ? 'badge-success' : rec.effort === 'medium' ? 'badge-info' : 'badge-warning'}`}>
                      Effort: {rec.effort.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                  {rec.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Target: <strong style={{ color: '#fff' }}>{rec.target_resource}</strong></span>
                    <span>Energy Reduction: <strong style={{ color: 'var(--accent-green)' }}>{rec.estimated_energy_savings_kwh} kWh</strong></span>
                    <span>Emissions Reduction: <strong style={{ color: 'var(--accent-blue)' }}>{rec.estimated_emissions_reduction_kgco2e} kgCO₂e</strong></span>
                    <span>Confidence: <strong style={{ color: '#fff' }}>{(rec.confidence_score * 100).toFixed(0)}%</strong></span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    👉 {rec.suggested_action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
            No recommendations generated. Load operational telemetry to compute interventions.
          </p>
        )}
      </section>

      {/* Anomaly Detection Section */}
      <section className="details-section" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="details-title" style={{ marginBottom: '0.25rem' }}>
              <span>Operational Anomaly Detection</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Explainable statistical detection identifying abnormal energy spikes and equipment inefficiencies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Method:</span>
            <button
              className={`btn btn-secondary ${anomalyMethod === 'rolling_zscore' ? 'btn-active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderColor: anomalyMethod === 'rolling_zscore' ? 'var(--accent-green)' : undefined }}
              onClick={() => handleMethodChange('rolling_zscore')}
            >
              Rolling Z-Score
            </button>
            <button
              className={`btn btn-secondary ${anomalyMethod === 'isolation_forest' ? 'btn-active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderColor: anomalyMethod === 'isolation_forest' ? 'var(--accent-green)' : undefined }}
              onClick={() => handleMethodChange('isolation_forest')}
            >
              Isolation Forest
            </button>
          </div>
        </div>

        {anomalies && anomalies.items.length > 0 ? (
          <table className="details-table">
            <thead>
              <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.5rem 0' }}>Timestamp</th>
                <th>Resource</th>
                <th>Observed</th>
                <th>Baseline</th>
                <th>Score</th>
                <th>Severity</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{new Date(item.timestamp).toLocaleTimeString()}</td>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{item.resource_id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.actual_value} kWh</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.expected_value} kWh</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>{item.anomaly_score}</td>
                  <td>
                    <span className={`badge ${item.severity === 'critical' ? 'badge-warning' : item.severity === 'high' ? 'badge-warning' : 'badge-info'}`}>
                      {item.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '380px' }}>{item.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
            No anomalies detected exceeding the threshold (z ≥ 2.5). Telemetry is operating within standard baseline variance.
          </p>
        )}
      </section>

      {/* Near-Term Energy Forecasting Section */}
      <section className="details-section" style={{ marginBottom: '2rem' }}>
        <h3 className="details-title" style={{ marginBottom: '0.25rem' }}>
          <span>Near-Term Energy Demand Forecast</span>
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Baseline projection using trend-augmented moving averages with 95% statistical confidence bounds.
        </p>

        {forecast && forecast.status === 'success' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Model MAE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{forecast.model_metrics.mae ?? '0.0'} kWh</div>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Model RMSE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{forecast.model_metrics.rmse ?? '0.0'} kWh</div>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Trend Slope</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{forecast.model_metrics.trend_slope ?? '0.0'} kWh/hr</div>
              </div>
            </div>

            <table className="details-table">
              <thead>
                <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Forecast Horizon</th>
                  <th>Predicted Consumption</th>
                  <th>95% Lower Bound</th>
                  <th>95% Upper Bound</th>
                </tr>
              </thead>
              <tbody>
                {forecast.points.map((pt, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>+{idx + 1}h ({new Date(pt.timestamp).toLocaleTimeString()})</td>
                    <td style={{ color: 'var(--accent-blue)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{pt.predicted_energy_kwh} kWh</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{pt.lower_bound} kWh</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{pt.upper_bound} kWh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--accent-amber)', fontSize: '0.9rem' }}>
            ⚠ {forecast?.note || 'Insufficient historical intervals to compute forecasts. Load at least 6 operational records.'}
          </div>
        )}
      </section>

      {/* Period-over-Period Trend */}
      {metrics?.period_comparison && (
        <section className="details-section" style={{ marginBottom: '2rem' }}>
          <h3 className="details-title">
            <span>Period-over-Period Operational Comparison</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
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

      {/* Phase 5: Semantic Knowledge & Evidence Retrieval (RAG) */}
      <section className="details-section" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 className="details-title" style={{ margin: 0 }}>
              <span>Local RAG Knowledge & Citation Engine</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Offline vectorless hybrid retrieval over verified sustainability standards with strict insufficient-evidence guardrail.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            100% Offline • Zero-Cost
          </span>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!ragQuery.trim()) return;
            setRagLoading(true);
            try {
              const res = await searchRagKnowledge(ragQuery.trim(), 3);
              setRagResult(res);
            } catch (err: any) {
              setError(err.message || 'RAG search failed');
            } finally {
              setRagLoading(false);
            }
          }}
          style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}
        >
          <input
            type="text"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            placeholder="Search operational guidance (e.g. rightsizing, off-peak scheduling, scope 2, cooling)..."
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={ragLoading}
            style={{ minWidth: '120px' }}
          >
            {ragLoading ? 'Searching...' : 'Search RAG'}
          </button>
        </form>

        {ragResult && (
          <div>
            {ragResult.insufficient_evidence ? (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent-amber)', borderRadius: '6px', marginBottom: '1rem', color: 'var(--accent-amber)', fontSize: '0.875rem' }}>
                ⚠️ <strong>Insufficient Evidence Guardrail Triggered:</strong> {ragResult.warning}
              </div>
            ) : (
              <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-emerald)', borderRadius: '6px', marginBottom: '1rem', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                ✓ Found {ragResult.citations.length} authoritative citations (Score &gt;= {ragResult.threshold})
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {ragResult.citations.map((cite, i) => (
                <div key={cite.chunk_id || i} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cite.title}</h4>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      Sim: {cite.similarity_score.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {cite.publisher} • {cite.date} • <em>{cite.section_title}</em>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
                    {cite.content.slice(0, 180)}...
                  </p>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {cite.tags.map((t) => (
                      <span key={t} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Ingestion Diagnostics if errors exist */}
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
              <td>Phase 4: Recommendations Engine Complete</td>
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
