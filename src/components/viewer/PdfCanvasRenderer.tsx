import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

interface PdfCanvasRendererProps {
  pdfBlobUrl: string;
  zoom: number;
  rotation: number;
  watermarkText?: string;
  onLoaded?: (totalPages: number) => void;
  onError?: (errorMessage: string) => void;
}

const PDFJS_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfjsLoadingPromise: Promise<any> | null = null;

const ensurePdfJsLoaded = (): Promise<any> => {
  if (window.pdfjsLib) {
    return Promise.resolve(window.pdfjsLib);
  }

  if (pdfjsLoadingPromise) {
    return pdfjsLoadingPromise;
  }

  pdfjsLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PDFJS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.pdfjsLib));
      existing.addEventListener('error', () => reject(new Error('Échec du chargement du moteur PDF')));
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('Moteur PDF indisponible après chargement'));
      }
    };
    script.onerror = () => reject(new Error('Impossible de contacter le moteur PDF'));
    document.head.appendChild(script);
  });

  return pdfjsLoadingPromise;
};

export const PdfCanvasRenderer: React.FC<PdfCanvasRendererProps> = ({
  pdfBlobUrl,
  zoom,
  rotation,
  watermarkText = 'RapidoFiche — Licence Enseignant Protégée',
  onLoaded,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  const renderPages = useCallback(async (pdfDoc: any) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    const numPages = pdfDoc.numPages;
    if (onLoaded) onLoaded(numPages);

    const containerWidth = Math.max(container.clientWidth - 24, 280);
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1, rotation });
      
      // Adaptation automatique à la largeur mobile avec zoom
      const baseScale = containerWidth / unscaledViewport.width;
      const finalScale = baseScale * (zoom / 100);
      const viewport = page.getViewport({ scale: finalScale, rotation });

      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'relative my-3 shadow-lg rounded-xl overflow-hidden bg-white mx-auto border border-slate-200 select-none';
      pageWrapper.style.width = `${viewport.width}px`;
      pageWrapper.style.maxWidth = '100%';

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.style.display = 'block';

      const canvasContext = canvas.getContext('2d');
      if (canvasContext) {
        canvasContext.scale(dpr, dpr);
        await page.render({ canvasContext, viewport }).promise;
      }

      pageWrapper.appendChild(canvas);

      // Filigrane dynamique injecté sur chaque page
      const watermark = document.createElement('div');
      watermark.className = 'absolute inset-0 pointer-events-none flex flex-col justify-around items-center opacity-[0.07] overflow-hidden select-none z-10';
      watermark.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 3; i++) {
        const line = document.createElement('div');
        line.className = 'text-xs sm:text-base font-black text-slate-900 -rotate-45 tracking-widest uppercase text-center px-4 whitespace-nowrap';
        line.innerText = watermarkText;
        watermark.appendChild(line);
      }
      pageWrapper.appendChild(watermark);

      container.appendChild(pageWrapper);
    }
  }, [zoom, rotation, watermarkText, onLoaded]);

  useEffect(() => {
    let isCancelled = false;

    const loadAndDisplayPdf = async () => {
      try {
        setIsRendering(true);
        setRenderError(null);

        const pdfjs = await ensurePdfJsLoaded();
        const response = await fetch(pdfBlobUrl);
        const arrayBuffer = await response.arrayBuffer();

        if (isCancelled) return;

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        if (!isCancelled) {
          await renderPages(pdfDoc);
        }
      } catch (err: any) {
        if (!isCancelled) {
          const msg = err?.message || 'Impossible d’afficher le document PDF';
          setRenderError(msg);
          if (onError) onError(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    if (pdfBlobUrl) {
      loadAndDisplayPdf();
    }

    return () => {
      isCancelled = true;
    };
  }, [pdfBlobUrl, renderPages, onError]);

  return (
    <div className="w-full flex flex-col items-center justify-start min-h-[300px] relative py-2">
      {isRendering && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-100/90 backdrop-blur-xs text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs sm:text-sm font-semibold">Affichage haute définition de la fiche...</p>
        </div>
      )}

      {renderError && (
        <div className="flex flex-col items-center gap-2 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 max-w-sm text-center my-6">
          <AlertCircle className="w-7 h-7 text-red-600" />
          <p className="text-xs sm:text-sm font-bold">Erreur d'affichage du document</p>
          <p className="text-[11px] text-red-600">{renderError}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full flex flex-col items-center transition-all duration-150"
      />
    </div>
  );
};
