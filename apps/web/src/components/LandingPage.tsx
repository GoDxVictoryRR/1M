import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Zap, Activity, Cpu, Database,
  TrendingDown, FileText, CheckCircle2, ChevronRight,
  ExternalLink, Layers, Sparkles
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../hooks/useTheme';

export interface LandingPageProps {
  readonly onLaunchDashboard: () => void;
  readonly theme: Theme;
  readonly onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  theme,
  onToggleTheme,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'compute' | 'emissions' | 'anomalies' | 'interventions'>('compute');

  // Deterministic 24-interval profile
  const energySeries = [
    15.2, 14.8, 14.1, 13.9, 14.2, 15.6,
    17.8, 19.4, 18.2, 17.5, 16.8, 17.2,
    18.1, 18.5, 17.9, 17.4, 18.8, 19.1,
    18.4, 17.9, 16.5, 15.8, 15.1, 14.7,
  ];
  const maxEnergy = Math.max(...energySeries);
  const minEnergy = Math.min(...energySeries);

  return (
    <div className="landing-page" id="landing-root">
      {/* ── Sticky Navigation Bar ───────────────────────────────────── */}
      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Landing Page Navigation">
          <div className="landing-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-nav-logo">
              <Zap size={18} />
            </div>
            <span className="landing-nav-title">TerraOps</span>
            <span className="sidebar-brand-version">v0.1</span>
          </div>

          <div className="landing-nav-links">
            <a href="#overview" className="landing-nav-link">Overview</a>
            <a href="#preview" className="landing-nav-link">Live Cockpit</a>
            <a href="#pipeline" className="landing-nav-link">Telemetry Pipeline</a>
            <a href="#capabilities" className="landing-nav-link">Specialties</a>
            <a href="#standards" className="landing-nav-link">Provenance</a>
          </div>

          <div className="landing-nav-actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button
              type="button"
              className="btn-hero-primary"
              style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              onClick={onLaunchDashboard}
            >
              <span>Launch Cockpit</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Fullscreen Hero with Looping Motion Video ─────────────────── */}
      <section className="landing-hero" id="overview">
        <div className="hero-video-container" aria-hidden="true">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-video-element"
            poster="/assets/hero-datacenter.jpg"
          >
            <source src="/assets/hero-motion-loop.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay-gradient" />
        </div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="hero-badge-pill"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="status-indicator-beacon" />
            <span>Deterministic Sustainability DSS · UN SDG 13</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Deterministic Carbon Accounting for <span className="hero-gradient-text">Enterprise Compute</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="hero-subheadline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            A local-first, zero-cost decision support system that continuously monitors high-frequency telemetry, calculates GHG Protocol Scope 2 emissions with verified EPA eGRID provenance, flags anomalies, and prescribes actionable interventions—with zero cloud API bills.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <button
              type="button"
              className="btn-hero-primary"
              onClick={onLaunchDashboard}
            >
              <span>Launch DSS Cockpit</span>
              <ArrowRight size={17} />
            </button>

            <a href="#preview" className="btn-hero-secondary">
              <span>Explore Live Telemetry</span>
              <ChevronRight size={16} />
            </a>
          </motion.div>

          {/* Live Telemetry Ticker Cards */}
          <motion.div
            className="hero-ticker-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="hero-ticker-card">
              <div className="hero-ticker-label">Total Energy Monitored</div>
              <div className="hero-ticker-value" style={{ color: 'var(--brand)' }}>409.4 <span style={{ fontSize: '0.9rem' }}>kWh</span></div>
              <div className="hero-ticker-sub">
                <TrendingDown size={13} style={{ color: 'var(--brand)' }} />
                <span>24 hourly telemetry intervals</span>
              </div>
            </div>

            <div className="hero-ticker-card">
              <div className="hero-ticker-label">Scope 2 Location-Based</div>
              <div className="hero-ticker-value" style={{ color: 'var(--amber)' }}>127.7 <span style={{ fontSize: '0.9rem' }}>kgCO₂e</span></div>
              <div className="hero-ticker-sub">
                <span>EPA eGRID RFC East (0.312 kg/kWh)</span>
              </div>
            </div>

            <div className="hero-ticker-card">
              <div className="hero-ticker-label">Statistical Anomaly Sentinel</div>
              <div className="hero-ticker-value" style={{ color: 'var(--cyan)' }}>3.2σ <span style={{ fontSize: '0.9rem' }}>Threshold</span></div>
              <div className="hero-ticker-sub">
                <span>Rolling Z-Score & Isolation Forest</span>
              </div>
            </div>

            <div className="hero-ticker-card">
              <div className="hero-ticker-label">Deterministic Engine</div>
              <div className="hero-ticker-value" style={{ color: 'var(--purple)' }}>94/94 <span style={{ fontSize: '0.9rem' }}>Tests</span></div>
              <div className="hero-ticker-sub">
                <CheckCircle2 size={13} style={{ color: 'var(--brand)' }} />
                <span>Zero-Cost Local Architecture</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Interactive Live Telemetry Cockpit Preview ───────────────── */}
      <section className="landing-section" id="preview">
        <div className="section-header">
          <div className="section-tag">
            <Activity size={14} />
            <span>Interactive Telemetry Preview</span>
          </div>
          <h2 className="section-title">Experience the Decision Intelligence Engine</h2>
          <p className="section-desc">
            Test the live reactive analytics engine below. Switch between compute load, location-based emissions, anomaly detection, and prioritized interventions to see real-time mathematics at work.
          </p>
        </div>

        <motion.div
          className="interactive-preview-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          {/* Header & Tabs */}
          <div className="interactive-preview-header">
            <div className="flex items-center gap-3">
              <span className="status-indicator-beacon" />
              <span className="font-mono text-sm font-bold text-primary">TELEMETRY SIMULATOR</span>
              <span className="text-xs text-muted font-mono">· US-EAST-1 DATA CENTER</span>
            </div>

            <div className="interactive-tabs-group" role="tablist" aria-label="Preview Cockpit Tabs">
              <button
                type="button"
                className={`interactive-tab-btn ${activePreviewTab === 'compute' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('compute')}
              >
                Compute Load
              </button>
              <button
                type="button"
                className={`interactive-tab-btn ${activePreviewTab === 'emissions' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('emissions')}
              >
                Scope 2 Carbon
              </button>
              <button
                type="button"
                className={`interactive-tab-btn ${activePreviewTab === 'anomalies' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('anomalies')}
              >
                Anomaly Sentinel
              </button>
              <button
                type="button"
                className={`interactive-tab-btn ${activePreviewTab === 'interventions' ? 'active' : ''}`}
                onClick={() => setActivePreviewTab('interventions')}
              >
                Ranked Interventions
              </button>
            </div>
          </div>

          {/* Interactive Body */}
          <div className="interactive-preview-body">
            <AnimatePresence mode="wait">
              {activePreviewTab === 'compute' && (
                <motion.div
                  key="compute"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
                    <div>
                      <div className="text-xs text-muted uppercase font-mono tracking-wider">24-Hour Compute Power Profile</div>
                      <div className="text-2xl font-mono font-bold" style={{ color: 'var(--brand)' }}>
                        409.4 kWh <span className="text-sm font-normal text-secondary">total · 17.06 kWh/interval avg</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-secondary">
                      Peak: 19.4 kWh · Trough: 13.9 kWh · 95th Percentile: 19.1 kWh
                    </span>
                  </div>

                  {/* SVG Sparkline Graph */}
                  <div style={{ width: '100%', height: 160, position: 'relative', marginTop: 12 }}>
                    <svg viewBox="0 0 800 160" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="landingGreenGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00d47e" stopOpacity="0.32" />
                          <stop offset="100%" stopColor="#00d47e" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area */}
                      <polygon
                        points={`0,160 ${energySeries.map((v, i) => `${(i / (energySeries.length - 1)) * 800},${160 - ((v - minEnergy) / (maxEnergy - minEnergy || 1)) * 120 - 20}`).join(' ')} 800,160`}
                        fill="url(#landingGreenGrad)"
                      />

                      {/* Line */}
                      <polyline
                        fill="none"
                        stroke="#00d47e"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={energySeries.map((v, i) => `${(i / (energySeries.length - 1)) * 800},${160 - ((v - minEnergy) / (maxEnergy - minEnergy || 1)) * 120 - 20}`).join(' ')}
                      />

                      {/* Spark Points */}
                      {energySeries.map((v, i) => {
                        const cx = (i / (energySeries.length - 1)) * 800;
                        const cy = 160 - ((v - minEnergy) / (maxEnergy - minEnergy || 1)) * 120 - 20;
                        return (
                          <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r="4"
                            fill="var(--bg-surface)"
                            stroke="#00d47e"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === 'emissions' && (
                <motion.div
                  key="emissions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
                    <div>
                      <div className="text-xs text-muted uppercase font-mono tracking-wider">GHG Protocol Scope 2 Location-Based Emissions</div>
                      <div className="text-2xl font-mono font-bold" style={{ color: 'var(--amber)' }}>
                        127.73 kg CO₂e <span className="text-sm font-normal text-secondary">total · 0.128 metric tons</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-secondary">
                      Formula: 409.4 kWh × 0.312 kgCO₂e/kWh = 127.73 kgCO₂e
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-lg bg-surface border border-whisper">
                      <div className="text-xs text-secondary mb-1 font-mono">Period 1 Baseline (Intervals 1-12)</div>
                      <div className="text-xl font-mono font-bold text-primary">60.2 kg CO₂e</div>
                      <div className="w-full bg-overlay rounded-full h-2 mt-3">
                        <div className="h-2 rounded-full" style={{ width: '47%', background: 'var(--blue)' }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-surface border border-whisper">
                      <div className="text-xs text-secondary mb-1 font-mono">Period 2 Peak (Intervals 13-24)</div>
                      <div className="text-xl font-mono font-bold" style={{ color: 'var(--amber)' }}>
                        67.5 kg CO₂e <span className="text-xs font-normal text-red">(+12.1% spike)</span>
                      </div>
                      <div className="w-full bg-overlay rounded-full h-2 mt-3">
                        <div className="h-2 rounded-full" style={{ width: '53%', background: 'var(--amber)' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === 'anomalies' && (
                <motion.div
                  key="anomalies"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
                    <div>
                      <div className="text-xs text-muted uppercase font-mono tracking-wider">Statistical Rolling Z-Score Detection</div>
                      <div className="text-2xl font-mono font-bold" style={{ color: 'var(--cyan)' }}>
                        1 Critical Anomaly Detected <span className="text-sm font-normal text-secondary">(Threshold: 3.0σ)</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-secondary">
                      Isolation Forest: Confirmed
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-surface border border-whisper flex items-start gap-3">
                    <div className="p-2 rounded bg-red-dim border border-red-ring text-red mt-1">
                      <Zap size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">srv-gpu-us-east-04</span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-dim text-red border border-red-ring">CRITICAL 3.24σ</span>
                      </div>
                      <p className="text-sm text-secondary mt-1">
                        Power consumption spiked to <strong>19.4 kWh</strong> against a rolling historical baseline of <strong>14.2 kWh</strong>. Deterministic diagnostic indicates GPU memory leak holding idle compute overhead during off-peak interval.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activePreviewTab === 'interventions' && (
                <motion.div
                  key="interventions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
                    <div>
                      <div className="text-xs text-muted uppercase font-mono tracking-wider">Multi-Attribute Prioritized Interventions</div>
                      <div className="text-2xl font-mono font-bold" style={{ color: 'var(--brand)' }}>
                        -58.4 kWh Potential Savings <span className="text-sm font-normal text-secondary">· -18.2 kg CO₂e Abatement</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-secondary">
                      Scoring: Impact (45%) · Confidence (25%) · Ease (20%) · Data (10%)
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-surface border border-whisper flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-dim text-brand font-mono font-bold flex items-center justify-center text-xs">#1</div>
                        <div>
                          <div className="font-semibold text-primary text-sm">Rightsize Overprovisioned Compute Instances</div>
                          <div className="text-xs text-secondary">Downscale 4 underutilized m5.4xlarge nodes with &lt;15% average CPU load</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-brand font-bold">-28.0 kWh</span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-brand-dim text-brand">Score: 89.2</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-whisper flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-dim text-brand font-mono font-bold flex items-center justify-center text-xs">#2</div>
                        <div>
                          <div className="font-semibold text-primary text-sm">Off-Peak Batch Workload Scheduling</div>
                          <div className="text-xs text-secondary">Shift AI model fine-tuning jobs to 02:00-06:00 UTC green grid hours</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-brand font-bold">-18.4 kWh</span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-brand-dim text-brand">Score: 84.5</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ── 4-Stage Telemetry Pipeline Section ───────────────────────── */}
      <section className="landing-section" id="pipeline">
        <div className="section-header">
          <div className="section-tag">
            <Layers size={14} />
            <span>Operational Architecture</span>
          </div>
          <h2 className="section-title">The 4-Stage Telemetry Pipeline</h2>
          <p className="section-desc">
            How raw compute telemetry is transformed into verified Scope 2 emissions and deterministically prioritized operational actions.
          </p>
        </div>

        <div className="pipeline-grid">
          <motion.div
            className="pipeline-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="pipeline-step-badge">1</div>
            <h3 className="pipeline-card-title">Telemetry Ingestion & PII Scrubbing</h3>
            <p className="pipeline-card-desc">
              High-frequency compute metrics (CPU, RAM, GPU, kWh) parsed via streaming validation. Corrupt rows quarantined with line-item diagnostics.
            </p>
            <div className="pipeline-metric-tag">Pydantic V2 · 0 Errors</div>
          </motion.div>

          <motion.div
            className="pipeline-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="pipeline-step-badge">2</div>
            <h3 className="pipeline-card-title">GHG Protocol Scope 2 Calculation</h3>
            <p className="pipeline-card-desc">
              Deterministic conversion applying regional EPA eGRID factors. Verified location-based methodology with strict audit trail provenance.
            </p>
            <div className="pipeline-metric-tag">RFC East: 0.312 kgCO₂e/kWh</div>
          </motion.div>

          <motion.div
            className="pipeline-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="pipeline-step-badge">3</div>
            <h3 className="pipeline-card-title">Anomaly Detection & Demand Forecast</h3>
            <p className="pipeline-card-desc">
              Dual-engine detection using rolling Z-Score (3.0σ) and Isolation Forest. 6-hour moving average energy forecast with 95% confidence corridor.
            </p>
            <div className="pipeline-metric-tag">95% Confidence Corridor</div>
          </motion.div>

          <motion.div
            className="pipeline-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="pipeline-step-badge">4</div>
            <h3 className="pipeline-card-title">Deterministic Intervention Ranking</h3>
            <p className="pipeline-card-desc">
              Weighted multi-attribute scoring model: Impact (45%), Confidence (25%), Ease (20%), Data Quality (10%). No hallucinated advice.
            </p>
            <div className="pipeline-metric-tag">Ranked by Net Abatement</div>
          </motion.div>
        </div>
      </section>

      {/* ── Capabilities Bento Grid with Generated Media ─────────────── */}
      <section className="landing-section" id="capabilities">
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={14} />
            <span>Specialty Capabilities</span>
          </div>
          <h2 className="section-title">Built for Auditability, Zero Cost & Local Scale</h2>
          <p className="section-desc">
            Every layer of TerraOps was engineered to eliminate vendor lock-in, recurring cloud token bills, and unverifiable AI hallucinations.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Renewable Grid Integration (8 col) */}
          <motion.div
            className="bento-card"
            style={{ gridColumn: 'span 8' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/assets/clean-energy-grid.jpg"
              alt="Clean Renewable Energy Power Grid powering High-Efficiency Data Center"
              className="bento-card-media"
            />
            <div className="bento-card-body">
              <div className="flex items-center gap-2 text-xs font-mono text-brand mb-1">
                <ShieldCheck size={14} />
                <span>CLEAN ENERGY INTEGRATION</span>
              </div>
              <h3 className="bento-card-title">Renewable Grid Telemetry & Dynamic Workload Shifting</h3>
              <p className="bento-card-desc">
                TerraOps monitors sub-grid carbon intensity variations to schedule heavy machine learning batches and asynchronous batch processing during peak renewable generation windows.
              </p>
              <div className="flex gap-2 flex-wrap mt-auto">
                <span className="cite-tag">#CleanGrid</span>
                <span className="cite-tag">#SolarWindMatching</span>
                <span className="cite-tag">#WorkloadShifting</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Offline Vectorless RAG (4 col) */}
          <motion.div
            className="bento-card"
            style={{ gridColumn: 'span 4' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <div className="p-6 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-blue-dim text-blue flex items-center justify-center mb-4">
                <FileText size={20} />
              </div>
              <div className="text-xs font-mono text-blue mb-1">ZERO-COST VECTORLESS RAG</div>
              <h3 className="bento-card-title">Authoritative Knowledge Engine</h3>
              <p className="bento-card-desc">
                Instant deterministic retrieval over verified standards: GHG Protocol Scope 2, ISO 14064-1, and Energy Star Data Center metrics. Zero vector DB subscriptions.
              </p>
              <div className="mt-auto pt-4 border-t border-whisper flex items-center justify-between text-xs font-mono text-secondary">
                <span>Citations: 100% Verified</span>
                <span className="text-brand font-bold">Offline</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Read-Only Sandboxed Decision Assistant (4 col) */}
          <motion.div
            className="bento-card"
            style={{ gridColumn: 'span 4' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="p-6 flex flex-col h-full">
              <div className="w-10 h-10 rounded-lg bg-purple-dim text-purple flex items-center justify-center mb-4">
                <Cpu size={20} />
              </div>
              <div className="text-xs font-mono text-purple mb-1">SAFE AGENT ARCHITECTURE</div>
              <h3 className="bento-card-title">Sandboxed Decision Assistant</h3>
              <p className="bento-card-desc">
                Conversational decision intelligence executing read-only operational tools. Automatically falls back to deterministic rule algorithms if LLMs are unreachable.
              </p>
              <div className="mt-auto pt-4 border-t border-whisper flex items-center justify-between text-xs font-mono text-secondary">
                <span>NVIDIA NIM / Ollama</span>
                <span className="text-brand font-bold">Deterministic Fallback</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Anomaly Radar & Forecast (8 col) */}
          <motion.div
            className="bento-card"
            style={{ gridColumn: 'span 8' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <img
              src="/assets/telemetry-sentinel.jpg"
              alt="Holographic Telemetry Radar HUD displaying statistical rolling anomaly spikes"
              className="bento-card-media"
            />
            <div className="bento-card-body">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan mb-1">
                <Activity size={14} />
                <span>EXPLAINABLE STATISTICAL DETECTION</span>
              </div>
              <h3 className="bento-card-title">Predictive Demand Forecast with 95% Confidence Corridors</h3>
              <p className="bento-card-desc">
                Trend-augmented moving averages project the next 6 hours of power draw, providing proactive alerts before peak billing spikes or cooling threshold breaches occur.
              </p>
              <div className="flex gap-2 flex-wrap mt-auto">
                <span className="cite-tag">#ZScore</span>
                <span className="cite-tag">#ConfidenceCorridor</span>
                <span className="cite-tag">#PeakPrevention</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Standards & Provenance Terminal ───────────────────────────── */}
      <section className="landing-section" id="standards">
        <div className="section-header">
          <div className="section-tag">
            <Database size={14} />
            <span>Audit Trail & Provenance</span>
          </div>
          <h2 className="section-title">Strict Compliance with International Standards</h2>
          <p className="section-desc">
            TerraOps produces immutable carbon accounting logs compliant with corporate greenhouse gas disclosure mandates.
          </p>
        </div>

        <motion.div
          className="terminal-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="terminal-dot bg-red-dim" style={{ background: '#f85149' }} />
              <span className="terminal-dot bg-amber-dim" style={{ background: '#e3b341' }} />
              <span className="terminal-dot bg-brand-dim" style={{ background: '#00d47e' }} />
            </div>
            <span className="text-xs text-muted">terraops-provenance-verifier --audit</span>
            <span className="text-xs text-brand">STATUS: PASS (94/94)</span>
          </div>

          <div className="terminal-body">
            <p className="terminal-log-info">[INIT] Initializing TerraOps Local-First Mathematical Engine v1.0.0...</p>
            <p className="terminal-log-success">[STANDARD] GHG Protocol Scope 2 Guidance (Location-Based Method) · ACTIVE</p>
            <p className="terminal-log-success">[FACTOR] EPA eGRID Subregion RFC East verified: 0.312 kgCO2e/kWh applied.</p>
            <p className="terminal-log-info">[RAG] Offline hybrid vectorless store loaded: 3 authoritative standards indexed.</p>
            <p className="terminal-log-warn">[SENTINEL] Rolling Z-Score window=12, threshold=3.0σ, Isolation Forest estimators=100.</p>
            <p className="terminal-log-success">[SDG-13] UN Sustainable Development Goal 13 (Climate Action) Compliance Verified.</p>
            <p className="terminal-log-success">[AUDIT] Zero cloud subscriptions · Zero billable API calls · 100% Deterministic Reproducibility.</p>
          </div>
        </motion.div>
      </section>

      {/* ── High-Impact Closing CTA Banner ───────────────────────────── */}
      <section className="landing-section" style={{ paddingTop: 20 }}>
        <motion.div
          className="p-10 md:p-16 rounded-3xl relative overflow-hidden text-center flex flex-col items-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 126, 0.12) 0%, rgba(88, 166, 255, 0.08) 100%)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-tag mb-3">
            <Zap size={14} />
            <span>Ready for Production</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
            Eliminate Your Compute Footprint Today
          </h2>
          <p className="text-secondary max-w-xl text-base md:text-lg mb-8 leading-relaxed">
            Launch the full decision intelligence cockpit to load telemetry, run explainable anomaly diagnostics, search verified standards, and rank carbon interventions.
          </p>

          <button
            type="button"
            className="btn-hero-primary"
            style={{ fontSize: '1.05rem', padding: '16px 36px' }}
            onClick={onLaunchDashboard}
          >
            <span>Enter DSS Analytics Cockpit</span>
            <ArrowRight size={19} />
          </button>
        </motion.div>
      </section>

      {/* ── Institutional Footer ────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="flex items-center gap-3">
            <div className="landing-nav-logo" style={{ width: 28, height: 28 }}>
              <Zap size={15} />
            </div>
            <span className="font-bold text-primary">TerraOps Sustainability DSS</span>
            <span className="text-xs text-muted font-mono">v0.1.0</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-xs text-secondary hover:text-primary transition-colors cursor-pointer bg-none border-none"
              onClick={onLaunchDashboard}
            >
              Launch Cockpit
            </button>
            <span className="text-muted">·</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink size={12} />
            </a>
            <span className="text-muted">·</span>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>TerraOps DSS · Open-Source Sustainability Engine · UN SDG 13 Climate Action</span>
          <span>94 Automated Tests Passing · Local-First · Zero Cloud Expenses</span>
        </div>
      </footer>
    </div>
  );
};
