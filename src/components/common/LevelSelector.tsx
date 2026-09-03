import React, { useState, useEffect } from 'react';
import { GraduationCap, ChevronDown, CheckCircle2, School, X } from 'lucide-react';
import { apiClient } from '../../api/client';

export interface EducationLevelItem {
  id: string;
  _id?: string;
  code: string;
  label: string;
  order: number;
  cycle?: 'PRESCHOOL' | 'PRIMARY';
}

// Les 9 niveaux officiels du système éducatif ivoirien (CDC Section 11)
const DEFAULT_LEVELS: EducationLevelItem[] = [
  { id: 'PS', code: 'PS', label: 'Petite Section', order: 1, cycle: 'PRESCHOOL' },
  { id: 'MS', code: 'MS', label: 'Moyenne Section', order: 2, cycle: 'PRESCHOOL' },
  { id: 'GS', code: 'GS', label: 'Grande Section', order: 3, cycle: 'PRESCHOOL' },
  { id: 'CP1', code: 'CP1', label: 'Cours Préparatoire 1ère année', order: 4, cycle: 'PRIMARY' },
  { id: 'CP2', code: 'CP2', label: 'Cours Préparatoire 2ème année', order: 5, cycle: 'PRIMARY' },
  { id: 'CE1', code: 'CE1', label: 'Cours Élémentaire 1ère année', order: 6, cycle: 'PRIMARY' },
  { id: 'CE2', code: 'CE2', label: 'Cours Élémentaire 2ème année', order: 7, cycle: 'PRIMARY' },
  { id: 'CM1', code: 'CM1', label: 'Cours Moyen 1ère année', order: 8, cycle: 'PRIMARY' },
  { id: 'CM2', code: 'CM2', label: 'Cours Moyen 2ème année', order: 9, cycle: 'PRIMARY' },
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
            cycle: ['PS', 'MS', 'GS'].includes(l.code) ? 'PRESCHOOL' : 'PRIMARY',
          }));
          setLevels(apiLevels);
        }
      } catch {
        // Conserver les 9 niveaux officiels par défaut
      }
    };
    fetchLevels();
  }, []);

  const selectedLevel = levels.find((l) => l.id === value || l.code === value);

  const preschoolLevels = levels.filter(
    (l) => l.cycle === 'PRESCHOOL' || ['PS', 'MS', 'GS'].includes(l.code)
  );
  const primaryLevels = levels.filter(
    (l) => l.cycle === 'PRIMARY' || !['PS', 'MS', 'GS'].includes(l.code)
  );

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
              Sélectionnez votre niveau de classe...
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
      </button>

      {/* Modale / Liste Flottante des 9 Niveaux */}
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
                    Les 9 niveaux officiels du préscolaire et du primaire
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

            {/* Corps de Liste Déroulante avec Sections de Cycle */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
              {/* Section Préscolaire */}
              <div>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2 px-1">
                  Cycle Préscolaire (3 niveaux)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {preschoolLevels.map((lvl) => {
                    const isSelected = selectedLevel?.code === lvl.code || value === lvl.id;
                    return (
                      <button
                        key={lvl.code}
                        type="button"
                        onClick={() => handleSelect(lvl.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50/80 ring-2 ring-primary-500/20 shadow-subtle'
                            : 'border-border-default hover:border-primary-300 bg-background-card hover:bg-background-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white text-primary-800 border border-primary-200">
                            {lvl.code}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary-600 fill-primary-50" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-text-primary leading-snug">
                          {lvl.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Primaire */}
              <div>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2 px-1">
                  Cycle Primaire (6 niveaux)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {primaryLevels.map((lvl) => {
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
                          <span className="w-10 h-8 rounded-lg font-bold text-xs bg-primary-100 text-primary-800 border border-primary-200 flex items-center justify-center shrink-0">
                            {lvl.code}
                          </span>
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-text-primary">
                              {lvl.label}
                            </p>
                            <p className="text-[10px] text-text-muted">Enseignement Primaire</p>
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
        </div>
      )}
    </div>
  );
};
