import React from 'react';
import { Search, Loader2, CheckCheck, UploadCloud, RefreshCw } from 'lucide-react';

interface AdminLessonFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  onStatusFilterChange: (status: 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => void;
  totalCount: number;
  draftCount: number;
  publishedCount: number;
  isPublishingAll: boolean;
  isLoading: boolean;
  onPublishAll: () => void;
  onImportClick: () => void;
  onRefresh: () => void;
}

export const AdminLessonFilters: React.FC<AdminLessonFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  draftCount,
  publishedCount,
  isPublishingAll,
  isLoading,
  onPublishAll,
  onImportClick,
  onRefresh,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Gestion des Fiches Pédagogiques</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Contrôle qualité, validation des brouillons et purge définitive
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtrer les fiches..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {draftCount > 0 && (
            <button
              type="button"
              disabled={isPublishingAll}
              onClick={onPublishAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all shrink-0 disabled:opacity-50"
              title="Publier tous les brouillons en 1 clic"
            >
              {isPublishingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
              <span>Tout publier ({draftCount})</span>
            </button>
          )}
          <button
            type="button"
            onClick={onImportClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Importer des Fiches</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Actualiser"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onStatusFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            statusFilter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          Toutes ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('DRAFT')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            statusFilter === 'DRAFT'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
          }`}
        >
          <span>Brouillons à valider</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-950/40 text-amber-200 font-bold">{draftCount}</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('PUBLISHED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            statusFilter === 'PUBLISHED'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'
          }`}
        >
          <span>Publiées</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950/40 text-emerald-200 font-bold">{publishedCount}</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('ARCHIVED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            statusFilter === 'ARCHIVED' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          Archivées
        </button>
      </div>
    </>
  );
};
