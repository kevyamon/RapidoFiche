import React, { useState, useEffect } from 'react';
import { GraduationCap, ChevronDown, CheckCircle2, School, X } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useModalBackHandler } from '../../hooks/useModalBackHandler';

export interface EducationLevelItem {
  id: string;
  _id?: string;
  code: string;
  label: string;
  order: number;
}

// Les 6 niveaux officiels du primaire (CP1 au CM2)
const DEFAULT_LEVELS: EducationLevelItem[] = [
  { id: 'CP1', code: 'CP1', label: 'Cours Préparatoire 1ère année', order: 1 },
  { id: 'CP2', code: 'CP2', label: 'Cours Préparatoire 2ème année', order: 2 },
  { id: 'CE1', code: 'CE1', label: 'Cours Élémentaire 1ère année', order: 3 },
  { id: 'CE2', code: 'CE2', label: 'Cours Élémentaire 2ème année', order: 4 },
  { id: 'CM1', code: 'CM1', label: 'Cours Moyen 1ère année', order: 5 },
  { id: 'CM2', code: 'CM2', label: 'Cours Moyen 2ème année', order: 6 },
];

export interface LevelSelectorProps {
  value: string;
  onChange: (levelId: string) => void;
  label?: string;
  required?: boolean;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  value,
  onChange,
  label = 'Classe / Niveau d’enseignement principal',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [levels, setLevels] = useState<EducationLevelItem[]>(DEFAULT_LEVELS);

  useModalBackHandler(isOpen, () => setIsOpen(false), 'level-selector-modal');

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await apiClient.get('/levels');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiLevels: EducationLevelItem[] = res.data.data.map((l: any) => ({
            id: l.id || l._id,
            code: l.code,
            label: l.label,
            order: l.order,
          }));
          setLevels(apiLevels);
        }
      } catch {
        // Conserver les 6 niveaux officiels par défaut
      }
    };
    fetchLevels();
  }, []);

  const selectedLevel = levels.find((l) => l.id === value || l.code === value);

  const handleSelect = (levelId: string) => {
    onChange(levelId);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-text-secondary">
          {label} {required && <span className="text-status-danger-badge">*</span>}
        </label>
      )}

      {/* Bouton Déclencheur Personnalisé */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all text-left shadow-subtle ${
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-background-card'
            : 'border-border-default hover:border-primary-300 bg-background-input'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <GraduationCap className="w-5 h-5 text-primary-600 shrink-0" />
          {selectedLevel ? (
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                {selectedLevel.code}
              </span>
              <span className="text-sm font-semibold text-text-primary truncate">
                {selectedLevel.label}
              </span>
            </div>
          ) : (
            <span className="text-sm text-text-disabled">
              Sélectionnez votre classe primaire (CP1 à CM2)...
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
      </button>

      {/* Modale Personnalisée des 6 Niveaux du Primaire */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-background-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-modal border border-border-default z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden">
            {/* En-tête */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-background-main/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary leading-tight">
                    Choisissez votre classe
                  </h3>
                  <p className="text-xs text-text-muted">
                    Enseignement Primaire officiel (du CP1 au CM2)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-background-surface transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps de Liste Déroulante avec Grille Élégante */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block px-1">
                Classes du Primaire (6 niveaux)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {levels.map((lvl) => {
                  const isSelected = selectedLevel?.code === lvl.code || value === lvl.id;
                  return (
                    <button
                      key={lvl.code}
                      type="button"
                      onClick={() => handleSelect(lvl.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/80 ring-2 ring-primary-500/20 shadow-subtle'
                          : 'border-border-default hover:border-primary-300 bg-background-card hover:bg-background-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-11 h-9 rounded-lg font-bold text-xs bg-primary-100 text-primary-800 border border-primary-200 flex items-center justify-center shrink-0">
                          {lvl.code}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-text-primary leading-tight">
                            {lvl.label}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">Programme Officiel</p>
                        </div>
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
        </div>
      )}
    </div>
  );
};
