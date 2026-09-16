/**
 * SiteLoader.tsx — Awwwards-Caliber Staggered Shutter Telemetry Loader
 * 
 * Features:
 * - 5-Column Staggered Kinetic Shutter Wipe (signature Awwwards reveal)
 * - Rotating 3D Isometric Wireframe Compute Node with pulsing emerald core
 * - Dynamic 14-bar Telemetry Frequency Spectrum
 * - Huge Minimal Monospace Kinetic Counter (000 -> 100%)
 * - Architectural Crosshair Grid Markers & Single-Line Telemetry Ticker
 * - Full Dual-Theme Support: Architectural Pure White (Light Mode) & Deep Obsidian Void (Dark Mode)
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SiteLoaderProps {
  theme?: 'dark' | 'light';
  onComplete: () => void;
}

const TELEMETRY_STAGES = [
  'INITIALIZING COMPUTE BUS // PYDANTIC V2 STREAMING',
  'MOUNTING EPA eGRID RFC EAST // 0.312 kgCO₂e/kWh',
  'LOCKING STATISTICAL SENTINEL // 3.0σ CORRIDOR',
  'COMPUTE TOPOLOGY READY // DETERMINISTIC CORE ONLINE',
];

const COLUMNS = [0, 1, 2, 3, 4];
const SPECTRUM_BARS = Array.from({ length: 14 });

export const SiteLoader: React.FC<SiteLoaderProps> = ({ theme = 'dark', onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1400; // 1.4s smooth calibration

    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(1, elapsed / duration);
      // Cinematic cubic ease-out
      const eased = 1 - Math.pow(1 - raw, 3);
      const current = Math.round(eased * 100);

      setProgress(current);

      if (raw < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => {
          setIsDone(true);
          // Allow all 5 staggered columns to finish sliding up before unmounting
          setTimeout(onComplete, 750);
        }, 160);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const stageIndex = progress < 25 ? 0 : progress < 55 ? 1 : progress < 85 ? 2 : 3;

  return (
    <div
      className={`awwwards-loader-root ${isLight ? 'awwwards-loader--light' : 'awwwards-loader--dark'}`}
      aria-live="polite"
      aria-busy="true"
    >
      {/* ── 5-Column Staggered Shutter Panels (The Awwwards Curtain Reveal) ── */}
      <div className="awwwards-columns-wrap" aria-hidden="true">
        {COLUMNS.map((colIndex) => (
          <motion.div
            key={colIndex}
            className="awwwards-column-panel"
            initial={{ y: '0%' }}
            animate={{ y: isDone ? '-100%' : '0%' }}
            transition={{
              duration: 0.68,
              ease: [0.77, 0, 0.175, 1],
              delay: isDone ? colIndex * 0.045 : 0,
            }}
          />
        ))}
      </div>

      {/* ── Foreground Content Stage ── */}
      <motion.div
        className="awwwards-content-stage"
        animate={{
          opacity: isDone ? 0 : 1,
          scale: isDone ? 1.04 : 1,
          y: isDone ? -24 : 0,
        }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Architectural 4-Corner Crosshairs */}
        <span className="awwwards-crosshair crosshair--tl">+</span>
        <span className="awwwards-crosshair crosshair--tr">+</span>
        <span className="awwwards-crosshair crosshair--bl">+</span>
        <span className="awwwards-crosshair crosshair--br">+</span>

        {/* Ambient Focal Aurora Glow */}
        <div className="awwwards-aurora" />

        {/* Header HUD */}
        <header className="awwwards-header">
          <div className="awwwards-brand-lockup">
            <span className="awwwards-brand-beacon" />
            <span className="awwwards-brand-title">TERRAOPS</span>
            <span className="awwwards-brand-badge">DSS // v0.1</span>
          </div>
          <div className="awwwards-header-meta">
            <span>LOC // RFC EAST</span>
            <button
              type="button"
              className="awwwards-skip-btn"
              onClick={() => {
                setIsDone(true);
                setTimeout(onComplete, 250);
              }}
            >
              SKIP [ESC]
            </button>
          </div>
        </header>

        {/* Centerpiece Hero */}
        <main className="awwwards-center">
          {/* Rotating 3D Isometric Compute Cube */}
          <div className="awwwards-cube-wrap">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="awwwards-cube-svg"
            >
              {/* Top Face */}
              <polygon
                points="32,8 54,20 32,32 10,20"
                stroke={isLight ? 'rgba(0, 135, 81, 0.4)' : 'rgba(0, 212, 126, 0.4)'}
                strokeWidth="1.5"
                fill={isLight ? 'rgba(0, 135, 81, 0.05)' : 'rgba(0, 212, 126, 0.08)'}
              />
              {/* Left Face */}
              <polygon
                points="10,20 32,32 32,56 10,44"
                stroke={isLight ? 'rgba(0, 135, 81, 0.3)' : 'rgba(0, 212, 126, 0.3)'}
                strokeWidth="1.5"
                fill={isLight ? 'rgba(0, 135, 81, 0.03)' : 'rgba(0, 212, 126, 0.04)'}
              />
              {/* Right Face */}
              <polygon
                points="32,32 54,20 54,44 32,56"
                stroke={isLight ? 'rgba(0, 135, 81, 0.5)' : 'rgba(0, 212, 126, 0.5)'}
                strokeWidth="1.5"
                fill={isLight ? 'rgba(0, 135, 81, 0.08)' : 'rgba(0, 212, 126, 0.12)'}
              />
              {/* Animated Internal Laser Core */}
              <circle
                cx="32"
                cy="32"
                r={progress > 95 ? 6 : 4}
                fill={isLight ? '#008751' : '#00d47e'}
                className="awwwards-cube-pulse"
              />
              {/* Axis Rays */}
              <line x1="32" y1="32" x2="32" y2="8" stroke={isLight ? '#008751' : '#00d47e'} strokeWidth="1" strokeDasharray="2 2" />
              <line x1="32" y1="32" x2="10" y2="44" stroke={isLight ? '#008751' : '#00d47e'} strokeWidth="1" strokeDasharray="2 2" />
              <line x1="32" y1="32" x2="54" y2="44" stroke={isLight ? '#008751' : '#00d47e'} strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Huge Minimal Awwwards Counter */}
          <div className="awwwards-counter-box">
            <span className="awwwards-counter-num">
              {String(progress).padStart(3, '0')}
            </span>
            <span className="awwwards-counter-pct">%</span>
          </div>

          {/* Kinetic Frequency Spectrum / Equalizer */}
          <div className="awwwards-spectrum">
            {SPECTRUM_BARS.map((_, i) => {
              // Dynamic frequency wave calculation
              const barHeight = progress >= 100
                ? 2
                : Math.max(3, Math.round(Math.abs(Math.sin((progress * 0.12) + i * 0.65)) * 22));
              return (
                <div
                  key={i}
                  className="awwwards-spectrum-bar"
                  style={{
                    height: `${barHeight}px`,
                    opacity: progress >= 100 ? 0.4 : 0.85,
                  }}
                />
              );
            })}
          </div>

          {/* Single Monospace Kinetic Ticker */}
          <div className="awwwards-status-ticker">
            <span className="awwwards-status-prompt">&gt;</span>
            <span className="awwwards-status-text">{TELEMETRY_STAGES[stageIndex]}</span>
          </div>
        </main>

        {/* Footer Technical Metadata */}
        <footer className="awwwards-footer">
          <div className="awwwards-footer-col">
            <span className="k">STANDARD</span>
            <span className="v">GHG SCOPE 2 (LOCATION-BASED)</span>
          </div>
          <div className="awwwards-footer-col">
            <span className="k">FACTOR</span>
            <span className="v">0.312 kgCO₂e/kWh · EPA eGRID</span>
          </div>
          <div className="awwwards-footer-col">
            <span className="k">VALIDATION</span>
            <span className="v">94/94 ZERO-COST DETERMINISTIC TESTS</span>
          </div>
          <div className="awwwards-footer-col">
            <span className="k">MANDATE</span>
            <span className="v">UN SDG 13 CLIMATE ACTION</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
