import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast('success', msg, title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast('danger', msg, title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast('warning', msg, title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast('info', msg, title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-elevated border transition-all duration-300 animate-in slide-in-from-top-2 ${
              t.type === 'success'
                ? 'bg-status-success-bg border-status-success-border text-status-success-text'
                : t.type === 'danger'
                ? 'bg-status-danger-bg border-status-danger-border text-status-danger-text'
                : t.type === 'warning'
                ? 'bg-status-warning-bg border-status-warning-border text-status-warning-text'
                : 'bg-status-info-bg border-status-info-border text-status-info-text'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-status-success-badge" />}
              {t.type === 'danger' && <AlertCircle className="w-5 h-5 text-status-danger-badge" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-status-warning-badge" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-status-info-badge" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              <div className="leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l’intérieur d’un ToastProvider');
  }
  return context;
};
