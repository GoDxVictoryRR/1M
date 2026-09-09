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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Failed to fetch health status: HTTP ${res.status}`);
  }
  return res.json();
}
