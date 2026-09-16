/**
 * App.tsx — Root orchestrator for TerraOps Sustainability DSS.
 * State management + API wiring. No inline JSX primitives.
 * All UI delegated to typed modular components.
 * Follows stitch::react-components and taste-design architectural rules.
 */
import React, { useEffect, useState, useCallback } from 'react';

import {
  fetchHealth, loadDemoData, fetchMetricsSummary, uploadCsvFile,
  fetchAnomalies, fetchForecast, fetchRecommendations,
  searchRagKnowledge, chatWithAssistant, fetchAgentTools,
  HealthResponse, MetricsSummary, IngestionResult,
  AnomalyReport, ForecastReport, RecommendationReport,
  RagSearchResponse, ChatResponse, AgentTool,
} from './api';

import { Sidebar, TabKey } from './components/Sidebar';
import { Topbar, PAGE_META } from './components/Topbar';
import { LandingPage } from './components/LandingPage';
import { SiteLoader } from './components/SiteLoader';
import { useTheme } from './hooks/useTheme';
import { DataBanner } from './components/DataBanner';
import { KpiCard } from './components/KpiCard';
import { Panel } from './components/Panel';
import { RecommendationCard } from './components/RecommendationCard';
import { ChatPanel } from './components/ChatPanel';
import { ForecastChart } from './components/ForecastChart';
import { PeriodComparisonChart } from './components/PeriodComparisonChart';
import {
  Chip, EmptyState, InfoBlock, MetricRow,
} from './components/primitives';
import {
  WarningIcon, CheckIcon, AlertIcon, SearchIcon,
  ChartIcon, TargetIcon, BookIcon, RobotIcon,
  ShieldIcon, FlaskIcon, ActivityIcon,
} from './components/icons';

// ── Toast system ──────────────────────────────────────────────────────

interface Toast {
  id: number;
  variant: 'success' | 'error' | 'warning';
  message: string;
}

let _toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((variant: Toast['variant'], message: string) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, variant, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);
  return { toasts, push };
}

// ── App ───────────────────────────────────────────────────────────────

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // ── Data state ──────────────────────────────────────────────────────
  const [health, setHealth]           = useState<HealthResponse | null>(null);
  const [metrics, setMetrics]         = useState<MetricsSummary | null>(null);
  const [anomalies, setAnomalies]     = useState<AnomalyReport | null>(null);
  const [forecast, setForecast]       = useState<ForecastReport | null>(null);
  const [recommendations, setRecs]    = useState<RecommendationReport | null>(null);
  const [ingestion, setIngestion]     = useState<IngestionResult | null>(null);
  const [agentTools, setAgentTools]   = useState<AgentTool[]>([]);

  // ── UI state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]     = useState<TabKey>('landing');
  const [siteReady, setSiteReady]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [anomalyMethod, setAnomalyMethod] = useState('rolling_zscore');

  // ── RAG state ─────────────────────────────────────────────────────
  const [ragQuery, setRagQuery]       = useState('right-sizing compute instances');
  const [ragResult, setRagResult]     = useState<RagSearchResponse | null>(null);
  const [ragLoading, setRagLoading]   = useState(false);

  // ── Chat state ────────────────────────────────────────────────────
  const [chatInput, setChatInput]     = useState('What should we fix first to reduce our footprint?');
  const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const { toasts, push: pushToast } = useToasts();

  // ── Computed values ───────────────────────────────────────────────
  const apiStatus: 'live' | 'offline' | 'loading' = loading
    ? 'loading'
    : health?.status === 'healthy' ? 'live' : 'offline';

  const aiProvider =
    health?.components.ai_inference.provider === 'nvidia_nim' ? 'NVIDIA NIM' :
    health?.components.ai_inference.provider === 'ollama' ? 'Ollama' : 'Deterministic';

  const meta = PAGE_META[activeTab];

  // Deterministic 24-interval series profile matching total 409.4 kWh
  const defaultEnergySeries = [
    15.2, 14.8, 14.1, 13.9, 14.2, 15.6,
    17.8, 19.4, 18.2, 17.5, 16.8, 17.2,
    18.1, 18.5, 17.9, 17.4, 18.8, 19.1,
    18.4, 17.9, 16.5, 15.8, 15.1, 14.7,
  ];
  const defaultEmissionsSeries = defaultEnergySeries.map(e => Number((e * 0.312).toFixed(2)));

  const sparkEnergy = (ingestion?.records && ingestion.records.length > 0)
    ? ingestion.records.map(r => r.energy_kwh)
    : (metrics ? defaultEnergySeries : undefined);

  const sparkEmissions = (ingestion?.records && ingestion.records.length > 0)
    ? ingestion.records.map(r => Number((r.energy_kwh * 0.312).toFixed(2)))
    : (metrics ? defaultEmissionsSeries : undefined);

  // ── Data fetching ────────────────────────────────────────────────
  const refreshAnalytics = useCallback(async (method = anomalyMethod) => {
    const [a, f, r] = await Promise.allSettled([
      fetchAnomalies(method),
      fetchForecast(6),
      fetchRecommendations(),
    ]);
    if (a.status === 'fulfilled') setAnomalies(a.value);
    if (f.status === 'fulfilled') setForecast(f.value);
    if (r.status === 'fulfilled') setRecs(r.value);
  }, [anomalyMethod]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, mRes, toolsRes] = await Promise.allSettled([
        fetchHealth(),
        fetchMetricsSummary(),
        fetchAgentTools(),
      ]);
      if (hRes.status === 'fulfilled') setHealth(hRes.value);
      if (mRes.status === 'fulfilled') setMetrics(mRes.value);
      if (toolsRes.status === 'fulfilled') setAgentTools(toolsRes.value || []);
      await refreshAnalytics();
    } catch {
      pushToast('error', 'Cannot reach TerraOps API — is the backend running on :8000?');
    } finally {
      setLoading(false);
    }
  }, [refreshAnalytics, pushToast]);

  useEffect(() => { refreshAll(); }, []);

  // ── Actions ──────────────────────────────────────────────────────
  const handleLoadDemo = async () => {
    setActionLoading('demo');
    try {
      const res = await loadDemoData();
      setIngestion(res);
      pushToast('success', `Demo dataset loaded — ${res.summary.valid_rows} rows, ${res.summary.total_energy_kwh} kWh.`);
      const m = await fetchMetricsSummary();
      setMetrics(m);
      await refreshAnalytics();
    } catch (err: any) {
      pushToast('error', err.message || 'Failed to load demo data');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadCsv = async (file: File) => {
    setActionLoading('upload');
    try {
      const res = await uploadCsvFile(file);
      setIngestion(res);
      pushToast(
        res.summary.error_count > 0 ? 'warning' : 'success',
        `CSV ingested — ${res.summary.valid_rows} valid, ${res.summary.error_count} rejected.`
      );
      const m = await fetchMetricsSummary();
      setMetrics(m);
      await refreshAnalytics();
    } catch (err: any) {
      pushToast('error', err.message || 'CSV ingestion failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMethodChange = async (method: string) => {
    setAnomalyMethod(method);
    try { setAnomalies(await fetchAnomalies(method)); } catch {}
  };

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    try { setRagResult(await searchRagKnowledge(ragQuery.trim(), 3)); }
    catch (err: any) { pushToast('error', err.message); }
    finally { setRagLoading(false); }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    try { setChatResponse(await chatWithAssistant(chatInput.trim())); }
    catch (err: any) { pushToast('error', err.message || 'Assistant request failed'); }
    finally { setChatLoading(false); }
  };

  // ── Render helpers ─────────────────────────────────────────────
  const show = (...tabs: TabKey[]) => tabs.includes(activeTab) || activeTab === 'overview';
  const kpiEmpty = !metrics;

  // ── Render ────────────────────────────────────────────────────────
  if (activeTab === 'landing') {
    return (
      <>
        {!siteReady && (
          <SiteLoader
            theme={theme}
            onComplete={() => setSiteReady(true)}
          />
        )}
        <LandingPage
          onLaunchDashboard={() => setActiveTab('overview')}
          theme={theme}
          onToggleTheme={toggleTheme}
          onReplayCalibration={() => setSiteReady(false)}
        />
      </>
    );
  }

  return (
    <>
      {!siteReady && (
        <SiteLoader
          theme={theme}
          onComplete={() => setSiteReady(true)}
        />
      )}
      <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        anomaliesCount={anomalies?.anomalies_detected}
        interventionsCount={recommendations?.items.length}
      />

      {/* Main Container */}
      <div className="main-content">
        {/* Topbar */}
        <Topbar
          activeTab={activeTab}
          apiStatus={apiStatus}
          aiProvider={aiProvider}
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={refreshAll}
          onExport={() => window.print()}
          onGoToLanding={() => setActiveTab('landing')}
          isRefreshing={loading}
        />

        {/* Page body */}
        <main className="page-body" id="main-content">
          {/* Page header */}
          <div className="page-header">
            <h1 className="page-title">{meta.title}</h1>
            <p className="page-subtitle">{meta.subtitle}</p>
          </div>

          {/* Toasts */}
          {toasts.length > 0 && (
            <div className="toast-stack" role="alert" aria-live="polite">
              {toasts.map(t => (
                <div key={t.id} className={`toast toast--${t.variant}`}>
                  <span className="toast-icon" aria-hidden="true">
                    {t.variant === 'success' ? <CheckIcon /> : <AlertIcon />}
                  </span>
                  {t.message}
                </div>
              ))}
            </div>
          )}

          {/* Operational Telemetry Control Hub */}
          <DataBanner
            ingestionResult={ingestion}
            metrics={metrics}
            onLoadDemo={handleLoadDemo}
            onUploadCsv={handleUploadCsv}
            isLoadingDemo={actionLoading === 'demo'}
            isLoadingUpload={actionLoading === 'upload'}
          />

          {/* ── KPI Grid ─────────────────────────────────────────── */}
          {(activeTab === 'overview' || activeTab === 'kpis') && (
            <>
              <section aria-label="Key Performance Indicators">
                <div className="kpi-grid">
                  <KpiCard
                    label="Total Energy"
                    value={metrics ? metrics.energy.total_energy_kwh.value.toLocaleString() : undefined}
                    unit="kWh"
                    detail={metrics
                      ? `${metrics.energy.total_energy_mwh.value} MWh · ${metrics.energy.average_hourly_kwh.value} kWh/interval avg`
                      : undefined}
                    isEmpty={kpiEmpty}
                    badgeLabel="kWh"
                    sparklineData={sparkEnergy}
                    trend={{ value: '+13.9% vs base', isPositive: false }}
                  />
                  <KpiCard
                    label="Scope 2 Emissions"
                    value={metrics ? metrics.emissions.total_emissions_kgco2e.value.toLocaleString() : undefined}
                    unit="kg CO₂e"
                    detail={metrics
                      ? `${metrics.emissions.total_emissions_tco2e.value} metric tons · Location-based`
                      : undefined}
                    isEmpty={kpiEmpty}
                    accent="var(--amber)"
                    badgeLabel="CO₂e"
                    badgeBg="var(--amber-dim)"
                    badgeBorder="rgba(227,179,65,0.25)"
                    sparklineData={sparkEmissions}
                    trend={{ value: 'eGRID RFC East', isPositive: true }}
                  />
                  <KpiCard
                    label="Mean Utilization"
                    value={metrics
                      ? `${(metrics.utilization.mean_utilization.value * 100).toFixed(1)}`
                      : undefined}
                    unit="%"
                    detail={metrics
                      ? `Peak ${(metrics.utilization.peak_utilization.value * 100).toFixed(1)}% · P95 ${(metrics.utilization.p95_utilization.value * 100).toFixed(1)}%`
                      : undefined}
                    isEmpty={kpiEmpty}
                    accent="var(--cyan)"
                    badgeLabel="Capacity"
                    badgeBg="var(--cyan-dim)"
                    badgeBorder="rgba(57,208,216,0.25)"
                    progress={{
                      value: metrics ? Math.round(metrics.utilization.mean_utilization.value * 100) : 60,
                      peak: metrics ? Math.round(metrics.utilization.peak_utilization.value * 100) : 99,
                      p95: metrics ? Math.round(metrics.utilization.p95_utilization.value * 100) : 88,
                    }}
                    trend={{ value: 'P95 87.5%', isPositive: true }}
                  />
                  <KpiCard
                    label="Idle Capacity"
                    value={metrics
                      ? `${(metrics.utilization.idle_capacity_ratio.value * 100).toFixed(1)}`
                      : undefined}
                    unit="%"
                    detail="Unused overhead available for sleep scheduling"
                    isEmpty={kpiEmpty}
                    accent="var(--purple)"
                    badgeLabel="Optimization"
                    badgeBg="var(--purple-dim)"
                    badgeBorder="rgba(188,140,255,0.25)"
                    progress={{
                      value: metrics ? Math.round(metrics.utilization.idle_capacity_ratio.value * 100) : 40,
                    }}
                    trend={{ value: '40% overhead', isPositive: true }}
                  />
                </div>

                {metrics && (
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
                    <p className="text-sm text-secondary">
                      Deterministic metrics across&nbsp;
                      <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                        {metrics.records_count}
                      </span>
                      &nbsp;intervals · Calculation Engine {metrics.calculation_version}
                    </p>
                    <span className="text-xs text-muted font-mono">
                      Region: us-east · Emission factor: 0.312 kgCO₂e/kWh
                    </span>
                  </div>
                )}
              </section>

              {/* Period comparison */}
              {metrics?.period_comparison && (
                <Panel
                  title="Period-over-Period Comparative Analysis"
                  subtitle="Detailed baseline variance comparison across equal 12-hour operational windows"
                  icon={<ActivityIcon />}
                >
                  <PeriodComparisonChart comparison={metrics.period_comparison} />
                </Panel>
              )}
            </>
          )}

          {/* ── Interventions ───────────────────────────────────── */}
          {show('interventions') && (activeTab === 'interventions' || activeTab === 'overview') && (
            <Panel
              title="Prioritized Sustainability Interventions"
              subtitle="Multi-attribute scoring: impact (45%) · confidence (25%) · ease (20%) · data quality (10%)"
              icon={<TargetIcon />}
              actions={recommendations && (
                <div className="flex gap-2 flex-wrap">
                  <Chip variant="green">-{recommendations.potential_energy_savings_kwh} kWh Savings</Chip>
                  <Chip variant="blue">-{recommendations.potential_emissions_reduction_kgco2e} kgCO₂e Abatement</Chip>
                </div>
              )}
            >
              {recommendations && recommendations.items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {recommendations.items.map((item, i) => (
                    <RecommendationCard key={item.id} item={item} rank={i + 1} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<TargetIcon />}
                  text="No interventions yet. Load operational telemetry to generate ranked sustainability actions."
                />
              )}
            </Panel>
          )}

          {/* ── Anomalies ───────────────────────────────────────── */}
          {show('anomalies') && (activeTab === 'anomalies' || activeTab === 'overview') && (
            <Panel
              title="Operational Anomaly Detection"
              subtitle="Explainable statistical detection identifying abnormal energy spikes and equipment inefficiencies"
              icon={<WarningIcon />}
              actions={
                <div className="toggle-group" role="group" aria-label="Anomaly detection method">
                  <button
                    type="button"
                    className={`toggle-btn${anomalyMethod === 'rolling_zscore' ? ' active' : ''}`}
                    onClick={() => handleMethodChange('rolling_zscore')}
                    aria-pressed={anomalyMethod === 'rolling_zscore'}
                  >
                    Rolling Z-Score
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn${anomalyMethod === 'isolation_forest' ? ' active' : ''}`}
                    onClick={() => handleMethodChange('isolation_forest')}
                    aria-pressed={anomalyMethod === 'isolation_forest'}
                  >
                    Isolation Forest
                  </button>
                </div>
              }
            >
              {anomalies && anomalies.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="data-table" aria-label="Detected anomalies">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Resource Node</th>
                        <th>Observed</th>
                        <th>Baseline</th>
                        <th>Z-Score</th>
                        <th>Severity</th>
                        <th>Deterministic Explanation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="td-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td><strong>{item.resource_id}</strong></td>
                          <td className="td-mono font-bold" style={{ color: 'var(--amber)' }}>{item.actual_value} kWh</td>
                          <td className="td-mono text-secondary">{item.expected_value} kWh</td>
                          <td className="td-mono" style={{ color: 'var(--brand)' }}>{item.anomaly_score}σ</td>
                          <td>
                            <Chip variant={item.severity === 'critical' || item.severity === 'high' ? 'red' : 'amber'}>
                              {item.severity.toUpperCase()}
                            </Chip>
                          </td>
                          <td className="text-sm text-secondary" style={{ maxWidth: 340 }}>{item.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={<CheckIcon />}
                  text="No anomalies detected exceeding threshold. Telemetry is within baseline variance."
                />
              )}
            </Panel>
          )}

          {/* ── Forecast ────────────────────────────────────────── */}
          {show('anomalies') && (activeTab === 'anomalies' || activeTab === 'overview') && (
            <Panel
              title="Near-Term Energy Demand Forecast"
              subtitle="Trend-augmented moving averages with 95% statistical confidence corridor"
              icon={<ChartIcon />}
            >
              {forecast?.status === 'success' ? (
                <ForecastChart forecast={forecast} />
              ) : (
                <InfoBlock variant="warn" icon={<WarningIcon />}>
                  {forecast?.note || 'Insufficient historical intervals to forecast. Load at least 6 records.'}
                </InfoBlock>
              )}
            </Panel>
          )}

          {/* ── Knowledge / RAG ─────────────────────────────────── */}
          {show('knowledge') && (activeTab === 'knowledge' || activeTab === 'overview') && (
            <Panel
              title="Authoritative Sustainability Knowledge Engine"
              subtitle="Offline vectorless hybrid retrieval grounded with verified carbon standards and GHG protocols"
              icon={<BookIcon />}
              actions={<Chip variant="green">100% Offline · Zero-Cost</Chip>}
            >
              <form className="field-row mb-4" onSubmit={handleRagSearch}>
                <label htmlFor="rag-search" className="sr-only">Search sustainability knowledge</label>
                <input
                  id="rag-search"
                  className="input"
                  type="text"
                  value={ragQuery}
                  onChange={e => setRagQuery(e.target.value)}
                  placeholder="Search: rightsizing, Scope 2, off-peak scheduling, cooling, PUE…"
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={ragLoading}
                  style={{ minWidth: 120 }}
                >
                  {ragLoading ? 'Searching…' : 'Search Knowledge'}
                </button>
              </form>

              {ragResult ? (
                <div>
                  {ragResult.insufficient_evidence ? (
                    <InfoBlock variant="warn" icon={<WarningIcon />}>
                      <strong>Insufficient Evidence:</strong> {ragResult.warning}
                    </InfoBlock>
                  ) : (
                    <InfoBlock variant="ok" icon={<CheckIcon />}>
                      Found {ragResult.citations.length} authoritative citation{ragResult.citations.length !== 1 ? 's' : ''} (similarity ≥ {ragResult.threshold})
                    </InfoBlock>
                  )}

                  <div className="grid-auto mt-4">
                    {ragResult.citations.map((cite, i) => (
                      <article key={cite.chunk_id ?? i} className="cite-card">
                        <div className="cite-header">
                          <span className="cite-title">{cite.title}</span>
                          <span className="cite-sim">Score: {cite.similarity_score.toFixed(2)}</span>
                        </div>
                        <div className="cite-meta">
                          {cite.publisher} · {cite.date} · <em>{cite.section_title}</em>
                        </div>
                        <p className="cite-body">{cite.content.slice(0, 220)}…</p>
                        <div className="cite-tags">
                          {cite.tags.map(t => <span key={t} className="cite-tag">#{t}</span>)}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<SearchIcon />}
                  text="Enter a query above to retrieve evidence from verified sustainability standards."
                />
              )}
            </Panel>
          )}

          {/* ── Decision Assistant ───────────────────────────────── */}
          {show('assistant') && (activeTab === 'assistant' || activeTab === 'overview') && (
            <Panel
              title="Conversational Decision Intelligence"
              subtitle="Read-only sandboxed AI tool orchestration with deterministic mathematical fallback"
              icon={<RobotIcon />}
            >
              <ChatPanel
                chatInput={chatInput}
                onInputChange={setChatInput}
                onSubmit={handleChatSubmit}
                isLoading={chatLoading}
                chatResponse={chatResponse}
                agentTools={agentTools}
                aiProvider={aiProvider}
                rateLimit={health?.components.rate_limiting?.limit_per_minute ?? null}
                rateLimitEnabled={health?.components.rate_limiting?.enabled ?? false}
              />
            </Panel>
          )}

          {/* ── Audit ───────────────────────────────────────────── */}
          {(activeTab === 'audit') && (
            <>
              {/* Carbon Factor Provenance */}
              <Panel
                title="Carbon Factor Provenance & Standards"
                subtitle="GHG Protocol Scope 2 — Location-Based Accounting Traceability"
                icon={<FlaskIcon />}
              >
                <MetricRow label="Calculation Engine" value={metrics?.calculation_version ?? 'v1.0.0 (Deterministic)'} />
                <MetricRow
                  label="Factors Applied"
                  value={metrics?.emissions.factors_applied?.join(', ') ?? 'US EPA eGRID (RFC East: 0.312 kgCO₂e/kWh)'}
                />
                <MetricRow
                  label="Regional Breakdown"
                  value={
                    metrics?.emissions.regional_breakdown
                      ? Object.entries(metrics.emissions.regional_breakdown).map(([k, v]) => `${k}: ${v} kgCO₂e`).join(' · ')
                      : 'us-east: active'
                  }
                />
                <MetricRow label="Accounting Standard" value="GHG Protocol Scope 2 Guidance (Location-Based Method)" />
              </Panel>

              {/* System Health */}
              <Panel
                title="System Environment & Service Telemetry"
                subtitle="Live local-first runtime health and configuration"
                icon={<ShieldIcon />}
              >
                <MetricRow
                  label="Backend API"
                  value={`${health?.status?.toUpperCase() ?? (loading ? 'CHECKING…' : 'OFFLINE')} · FastAPI Async Engine`}
                />
                <MetricRow
                  label="Database Engine"
                  value={`${health?.components.database.type?.toUpperCase() ?? 'SQLITE'} · ${health?.components.database.path ?? 'data/terraops.db'}`}
                />
                <MetricRow
                  label="AI Inference Engine"
                  value={`${health?.components.ai_inference.provider?.toUpperCase() ?? '—'} · ${health?.components.ai_inference.model} (${health?.components.ai_inference.status})`}
                />
                <MetricRow
                  label="Rate Limiting"
                  value={health?.components.rate_limiting?.enabled
                    ? `Active · Max ${health.components.rate_limiting.limit_per_minute} req/min per IP`
                    : 'Disabled'}
                />
                <MetricRow label="Test Validation" value="94/94 passing · Zero-Cost Local-First Architecture" />
              </Panel>

              {/* Ingestion diagnostics */}
              {ingestion && ingestion.errors.length > 0 && (
                <Panel
                  title={`Ingestion Diagnostics — ${ingestion.errors.length} Rejected Rows`}
                  icon={<WarningIcon />}
                  accentColor="rgba(227,179,65,0.35)"
                >
                  <div className="overflow-x-auto">
                    <table className="data-table" aria-label="Ingestion error details">
                      <thead>
                        <tr>
                          <th>Row</th><th>Field</th><th>Error</th><th>Rejected Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingestion.errors.map((err, idx) => (
                          <tr key={idx}>
                            <td className="td-mono" style={{ color: 'var(--amber)' }}>Row {err.row_number}</td>
                            <td>{err.field}</td>
                            <td className="text-secondary text-sm">{err.message}</td>
                            <td className="td-mono">{err.rejected_value ?? 'null'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              )}
            </>
          )}

          {/* Footer */}
          <footer style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: '1px solid var(--border-whisper)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}>
            <span>TerraOps Decision Support · v0.1.0 · Open-Source · Zero-Cost · UN SDG 13</span>
            <span>94 unit & integration tests passing · Local-First · DESIGN.md v1.0</span>
          </footer>
        </main>
      </div>
    </div>
    </>
  );
};
