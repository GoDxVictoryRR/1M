/**
 * Panel — Reusable section container with header/body/actions slots.
 * Per stitch::react-components: each UI primitive is its own module.
 */
import React from 'react';

export interface PanelProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly iconLabel?: string;
  readonly icon?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly accentColor?: string;
  readonly children: React.ReactNode;
  readonly bodyClassName?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title, subtitle, iconLabel, icon, actions,
  accentColor, children, bodyClassName = '',
}) => {
  return (
    <div
      className="panel"
      style={accentColor ? { borderColor: accentColor } : undefined}
    >
      <div className="panel-header">
        <div className="panel-title-block">
          <div className="panel-title">
            {icon ? (
              <span className="panel-icon-svg" aria-hidden="true">{icon}</span>
            ) : iconLabel ? (
              <span className="panel-icon" aria-hidden="true">{iconLabel}</span>
            ) : null}
            {title}
          </div>
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
      <div className={`panel-body ${bodyClassName}`}>{children}</div>
    </div>
  );
};
