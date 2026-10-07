import React from 'react';
import { Calendar, CheckCircle2, X } from 'lucide-react';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';

export interface TermSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTerm: string;
  onSelectTerm: (term: string) => void;
}

const TERMS = [
  { value: '', label: 'Tous les trimestres', subtitle: 'Afficher l’ensemble de l’année scolaire' },
  { value: '1', label: 'Trimestre 1', subtitle: 'Semaines 1 à 12' },
  { value: '2', label: 'Trimestre 2', subtitle: 'Semaines 13 à 24' },
  { value: '3', label: 'Trimestre 3', subtitle: 'Semaines 25 à 36' },
];

export const TermSelectorModal: React.FC<TermSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTerm,
  onSelectTerm,
}) => {
  useModalBackHandler(isOpen, onClose, 'term-selector-modal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-background-card w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-modal border border-border-default z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-background-main/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary leading-tight">
                Choisir le trimestre
              </h3>
              <p className="text-xs text-text-muted">Filtrer les fiches par période scolaire</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-background-surface transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liste des options */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
          {TERMS.map((t) => {
            const isSelected = selectedTerm === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  onSelectTerm(t.value);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/80 ring-2 ring-primary-500/20 shadow-subtle'
                    : 'border-border-default hover:border-primary-300 bg-background-card hover:bg-background-surface'
                }`}
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-text-primary">
                    {t.label}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">{t.subtitle}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
