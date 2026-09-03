import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Arrière-plan flouté */}
      <div
        className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Conteneur Modale */}
      <div
        className={`relative bg-background-card w-full ${maxWidthClass} rounded-t-2xl sm:rounded-xl shadow-modal border border-border-default z-10 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* En-tête */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-border-default bg-background-main/50">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-text-primary leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-text-secondary mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-background-surface transition-colors ml-4"
              aria-label="Fermer la boîte de dialogue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Corps */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
