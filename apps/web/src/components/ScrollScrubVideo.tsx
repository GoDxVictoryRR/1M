/**
 * ScrollScrubVideo.tsx
 * Pins a video element in the viewport and drives its currentTime
 * by scroll position — Apple-style product scrub effect.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { useScroll, useMotionValueEvent, MotionValue } from 'framer-motion';

interface ScrollScrubVideoProps {
  src: string;
  poster?: string;
  scrollHeight?: string;
  src2?: string;
  children?: (progress: MotionValue<number>) => React.ReactNode;
  className?: string;
}

export const ScrollScrubVideo: React.FC<ScrollScrubVideoProps> = ({
  src,
  poster,
  scrollHeight = '500vh',
  src2,
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const scrubVideo = useCallback((progress: number) => {
    const v1 = videoRef1.current;
    const v2 = videoRef2.current;
    if (!v1 || !isFinite(v1.duration) || v1.duration === 0) return;

    if (src2 && v2 && isFinite(v2.duration) && v2.duration > 0) {
      if (progress <= 0.5) {
        const p = progress / 0.5;
        v1.currentTime = p * v1.duration;
        v1.style.opacity = '1';
        v2.style.opacity = '0';
      } else {
        const p = (progress - 0.5) / 0.5;
        v2.currentTime = p * v2.duration;
        v1.style.opacity = '0';
        v2.style.opacity = '1';
      }
    } else {
      v1.currentTime = progress * v1.duration;
    }
  }, [src2]);

  useMotionValueEvent(scrollYProgress, 'change', scrubVideo);

  useEffect(() => {
    const setupVideo = (el: HTMLVideoElement | null) => {
      if (!el) return;
      el.pause();
      el.preload = 'auto';
      el.currentTime = 0;
    };
    setupVideo(videoRef1.current);
    setupVideo(videoRef2.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scroll-scrub-container ${className}`}
      style={{ height: scrollHeight, position: 'relative' }}
    >
      <div className="scroll-scrub-sticky">
        <video
          ref={videoRef1}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          className="scroll-scrub-video"
          style={{ opacity: 1, transition: 'opacity 0.4s ease' }}
          onPlay={(e) => { e.currentTarget.pause(); }}
        />
        {src2 && (
          <video
            ref={videoRef2}
            src={src2}
            muted
            playsInline
            preload="auto"
            className="scroll-scrub-video"
            style={{ opacity: 0, transition: 'opacity 0.4s ease', position: 'absolute', inset: 0 }}
            onPlay={(e) => { e.currentTarget.pause(); }}
          />
        )}
        <div className="scroll-scrub-overlay" />
        {children && (
          <div className="scroll-scrub-content">
            {children(scrollYProgress)}
          </div>
        )}
      </div>
    </div>
  );
};
