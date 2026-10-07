import React, { useState } from 'react';
import { Search, RotateCcw, Calendar, CalendarDays, ChevronDown } from 'lucide-react';
import { TermSelectorModal } from './TermSelectorModal';
import { WeekSelectorModal } from './WeekSelectorModal';

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
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);

  const hasActiveFilters =
    Boolean(values.search || values.subjectId || values.week || values.term);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, search: e.target.value });
  };

  const handleSubjectSelect = (subId: string) => {
    onChange({ ...values, subjectId: values.subjectId === subId ? '' : subId });
  };

  const termLabel = values.term ? `Trimestre ${values.term}` : 'Tous trimestres';
  const weekLabel = values.week ? `Semaine ${values.week}` : 'Toutes semaines';

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

        {/* Ligne des Sélecteurs Personnalisés */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bouton Déclencheur Trimestre */}
          <button
            type="button"
            onClick={() => setIsTermModalOpen(true)}
            className={`flex-1 sm:flex-initial sm:w-40 px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-1.5 text-xs sm:text-sm shadow-subtle ${
              values.term
                ? 'bg-primary-50 text-primary-800 border-primary-300 font-semibold'
                : 'bg-background-card text-text-secondary border-border-default hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span className="truncate">{termLabel}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
          </button>

          {/* Bouton Déclencheur Semaine */}
          <button
            type="button"
            onClick={() => setIsWeekModalOpen(true)}
            className={`flex-1 sm:flex-initial sm:w-40 px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-1.5 text-xs sm:text-sm shadow-subtle ${
              values.week
                ? 'bg-primary-50 text-primary-800 border-primary-300 font-semibold'
                : 'bg-background-card text-text-secondary border-border-default hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <CalendarDays className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span className="truncate">{weekLabel}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
          </button>

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

      {/* 2. Pilules de Sélection des Matières */}
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

      {/* Modales Personnalisées avec Gestion du Bouton Retour Mobile */}
      <TermSelectorModal
        isOpen={isTermModalOpen}
        onClose={() => setIsTermModalOpen(false)}
        selectedTerm={values.term}
        onSelectTerm={(newTerm) => onChange({ ...values, term: newTerm })}
      />

      <WeekSelectorModal
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        selectedWeek={values.week}
        onSelectWeek={(newWeek) => onChange({ ...values, week: newWeek })}
      />
    </div>
  );
};
