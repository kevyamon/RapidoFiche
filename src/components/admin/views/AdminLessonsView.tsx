import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { AdminService } from '../../../services/admin.service';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useSocketEvent } from '../../../context/SocketContext';
import { useToast } from '../../ui/Toast';
import { EditLessonModal } from '../EditLessonModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { AdminLessonRow } from './AdminLessonRow';
import { AdminLessonFilters } from './AdminLessonFilters';

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
  const [actionLoading, setActionLoading] = useState<{ id: string; type: 'publish' | 'archive' | 'delete' } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<AdminLessonItem | null>(null);
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);
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
      await AdminService.archiveLesson(lessonId);
      success('Fiche archivée avec succès');
      setLessons((prev) => prev.map((l) => (l.id === lessonId || l._id === lessonId ? { ...l, status: 'ARCHIVED' } : l)));
      await loadLessons(true);
    } catch {
      error('Échec de l’archivage');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    const lessonId = lessonToDelete?.id || lessonToDelete?._id;
    if (!lessonId) return;
    try {
      setIsDeletingPermanently(true);
      await AdminService.deleteLessonPermanently(lessonId);
      success('Fiche supprimée définitivement avec succès');
      setLessons((prev) => prev.filter((l) => (l.id || l._id) !== lessonId));
      setLessonToDelete(null);
      await loadLessons(true);
    } catch {
      error('Échec de la suppression définitive');
    } finally {
      setIsDeletingPermanently(false);
    }
  };

  const filteredLessons = lessons.filter((l) => statusFilter === 'ALL' || l.status === statusFilter);
  const draftCount = lessons.filter((l) => l.status === 'DRAFT').length;
  const publishedCount = lessons.filter((l) => l.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <AdminLessonFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={lessons.length}
        draftCount={draftCount}
        publishedCount={publishedCount}
        isPublishingAll={isPublishingAll}
        isLoading={isLoading}
        onPublishAll={handlePublishAll}
        onImportClick={() => setActiveTab('import')}
        onRefresh={() => loadLessons(false)}
      />

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
                    onDelete={(item) => setLessonToDelete(item)}
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

      <ConfirmDeleteModal
        isOpen={Boolean(lessonToDelete)}
        title="Supprimer définitivement la fiche"
        itemTitle={lessonToDelete?.title}
        message="Cette action est irréversible. Le document PDF ainsi que l'ensemble des données associées seront définitivement purgés de la base de données et du serveur."
        isDeleting={isDeletingPermanently}
        onConfirm={handleConfirmDelete}
        onClose={() => !isDeletingPermanently && setLessonToDelete(null)}
      />
    </div>
  );
};
