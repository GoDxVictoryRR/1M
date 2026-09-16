/**
 * DataBanner — Operational Telemetry Control Center.
 * Features:
 *   - Real-time ingestion telemetry status with animated pulse beacon
 *   - Auto-detection of active dataset from metrics or ingestion result
 *   - Tactile high-contrast action buttons: "Load Demo Telemetry" & "Upload CSV"
 *   - Key dataset metrics pill strip (records, resources, energy total)
 */
import React, { useRef } from 'react';
import { BoltIcon, UploadIcon, DatabaseIcon, CheckIcon } from './icons';
import { IngestionResult, MetricsSummary } from '../api';

export interface DataBannerProps {
  readonly ingestionResult: IngestionResult | null;
  readonly metrics?: MetricsSummary | null;
  readonly onLoadDemo: () => void;
  readonly onUploadCsv: (file: File) => void;
  readonly isLoadingDemo?: boolean;
  readonly isLoadingUpload?: boolean;
}

export const DataBanner: React.FC<DataBannerProps> = ({
  ingestionResult, metrics, onLoadDemo, onUploadCsv,
  isLoadingDemo = false, isLoadingUpload = false,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { onUploadCsv(file); }
    if (fileRef.current) fileRef.current.value = '';
  };

  const hasData = Boolean(ingestionResult || (metrics && metrics.records_count > 0));

  const validRows = ingestionResult?.summary.valid_rows ?? metrics?.records_count ?? 0;
  const totalEnergy = ingestionResult?.summary.total_energy_kwh ?? metrics?.energy.total_energy_kwh.value ?? 0;
  const uniqueResources = ingestionResult?.summary.unique_resources ?? 1;

  return (
    <div className={`data-banner ${hasData ? 'data-banner--active' : 'data-banner--empty'}`}>
      <div className="data-banner-main">
        {/* Status Beacon & Title */}
        <div className="data-banner-status-col">
          <div className="data-banner-beacon-wrap">
            <span className={`data-banner-beacon ${hasData ? 'beacon-live' : 'beacon-idle'}`} />
            <span className="data-banner-title">Operational Telemetry Hub</span>
            {hasData && (
              <span className="data-banner-synced-pill">
                <CheckIcon />
                <span>Deterministic Synced</span>
              </span>
            )}
          </div>

          <div className="data-banner-desc">
            {hasData ? (
              <div className="data-banner-stats-row">
                <span className="telemetry-pill">
                  <DatabaseIcon />
                  <strong className="font-mono">{validRows}</strong> intervals
                </span>
                <span className="telemetry-pill">
                  <span className="telemetry-dot" />
                  <strong className="font-mono">{totalEnergy}</strong> kWh Total
                </span>
                <span className="telemetry-pill">
                  <span className="telemetry-dot" />
                  <strong>{uniqueResources}</strong> node ({metrics?.by_resource_type ? Object.keys(metrics.by_resource_type)[0] ?? 'srv-compute-01' : 'srv-compute-01'})
                </span>
                <span className="telemetry-meta text-xs text-muted">
                  Standard Scope 2 location-based accounting
                </span>
              </div>
            ) : (
              <span className="data-banner-empty-text">
                No active operational telemetry loaded. Ingest the deterministic demo dataset or upload your server telemetry CSV to compute carbon impact.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="data-banner-actions">
        <button
          type="button"
          className="btn btn-primary btn-demo-action"
          onClick={onLoadDemo}
          disabled={isLoadingDemo}
          aria-busy={isLoadingDemo}
        >
          <BoltIcon />
          <span>{isLoadingDemo ? 'Syncing Telemetry…' : 'Load Demo Telemetry'}</span>
        </button>

        <input
          ref={fileRef}
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <button
          type="button"
          className="btn btn-secondary btn-upload-action"
          onClick={() => fileRef.current?.click()}
          disabled={isLoadingUpload}
          aria-busy={isLoadingUpload}
        >
          <UploadIcon />
          <span>{isLoadingUpload ? 'Validating CSV…' : 'Upload Telemetry CSV'}</span>
        </button>
      </div>
    </div>
  );
};
