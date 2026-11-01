import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, UploadCloud, CheckCheck, Search, Loader2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useSocketEvent } from '../../../context/SocketContext';
import { useToast } from '../../ui/Toast';
import { EditLessonModal } from '../EditLessonModal';
import { AdminLessonRow } from './AdminLessonRow';

export interface AdminLessonItem {
  id: string;
  _id?: string;
  title: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  levelId?: { _id?: string; id?: string; code: string; label: string };
  subjectId?: { _id?: string; id?: string; name: string };
  week?: number;
  createdAt: string;
}

export const AdminLessonsView: React.FC = () => {
  const { setActiveTab } = useAdminAuth();
  const [lessons, setLessons] = useState<AdminLessonItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');
  const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<AdminLessonItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ id: string; type: 'publish' | 'archive' } | null>(null);
  const { success, error } = useToast();

  const loadLessons = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await apiClient.get('/lessons', { params: { search, limit: 100 } });
      if (res.data?.success) {
        const rawList = Array.isArray(res.data.data) ? res.data.data : [];
        setLessons(rawList.map((l: any) => ({ ...l, id: l.id || l._id })));
      }
    } catch {
      error('Impossible de charger les fiches pédagogiques');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [search, error]);

  useEffect(() => { loadLessons(); }, [loadLessons]);
  useSocketEvent('LESSONS_CHANGED', () => loadLessons(true));
  useSocketEvent('ADMIN_BATCH_UPDATED', () => loadLessons(true));

  const handlePublish = async (lesson: AdminLessonItem) => {
    const lessonId = lesson.id || lesson._id;
    if (!lessonId) return;
    try {
      setActionLoading({ id: lessonId, type: 'publish' });
      await apiClient.post(`/admin/lessons/${lessonId}/publish`);
      success('Fiche validée et publiée avec succès !');
      setLessons((prev) => prev.map((l) => (l.id === lessonId || l._id === lessonId ? { ...l, status: 'PUBLISHED' } : l)));
      await loadLessons(true);
    } catch {
      error('Échec de la publication');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishAll = async () => {
    try {
      setIsPublishingAll(true);
      const res = await apiClient.post('/admin/lessons/publish-all');
      const count = res.data?.data?.publishedCount ?? 0;
      success(`${count} brouillon(s) publié(s) avec succès !`);
      await loadLessons(true);
    } catch {
      error('Échec de la publication groupée');
    } finally {
      setIsPublishingAll(false);
    }
  };

  const handleArchive = async (lesson: AdminLessonItem) => {
    const lessonId = lesson.id || lesson._id;
    if (!lessonId) return;
    try {
      setActionLoading({ id: lessonId, type: 'archive' });
      await apiClient.delete(`/admin/lessons/${lessonId}`);
      success('Fiche archivée avec succès');
      setLessons((prev) => prev.map((l) => (l.id === lessonId || l._id === lessonId ? { ...l, status: 'ARCHIVED' } : l)));
      await loadLessons(true);
    } catch {
      error('Échec de l’archivage');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLessons = lessons.filter((l) => statusFilter === 'ALL' || l.status === statusFilter);
  const draftCount = lessons.filter((l) => l.status === 'DRAFT').length;
  const publishedCount = lessons.filter((l) => l.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span>Gestion des Fiches Pédagogiques</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Contrôle qualité, validation des brouillons et publication officielle
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
          {draftCount > 0 && (
            <button
              type="button"
              disabled={isPublishingAll}
              onClick={handlePublishAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all shrink-0 disabled:opacity-50"
              title="Publier tous les brouillons en 1 clic"
            >
              {isPublishingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
              <span>Tout publier ({draftCount})</span>
            </button>
          )}
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
            onClick={() => loadLessons(false)}
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
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            statusFilter === 'ALL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800/60'
          }`}
        >
          Toutes ({lessons.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('DRAFT')}
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
          onClick={() => setStatusFilter('PUBLISHED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            statusFilter === 'PUBLISHED'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'
          }`}
        >
          <span>Publiées</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950/40 text-emerald-200 font-bold">{publishedCount}</span>
        </button>
      </div>

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
              ) : filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    {statusFilter === 'DRAFT'
                      ? 'Aucun brouillon en attente de validation.'
                      : statusFilter === 'PUBLISHED'
                      ? 'Aucune fiche publiée pour le moment.'
                      : 'Aucune fiche pédagogique trouvée.'}
                  </td>
                </tr>
              ) : (
                filteredLessons.map((l) => (
                  <AdminLessonRow
                    key={l.id || l._id || l.title}
                    lesson={l}
                    actionLoading={actionLoading}
                    onEdit={(item) => { setSelectedLessonForEdit(item); setIsEditModalOpen(true); }}
                    onPublish={handlePublish}
                    onArchive={handleArchive}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditLessonModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLessonForEdit(null);
        }}
        lesson={selectedLessonForEdit}
        onSuccess={() => loadLessons(true)}
      />
    </div>
  );
};
