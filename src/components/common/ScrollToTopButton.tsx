import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

const LONG_PRESS_DURATION = 10000; // 10 secondes exactes
const TICK_INTERVAL = 50; // Mise à jour fluide toutes les 50ms

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPressingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clearTimer = useCallback(() => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    isPressingRef.current = false;
    setProgress(0);
  }, []);

  const triggerStealthAdmin = useCallback(() => {
    clearTimer();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
    window.dispatchEvent(new CustomEvent('open-stealth-admin'));
  }, [clearTimer]);

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Si c'est un clic droit, on ignore
    if ('button' in e && e.button !== 0) return;

    isPressingRef.current = true;
    startTimeRef.current = Date.now();

    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= LONG_PRESS_DURATION) {
        triggerStealthAdmin();
      }
    }, TICK_INTERVAL);
  };

  const handlePressEnd = () => {
    const elapsed = Date.now() - startTimeRef.current;
    if (isPressingRef.current && elapsed < 400) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    clearTimer();
  };

  if (!isVisible && progress === 0) return null;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      <button
        type="button"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        aria-label="Remonter en haut de page"
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        {/* Anneau de progression SVG furtif */}
        {progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="transparent"
              stroke="#0C83EB"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        )}
        <ArrowUp className="w-5 h-5 transition-transform" />
      </button>
    </div>
  );
};
