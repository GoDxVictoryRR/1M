/**
 * Sidebar — Institutional left navigation bar.
 * Features:
 *   - Luminous brand emblem with calibrated emerald glow
 *   - Sectional category partitioning (Analytics & Intelligence)
 *   - Active state with glowing emerald accent indicator
 *   - Dynamic badge indicators for anomaly spikes and intervention items
 *   - UN SDG 13 active accreditation status footer
 */
import React from 'react';
import {
  BoltIcon, GridIcon, ChartIcon, WarningIcon,
  SparkleIcon, BookIcon, RobotIcon, ShieldIcon, LeafIcon,
} from './icons';

export type TabKey = 'landing' | 'overview' | 'kpis' | 'anomalies' | 'interventions' | 'knowledge' | 'assistant' | 'audit';

export interface NavItem {
  readonly key: TabKey;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly badge?: number;
  readonly badgeVariant?: 'brand' | 'amber' | 'blue';
}

export interface SidebarProps {
  readonly activeTab: TabKey;
  readonly onTabChange: (tab: TabKey) => void;
  readonly anomaliesCount?: number;
  readonly interventionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, onTabChange,
  anomaliesCount, interventionsCount,
}) => {
  const analyticsItems: NavItem[] = [
    { key: 'overview',      label: 'Overview',             icon: <GridIcon /> },
    { key: 'kpis',         label: 'KPIs & Trends',         icon: <ChartIcon /> },
    {
      key: 'anomalies',
      label: 'Anomalies & Forecast',
      icon: <WarningIcon />,
      badge: anomaliesCount,
      badgeVariant: 'amber',
    },
    {
      key: 'interventions',
      label: 'Interventions',
      icon: <SparkleIcon />,
      badge: interventionsCount,
      badgeVariant: 'brand',
    },
  ];

  const intelligenceItems: NavItem[] = [
    { key: 'knowledge',    label: 'Knowledge & Citations',  icon: <BookIcon /> },
    { key: 'assistant',    label: 'Decision Assistant',     icon: <RobotIcon /> },
    { key: 'audit',        label: 'Audit & Environment',   icon: <ShieldIcon /> },
  ];

  const renderNavGroup = (items: NavItem[]) => (
    items.map(item => (
      <button
        key={item.key}
        className={`nav-item${activeTab === item.key ? ' active' : ''}`}
        onClick={() => onTabChange(item.key)}
        aria-current={activeTab === item.key ? 'page' : undefined}
        type="button"
      >
        <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>
        <span className="nav-item-label">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className={`nav-item-badge badge-${item.badgeVariant ?? 'brand'} font-mono`}>
            {item.badge}
          </span>
        )}
      </button>
    ))
  );

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        className="sidebar-brand"
        onClick={() => onTabChange('landing')}
        style={{ cursor: 'pointer' }}
        title="Return to Landing Page"
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') onTabChange('landing'); }}
      >
        <div className="sidebar-logo" aria-hidden="true">
          <BoltIcon />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name-wrap">
            <span className="sidebar-brand-name">TerraOps</span>
            <span className="sidebar-brand-version">v0.1</span>
          </div>
          <span className="sidebar-brand-sub">Sustainability DSS</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav" aria-label="Primary navigation">
        <div className="sidebar-nav-section" style={{ marginBottom: 14 }}>
          <button
            type="button"
            className={`nav-item${activeTab === 'landing' ? ' active' : ''}`}
            onClick={() => onTabChange('landing')}
            aria-current={activeTab === 'landing' ? 'page' : undefined}
          >
            <span className="nav-item-icon" aria-hidden="true"><SparkleIcon /></span>
            <span className="nav-item-label">Landing Page</span>
            <span className="nav-item-badge badge-brand font-mono">HOME</span>
          </button>
        </div>

        <div className="sidebar-nav-section">
          <span className="sidebar-section-label" aria-hidden="true">Analytics Engine</span>
          <div className="sidebar-nav-list">
            {renderNavGroup(analyticsItems)}
          </div>
        </div>

        <div className="sidebar-nav-section" style={{ marginTop: 18 }}>
          <span className="sidebar-section-label" aria-hidden="true">Decision Intelligence</span>
          <div className="sidebar-nav-list">
            {renderNavGroup(intelligenceItems)}
          </div>
        </div>
      </nav>

      {/* Footer / UN SDG 13 Badge */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <div className="sdg-chip" role="status" aria-label="UN SDG 13 Climate Action active">
            <span className="sdg-pulse" aria-hidden="true" />
            <LeafIcon />
            <span>UN SDG 13 · Climate Action</span>
          </div>
          <div className="sidebar-footer-meta">
            <span>Local-First · Zero-Cost Architecture</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
