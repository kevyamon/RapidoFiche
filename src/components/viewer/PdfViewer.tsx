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
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface PdfViewerProps {
  pdfBlobUrl: string | null;
  title: string;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfBlobUrl,
  title,
  onBack,
  isLoading = false,
  error = null,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
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

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Protection contre l'impression et le clic droit
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className="flex flex-col h-[calc(100vh-8rem)] sm:h-[82vh] bg-background-surface rounded-2xl border border-border-default shadow-card overflow-hidden select-none"
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
          <h2 className="text-sm sm:text-base font-semibold text-text-primary truncate max-w-[200px] sm:max-w-md">
            {title}
          </h2>
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
      <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-2 sm:p-4 relative">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 text-text-muted py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-xs sm:text-sm font-medium">Chargement sécurisé de la fiche...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 text-status-danger-text p-6 bg-status-danger-bg rounded-xl border border-status-danger-border max-w-sm text-center">
            <AlertCircle className="w-8 h-8 text-status-danger-badge" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {!isLoading && !error && pdfBlobUrl && (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <iframe
              src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              title={title}
              className="w-full h-full rounded-lg bg-white shadow-card border border-border-default"
            />
          </div>
        )}
      </div>
    </div>
  );
};
