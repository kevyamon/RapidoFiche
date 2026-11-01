import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { PdfCanvasRenderer } from './PdfCanvasRenderer';

export interface PdfViewerProps {
  pdfBlobUrl: string | null;
  title: string;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string | null;
  watermarkText?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfBlobUrl,
  title,
  onBack,
  isLoading = false,
  error = null,
  watermarkText = 'RapidoFiche — Licence Enseignant — Reproduction Interdite',
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [renderError, setRenderError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gestion du plein écran natif
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Blocage global des raccourcis d'impression et de capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (
        (isCmdOrCtrl && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className="flex flex-col h-[calc(100vh-8rem)] sm:h-[84vh] bg-slate-900/50 rounded-2xl border border-border-default shadow-card overflow-hidden select-none"
    >
      {/* Barre d'Outils Supérieure */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-background-card border-b border-border-default shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 truncate">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1.5 h-auto text-text-secondary hover:text-text-primary"
              aria-label="Retour à la liste"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-sm sm:text-base font-semibold text-text-primary truncate max-w-[160px] sm:max-w-md">
            {title}
          </h2>
          {totalPages > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 border border-primary-200">
              <Layers className="w-3 h-3" />
              <span>{totalPages} page{totalPages > 1 ? 's' : ''}</span>
            </span>
          )}
        </div>

        {/* Contrôles de Visionnage */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 60 || !pdfBlobUrl}
            className="p-1.5 sm:p-2 rounded-lg text-text-secondary hover:bg-background-surface disabled:opacity-40 transition-colors"
            title="Zoom Arrière"
            aria-label="Zoom Arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-text-muted px-1.5 hidden sm:inline-block min-w-[3rem] text-center">
            {zoom}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200 || !pdfBlobUrl}
            className="p-1.5 sm:p-2 rounded-lg text-text-secondary hover:bg-background-surface disabled:opacity-40 transition-colors"
            title="Zoom Avant"
            aria-label="Zoom Avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleRotate}
            disabled={!pdfBlobUrl}
            className="p-1.5 sm:p-2 rounded-lg text-text-secondary hover:bg-background-surface disabled:opacity-40 transition-colors"
            title="Pivoter à 90°"
            aria-label="Pivoter"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg text-text-secondary hover:bg-background-surface transition-colors ml-1"
            title={isFullscreen ? 'Quitter le plein écran' : 'Mode Plein Écran'}
            aria-label="Plein Écran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Zone d'Affichage du Document */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-100/90 backdrop-blur-xs text-text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-xs sm:text-sm font-medium">Chargement du document pédagogique...</p>
          </div>
        )}

        {(error || renderError) && (
          <div className="flex flex-col items-center gap-3 text-status-danger-text p-6 bg-status-danger-bg rounded-xl border border-status-danger-border max-w-sm text-center mx-auto my-8">
            <AlertCircle className="w-8 h-8 text-status-danger-badge" />
            <p className="text-sm font-semibold">{error || renderError}</p>
          </div>
        )}

        {!error && pdfBlobUrl && (
          <div className="w-full">
            {/* Style pour interdire strictement l'impression */}
            <style>
              {`@media print { body, html, #root { display: none !important; visibility: hidden !important; } }`}
            </style>

            <PdfCanvasRenderer
              pdfBlobUrl={pdfBlobUrl}
              zoom={zoom}
              rotation={rotation}
              watermarkText={watermarkText}
              onLoaded={(count) => setTotalPages(count)}
              onError={(msg) => setRenderError(msg)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

