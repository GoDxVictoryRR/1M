import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Theme } from '../hooks/useTheme';

export interface ThemeToggleProps {
  readonly theme: Theme;
  readonly onToggle: () => void;
  readonly className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Switch to Daylight Studio (Light Mode)' : 'Switch to Clinical Midnight (Dark Mode)'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={!isDark}
    >
      <span className="theme-toggle-icon-wrap" aria-hidden="true">
        {isDark ? (
          <Sun className="theme-toggle-icon sun" size={16} />
        ) : (
          <Moon className="theme-toggle-icon moon" size={16} />
        )}
      </span>
      <span className="theme-toggle-label font-mono">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};
