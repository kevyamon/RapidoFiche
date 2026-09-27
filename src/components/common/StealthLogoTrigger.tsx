import React, { useState, useRef, useCallback } from 'react';

const REQUIRED_TAPS = 5;
const TAP_TIMEOUT_MS = 2000; // 2 secondes max entre les taps
const LONG_PRESS_MS = 3000; // 3 secondes d'appui continu
const TICK_INTERVAL_MS = 30;

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
  const tapCountRef = useRef(0);
  const tapResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPressingRef = useRef(false);

  const resetAll = useCallback(() => {
    if (longPressTimerRef.current) {
      clearInterval(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (tapResetTimerRef.current) {
      clearTimeout(tapResetTimerRef.current);
      tapResetTimerRef.current = null;
    }
    isPressingRef.current = false;
    tapCountRef.current = 0;
    setProgress(0);
  }, []);

  const triggerAdmin = useCallback(() => {
    resetAll();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch {
        // Ignorer si vibrations non supportées
      }
    }
    window.dispatchEvent(new CustomEvent('open-stealth-admin'));
  }, [resetAll]);

  const handleStart = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    // Bloquer le menu contextuel natif ou comportement par défaut de l'image
    if ('button' in e && e.button !== 0 && (e as React.MouseEvent).button !== 0) return;

    // 1. Détection des multi-taps rapides (5 taps consécutifs)
    tapCountRef.current += 1;
    if (tapResetTimerRef.current) {
      clearTimeout(tapResetTimerRef.current);
    }
    tapResetTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, TAP_TIMEOUT_MS);

    if (tapCountRef.current >= REQUIRED_TAPS) {
      triggerAdmin();
      return;
    }

    // 2. Détection de l'appui long furtif (3 secondes)
    isPressingRef.current = true;
    startTimeRef.current = Date.now();

    if (longPressTimerRef.current) {
      clearInterval(longPressTimerRef.current);
    }

    longPressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / LONG_PRESS_MS) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= LONG_PRESS_MS) {
        triggerAdmin();
      }
    }, TICK_INTERVAL_MS);
  };

  const handleEndOrCancel = () => {
    if (isPressingRef.current) {
      if (longPressTimerRef.current) {
        clearInterval(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      isPressingRef.current = false;
      setProgress(0);
    }
  };

  const preventContextMenu = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="RapidoFiche"
      onPointerDown={handleStart}
      onPointerUp={handleEndOrCancel}
      onPointerLeave={handleEndOrCancel}
      onPointerCancel={handleEndOrCancel}
      onTouchStart={handleStart}
      onTouchEnd={handleEndOrCancel}
      onTouchCancel={handleEndOrCancel}
      onContextMenu={preventContextMenu}
      onDragStart={preventContextMenu}
      className={`relative inline-block select-none cursor-pointer touch-manipulation no-touch-callout focus:outline-none ${className}`}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
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

      {/* Image du Logo avec neutralisation complète du téléchargement */}
      <img
        src="/logo.png"
        alt={alt}
        draggable={false}
        onContextMenu={preventContextMenu}
        onDragStart={preventContextMenu}
        className={`${imageClassName} pointer-events-none select-none ${
          progress > 0 ? 'scale-95 transition-transform' : ''
        }`}
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
