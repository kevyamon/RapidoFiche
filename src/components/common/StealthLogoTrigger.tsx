import React, { useState, useRef, useCallback } from 'react';

const REQUIRED_CLICKS = 3;
const CLICK_TIMEOUT_MS = 1500; // Délai max pour effectuer les 3 clics
const LONG_PRESS_MS = 10000; // 10 secondes d'appui continu
const TICK_INTERVAL_MS = 50;

interface StealthLogoTriggerProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
}

export const StealthLogoTrigger: React.FC<StealthLogoTriggerProps> = ({
  className = 'w-14 h-14 mx-auto mb-3',
  imageClassName = 'w-full h-full rounded-2xl object-cover shadow-card',
  alt = 'Logo RapidoFiche',
}) => {
  const [progress, setProgress] = useState(0);
  const clickCountRef = useRef(0);
  const clickResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPressingRef = useRef(false);

  const resetAll = useCallback(() => {
    if (longPressTimerRef.current) {
      clearInterval(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (clickResetTimerRef.current) {
      clearTimeout(clickResetTimerRef.current);
      clickResetTimerRef.current = null;
    }
    isPressingRef.current = false;
    clickCountRef.current = 0;
    setProgress(0);
  }, []);

  const triggerAdmin = useCallback(() => {
    resetAll();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    window.dispatchEvent(new CustomEvent('open-stealth-admin'));
  }, [resetAll]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Incrémentation du compteur de clics
    clickCountRef.current += 1;

    // Réinitialisation du délai d'expiration des clics
    if (clickResetTimerRef.current) {
      clearTimeout(clickResetTimerRef.current);
    }
    clickResetTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, CLICK_TIMEOUT_MS);

    // Si on a atteint la combinaison (au moins 3 clics préalables) et qu'on maintient appuyé
    if (clickCountRef.current >= REQUIRED_CLICKS) {
      isPressingRef.current = true;
      startTimeRef.current = Date.now();

      longPressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentProgress = Math.min((elapsed / LONG_PRESS_MS) * 100, 100);
        setProgress(currentProgress);

        if (elapsed >= LONG_PRESS_MS) {
          triggerAdmin();
        }
      }, TICK_INTERVAL_MS);
    }
  };

  const handlePointerUpOrCancel = () => {
    if (isPressingRef.current) {
      if (longPressTimerRef.current) {
        clearInterval(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      isPressingRef.current = false;
      setProgress(0);
      clickCountRef.current = 0;
    }
  };

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrCancel}
      onPointerLeave={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      className={`relative inline-block select-none cursor-pointer ${className}`}
      title=""
      style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
    >
      {/* Anneau Circulaire de Progression Furtive */}
      {progress > 0 && (
        <svg
          className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] -rotate-90 pointer-events-none z-10"
          viewBox="0 0 60 60"
        >
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="transparent"
            stroke="#0C83EB"
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Image du Logo */}
      <img
        src="/logo.png"
        alt={alt}
        draggable={false}
        className={`${imageClassName} ${progress > 0 ? 'scale-95 transition-transform' : ''}`}
      />
    </div>
  );
};
