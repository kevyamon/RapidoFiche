import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export interface SubjectItem {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
}

export interface LessonFilterValues {
  search: string;
  subjectId: string;
  week: string;
  term: string;
}

export interface LessonFilterProps {
  subjects: SubjectItem[];
  values: LessonFilterValues;
  onChange: (newValues: LessonFilterValues) => void;
  onReset: () => void;
}

export const LessonFilter: React.FC<LessonFilterProps> = ({
  subjects,
  values,
  onChange,
  onReset,
}) => {
  const hasActiveFilters =
    values.search || values.subjectId || values.week || values.term;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, search: e.target.value });
  };

  const handleSubjectSelect = (subId: string) => {
    onChange({ ...values, subjectId: values.subjectId === subId ? '' : subId });
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...values, week: e.target.value });
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...values, term: e.target.value });
  };

  return (
    <div className="space-y-3 mb-6 w-full max-w-full overflow-hidden">
      {/* 1. Zone de Recherche et Filtres Responsives */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Barre de Recherche Pleine Largeur sur Mobile, Flexible sur PC */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={values.search}
            onChange={handleSearchChange}
            placeholder="Rechercher par titre, leçon ou mot-clé..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default bg-background-card text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-subtle"
          />
        </div>

        {/* Ligne des Sélecteurs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sélecteur Trimestre */}
          <select
            value={values.term}
            onChange={handleTermChange}
            className="flex-1 sm:flex-initial sm:w-36 px-3 py-2.5 rounded-xl border border-border-default bg-background-card text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-subtle cursor-pointer"
          >
            <option value="">Tous trimestres</option>
            <option value="1">Trimestre 1</option>
            <option value="2">Trimestre 2</option>
            <option value="3">Trimestre 3</option>
          </select>

          {/* Sélecteur Semaine */}
          <select
            value={values.week}
            onChange={handleWeekChange}
            className="flex-1 sm:flex-initial sm:w-36 px-3 py-2.5 rounded-xl border border-border-default bg-background-card text-xs sm:text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-subtle cursor-pointer"
          >
            <option value="">Toutes semaines</option>
            {Array.from({ length: 36 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w.toString()}>
                Semaine {w}
              </option>
            ))}
          </select>

          {/* Bouton de Réinitialisation */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="p-2.5 rounded-xl text-text-muted hover:text-status-danger-text hover:bg-status-danger-bg border border-border-default transition-colors shrink-0"
              title="Réinitialiser les filtres"
              aria-label="Réinitialiser les filtres"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Pilules de Sélection des Matières (Défilement Horizontal Propre et Isolé) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none touch-pan-x">
        <button
          onClick={() => handleSubjectSelect('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all select-none shrink-0 ${
            !values.subjectId
              ? 'bg-primary-600 text-text-inverse shadow-subtle'
              : 'bg-background-card text-text-secondary hover:bg-background-surface border border-border-default'
          }`}
        >
          Toutes les matières
        </button>

        {subjects.map((sub) => {
          const subId = sub.id || sub._id || '';
          const isSelected = values.subjectId === subId;
          return (
            <button
              key={subId}
              onClick={() => handleSubjectSelect(subId)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all select-none shrink-0 ${
                isSelected
                  ? 'bg-primary-600 text-text-inverse shadow-subtle'
                  : 'bg-background-card text-text-secondary hover:bg-background-surface border border-border-default'
              }`}
            >
              {sub.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
