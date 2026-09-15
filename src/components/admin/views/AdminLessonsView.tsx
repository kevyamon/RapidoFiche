import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, UploadCloud, CheckCircle, Archive, Search, Loader2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../ui/Toast';

export interface AdminLessonItem {
  id: string;
  title: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  levelId?: { code: string; label: string };
  subjectId?: { name: string };
  week?: number;
  createdAt: string;
}

export const AdminLessonsView: React.FC = () => {
  const { setActiveTab } = useAdminAuth();
  const [lessons, setLessons] = useState<AdminLessonItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const loadLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/lessons', {
        params: { search, limit: 50 },
      });
      if (res.data?.success) {
        setLessons(res.data.data);
      }
    } catch {
      error('Impossible de charger les fiches pédagogiques');
    } finally {
      setIsLoading(false);
    }
  }, [search, error]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const handlePublish = async (lessonId: string) => {
    try {
      await apiClient.post(`/admin/lessons/${lessonId}/publish`);
      success('Fiche publiée avec succès');
      await loadLessons();
    } catch {
      error('Échec de la publication');
    }
  };

  const handleArchive = async (lessonId: string) => {
    try {
      await apiClient.delete(`/admin/lessons/${lessonId}`);
      success('Fiche archivée avec succès');
      await loadLessons();
    } catch {
      error('Échec de l’archivage');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span>Gestion des Fiches Pédagogiques</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Contrôle qualité, validation et cycle de vie des fiches officielles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer les fiches..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Importer des Fiches</span>
          </button>
          <button
            type="button"
            onClick={loadLessons}
            aria-label="Actualiser"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tableau des Fiches */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Titre & Matière</th>
                <th className="p-4">Niveau</th>
                <th className="p-4">Semaine</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    <span>Chargement des fiches pédagogiques...</span>
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Aucune fiche pédagogique trouvée.
                  </td>
                </tr>
              ) : (
                lessons.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-white">{l.title}</p>
                      <p className="text-xs text-slate-400">{l.subjectId?.name || 'Général'}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        {l.levelId?.code || 'Tous'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {l.week ? `Semaine ${l.week}` : '—'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          l.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : l.status === 'DRAFT'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-300 border border-slate-600'
                        }`}
                      >
                        {l.status === 'PUBLISHED'
                          ? 'Publiée'
                          : l.status === 'DRAFT'
                          ? 'Brouillon'
                          : 'Archivée'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {l.status !== 'PUBLISHED' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(l.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Publier</span>
                        </button>
                      )}
                      {l.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() => handleArchive(l.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-medium transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archiver</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
