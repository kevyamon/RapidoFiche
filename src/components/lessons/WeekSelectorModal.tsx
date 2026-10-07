import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, X } from 'lucide-react';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';

export interface WeekSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeek: string;
  onSelectWeek: (week: string) => void;
}

export const WeekSelectorModal: React.FC<WeekSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedWeek,
  onSelectWeek,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'T1' | 'T2' | 'T3'>('ALL');
  useModalBackHandler(isOpen, onClose, 'week-selector-modal');

  if (!isOpen) return null;

  const getWeeksForTab = () => {
    switch (activeTab) {
      case 'T1':
        return Array.from({ length: 12 }, (_, i) => i + 1);
      case 'T2':
        return Array.from({ length: 12 }, (_, i) => i + 13);
      case 'T3':
        return Array.from({ length: 12 }, (_, i) => i + 25);
      case 'ALL':
      default:
        return Array.from({ length: 36 }, (_, i) => i + 1);
    }
  };

  const weeks = getWeeksForTab();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-background-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-modal border border-border-default z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-background-main/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary leading-tight">
                Choisir la semaine
              </h3>
              <p className="text-xs text-text-muted">36 semaines du programme officiel</p>
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

        {/* Onglets de filtrage rapide par Trimestre */}
        <div className="px-4 sm:px-5 pt-3 border-b border-border-subtle flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: 'Toutes (1-36)' },
            { id: 'T1', label: 'Trimestre 1 (1-12)' },
            { id: 'T2', label: 'Trimestre 2 (13-24)' },
            { id: 'T3', label: 'Trimestre 3 (25-36)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-text-inverse shadow-subtle'
                  : 'text-text-secondary hover:bg-background-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Corps de Liste Déroulante avec Grille Élégante */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {/* Bouton "Toutes les semaines" */}
          <button
            type="button"
            onClick={() => {
              onSelectWeek('');
              onClose();
            }}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
              !selectedWeek
                ? 'border-primary-600 bg-primary-50/80 ring-2 ring-primary-500/20 shadow-subtle'
                : 'border-border-default hover:border-primary-300 bg-background-card hover:bg-background-surface'
            }`}
          >
            <span className="text-xs sm:text-sm font-semibold text-text-primary">
              Toutes les semaines (Aucun filtre)
            </span>
            {!selectedWeek && (
              <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 ml-2" />
            )}
          </button>

          {/* Grille des Semaines */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {weeks.map((w) => {
              const strVal = w.toString();
              const isSelected = selectedWeek === strVal;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    onSelectWeek(strVal);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'border-primary-600 bg-primary-600 text-white font-bold shadow-subtle'
                      : 'border-border-default hover:border-primary-300 bg-background-card hover:bg-background-surface text-text-primary'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold">Semaine {w}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-primary-100' : 'text-text-muted'}`}>
                    {w <= 12 ? 'Trimestre 1' : w <= 24 ? 'Trimestre 2' : 'Trimestre 3'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
