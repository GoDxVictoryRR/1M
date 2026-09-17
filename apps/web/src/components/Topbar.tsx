/**
 * Topbar — Institutional sticky header with breadcrumbs, system telemetry, and actions.
 */
import React from 'react';
import { RefreshIcon, DownloadIcon, ActivityIcon, MenuIcon } from './icons';
import { TabKey } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../hooks/useTheme';

const PAGE_META: Record<TabKey, { title: string; subtitle: string; category: string }> = {
  landing:       { category: 'Public', title: 'Landing Page',              subtitle: 'Executive overview, motion preview, and architecture' },
  overview:      { category: 'Analytics', title: 'Overview',              subtitle: 'High-level operational health snapshot and carbon footprint' },
  kpis:         { category: 'Analytics', title: 'KPIs & Trends',           subtitle: 'Period-over-period comparative telemetry and emission variance' },
  anomalies:    { category: 'Analytics', title: 'Anomalies & Forecast',    subtitle: 'Statistical power surge detection and 6-hour demand forecast' },
  interventions: { category: 'Analytics', title: 'Interventions',           subtitle: 'Deterministically ranked multi-attribute sustainability actions' },
  knowledge:    { category: 'Intelligence', title: 'Knowledge & Citations',   subtitle: 'Offline hybrid vectorless retrieval over verified sustainability standards' },
  assistant:    { category: 'Intelligence', title: 'Decision Assistant',      subtitle: 'Read-only sandboxed AI assistant grounded with live telemetry' },
  audit:        { category: 'Intelligence', title: 'Audit & Environment',     subtitle: 'Scope 2 emission factor provenance and local runtime health' },
};

export interface TopbarProps {
  readonly activeTab: TabKey;
  readonly apiStatus: 'live' | 'offline' | 'loading';
  readonly aiProvider: string;
  readonly theme: Theme;
  readonly onToggleTheme: () => void;
  readonly onRefresh: () => void;
  readonly onExport: () => void;
  readonly onGoToLanding?: () => void;
  readonly isRefreshing?: boolean;
  readonly onToggleMobileNav?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab, apiStatus, aiProvider, theme, onToggleTheme,
  onRefresh, onExport, onGoToLanding, isRefreshing = false,
  onToggleMobileNav,
}) => {
  const meta = PAGE_META[activeTab];

  return (
    <header className="topbar">
      <div className="topbar-left">
        {onToggleMobileNav && (
          <button
            type="button"
            className="topbar-mobile-toggle"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation drawer"
          >
            <MenuIcon />
          </button>
        )}

        {/* Breadcrumbs */}
        <div className="topbar-breadcrumb">
          <button
            type="button"
            onClick={onGoToLanding}
            className="breadcrumb-root"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            title="Return to Landing Page"
          >
            TerraOps
          </button>
          <span className="breadcrumb-sep breadcrumb-sep--category" aria-hidden="true">/</span>
          <span className="breadcrumb-category">{meta.category}</span>
          <span className="breadcrumb-sep" aria-hidden="true">/</span>
          <span className="breadcrumb-page">{meta.title}</span>
        </div>
      </div>

      {/* Right Telemetry & Actions */}
      <div className="topbar-right">
        {apiStatus !== 'loading' && (
          <div className="api-status-pill" role="status" aria-live="polite">
            <span
              className={`status-indicator-beacon${apiStatus === 'offline' ? ' offline' : ''}`}
              aria-hidden="true"
            />
            <span className="api-status-text">
              API {apiStatus === 'live' ? 'Online' : 'Offline'}
            </span>
            <span className="api-status-sep">·</span>
            <span className="api-provider-text">{aiProvider}</span>
          </div>
        )}

        <div className="engine-badge-pill">
          <ActivityIcon />
          <span>Local v1.0.0</span>
        </div>

        <div className="topbar-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <button
            type="button"
            className={`btn btn-icon ${isRefreshing ? 'btn-spinning' : ''}`}
            title="Refresh live telemetry"
            aria-label="Refresh live telemetry"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshIcon />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-export"
            onClick={onExport}
            aria-label="Export report as PDF"
          >
            <DownloadIcon />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export { PAGE_META };
