export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  timestamp: string;
  components: {
    database: {
      type: string;
      path: string;
      status: string;
    };
    ai_inference: {
      provider: string;
      model: string;
      status: string;
      fallback_mode: string;
    };
  };
}

export interface MetricValue {
  name: string;
  value: number;
  unit: string;
  factor_id?: string;
  source?: string;
  calculation_version: string;
  uncertainty_note?: string;
}

export interface DatasetSummary {
  total_rows: number;
  valid_rows: number;
  error_count: number;
  unique_resources: number;
  resource_types: string[];
  regions: string[];
  total_energy_kwh: number;
  start_time?: string;
  end_time?: string;
}

export interface IngestionResult {
  status: string;
  summary: DatasetSummary;
  errors: Array<{
    row_number: number;
    field: string;
    rejected_value?: string;
    message: string;
    error_code: string;
  }>;
  raw_sample: any[];
}

export interface MetricsSummary {
  calculation_version: string;
  records_count: number;
  energy: {
    total_energy_kwh: MetricValue;
    total_energy_mwh: MetricValue;
    average_hourly_kwh: MetricValue;
  };
  emissions: {
    total_emissions_kgco2e: MetricValue;
    total_emissions_tco2e: MetricValue;
    factors_applied: string[];
    regional_breakdown: Record<string, number>;
  };
  utilization: {
    mean_utilization: MetricValue;
    peak_utilization: MetricValue;
    p95_utilization: MetricValue;
    idle_capacity_ratio: MetricValue;
  };
  period_comparison?: {
    baseline_energy_kwh: number;
    current_energy_kwh: number;
    energy_delta_percent: number;
    baseline_emissions_kgco2e: number;
    current_emissions_kgco2e: number;
    emissions_delta_percent: number;
    description: string;
  };
  by_resource_type: Record<string, { energy_kwh: number; emissions_kgco2e: number }>;
}

export interface AnomalyItem {
  timestamp: string;
  resource_id: string;
  metric_name: string;
  actual_value: number;
  expected_value: number;
  anomaly_score: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  method: string;
  explanation: string;
}

export interface AnomalyReport {
  total_records_analyzed: number;
  anomalies_detected: number;
  method: string;
  threshold: number;
  items: AnomalyItem[];
}

export interface ForecastPoint {
  timestamp: string;
  predicted_energy_kwh: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastReport {
  status: 'success' | 'insufficient_data';
  method: string;
  historical_points: number;
  horizon_intervals: number;
  points: Array<{
    timestamp: string;
    predicted_energy_kwh: number;
    lower_bound: number;
    upper_bound: number;
  }>;
  model_metrics: Record<string, number>;
  note?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  category: string;
  target_resource: string;
  description: string;
  estimated_energy_savings_kwh: number;
  estimated_emissions_reduction_kgco2e: number;
  impact_score: number;
  confidence_score: number;
  effort: 'low' | 'medium' | 'high';
  effort_score: number;
  data_quality_score: number;
  overall_score: number;
  suggested_action: string;
  provenance: Record<string, any>;
}

export interface RecommendationReport {
  total_interventions: number;
  potential_energy_savings_kwh: number;
  potential_emissions_reduction_kgco2e: number;
  items: Recommendation[];
}

export interface RagCitation {
  chunk_id: string;
  source_id: string;
  title: string;
  publisher: string;
  date: string;
  tags: string[];
  url: string;
  section_title: string;
  content: string;
  similarity_score: number;
}

export interface RagSearchResponse {
  query: string;
  top_k: number;
  threshold: number;
  total_citations: number;
  insufficient_evidence: boolean;
  warning?: string;
  citations: RagCitation[];
}

export interface RagDocumentInfo {
  doc_id: string;
  title: string;
  publisher: string;
  date: string;
  tags: string[];
  url: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function loadDemoData(): Promise<IngestionResult> {
  const res = await fetch(`${API_BASE_URL}/api/data/demo`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to load demo data: HTTP ${res.status}`);
  return res.json();
}

export async function fetchMetricsSummary(): Promise<MetricsSummary> {
  const res = await fetch(`${API_BASE_URL}/api/metrics/summary`);
  if (!res.ok) throw new Error(`Failed to fetch metrics: HTTP ${res.status}`);
  return res.json();
}

export async function uploadCsvFile(file: File): Promise<IngestionResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/data/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function fetchAnomalies(method = 'rolling_zscore'): Promise<AnomalyReport> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/anomalies?method=${method}`);
  if (!res.ok) throw new Error(`Failed to fetch anomalies: HTTP ${res.status}`);
  return res.json();
}

export async function fetchForecast(horizon = 6): Promise<ForecastReport> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/forecast?horizon=${horizon}`);
  if (!res.ok) throw new Error(`Failed to fetch forecast: HTTP ${res.status}`);
  return res.json();
}

export async function fetchRecommendations(): Promise<RecommendationReport> {
  const res = await fetch(`${API_BASE_URL}/api/recommendations`);
  if (!res.ok) throw new Error(`Failed to fetch recommendations: HTTP ${res.status}`);
  return res.json();
}

export async function searchRagKnowledge(query: string, topK = 3): Promise<RagSearchResponse> {
  const res = await fetch(`${API_BASE_URL}/api/rag/search?query=${encodeURIComponent(query)}&top_k=${topK}`);
  if (!res.ok) throw new Error(`Failed to search knowledge: HTTP ${res.status}`);
  return res.json();
}

export async function fetchRagDocuments(): Promise<RagDocumentInfo[]> {
  const res = await fetch(`${API_BASE_URL}/api/rag/documents`);
  if (!res.ok) throw new Error(`Failed to fetch documents: HTTP ${res.status}`);
  return res.json();
}
