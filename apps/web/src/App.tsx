import React, { useEffect, useState } from 'react';
import { fetchHealth, HealthResponse } from './api';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to TerraOps API backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

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

      {/* Hero */}
      <section className="hero-card">
        <h2 className="hero-title">Zero-Cost Operational Intelligence</h2>
        <p className="hero-description">
          TerraOps turns facility telemetry into prioritized, deterministic, and explainable carbon and energy reduction roadmaps with complete provenance.
        </p>
      </section>

      {/* Status Grid */}
      <div className="status-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Backend API</span>
            <span className={`badge ${health?.status === 'healthy' ? 'badge-success' : error ? 'badge-warning' : 'badge-info'}`}>
              {loading ? 'Checking...' : health?.status === 'healthy' ? '● Online' : '● Offline'}
            </span>
          </div>
          <div className="card-value">
            {health?.status === 'healthy' ? 'v' + health.version : error ? 'Unavailable' : 'Connecting...'}
          </div>
          <div className="card-detail">
            FastAPI Asynchronous Engine on port 8000
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Storage Profile</span>
            <span className="badge badge-success">● Ready</span>
          </div>
          <div className="card-value">
            SQLite (Zero-Setup)
          </div>
          <div className="card-detail">
            Path: {health?.components.database.path || 'data/terraops.db'}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Inference Layer</span>
            <span className="badge badge-info">
              ● {health?.components.ai_inference.status || 'Checking...'}
            </span>
          </div>
          <div className="card-value">
            {health?.components.ai_inference.model || 'qwen3.5:4b'}
          </div>
          <div className="card-detail">
            Fallback: {health?.components.ai_inference.fallback_mode || 'Deterministic templates'}
          </div>
        </div>
      </div>

      {/* Details & Architecture Info */}
      <section className="details-section">
        <h3 className="details-title">
          <span>System Environment & Diagnostics</span>
        </h3>
        <table className="details-table">
          <tbody>
            <tr>
              <td>Application Status</td>
              <td>{health?.status || (error ? 'Backend connection failed' : 'Loading...')}</td>
            </tr>
            <tr>
              <td>Current Bootstrap Phase</td>
              <td>Phase 1 — Bootstrap (Skeleton Verified)</td>
            </tr>
            <tr>
              <td>Architecture Pattern</td>
              <td>Modular Monolith (Presentation / API / Services / Domain / Infra)</td>
            </tr>
            <tr>
              <td>Database Backend</td>
              <td>{health?.components.database.type.toUpperCase() || 'SQLITE'} ({health?.components.database.status || 'Active'})</td>
            </tr>
            <tr>
              <td>Local AI Engine</td>
              <td>Ollama Local Adapter ({health?.components.ai_inference.status || 'Pending'})</td>
            </tr>
            <tr>
              <td>Last Diagnostic Ping</td>
              <td>{health?.timestamp || (error ? error : 'Connecting...')}</td>
            </tr>
          </tbody>
        </table>

        <div className="actions-row">
          <button className="btn" onClick={loadHealth}>
            Refresh Health
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p>TerraOps Decision Support • ₹0 Zero-Cost Open-Source Implementation • Local First</p>
      </footer>
    </div>
  );
};
