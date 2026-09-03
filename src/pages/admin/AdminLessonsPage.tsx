import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, UploadCloud, CheckCircle, Archive, Search } from 'lucide-react';
import { apiClient } from '../../api/client';
import { AdminService } from '../../services/admin.service';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export interface AdminLessonItem {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  levelId?: { code: string; label: string };
  subjectId?: { name: string };
  week?: number;
  createdAt: string;
}

export const AdminLessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<AdminLessonItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const loadLessons = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/lessons', {
        params: { search, limit: 30 },
      });
      if (res.data?.success) {
        setLessons(res.data.data);
      }
    } catch {
      error('Impossible de charger les fiches');
    } finally {
      setIsLoading(false);
    }
  }, [search, error]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const handlePublish = async (lessonId: string) => {
    try {
      await AdminService.publishLesson(lessonId);
      success('Fiche publiée avec succès');
      await loadLessons();
    } catch {
      error('Échec de la publication');
    }
  };

  const handleArchive = async (lessonId: string) => {
    try {
      await AdminService.archiveLesson(lessonId);
      success('Fiche archivée avec succès');
      await loadLessons();
    } catch {
      error('Échec de l’archivage');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <span>Gestion des Fiches Pédagogiques</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Validation, publication et cycle de vie des fiches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-card text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Link to="/admin/import">
            <Button variant="primary" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
              Importer
            </Button>
          </Link>
        </div>
      </div>

      {/* Tableau des Fiches */}
      <div className="bg-background-card rounded-2xl border border-border-default shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-background-surface border-b border-border-default text-text-muted text-xs font-semibold">
              <tr>
                <th className="p-4">Titre & Matière</th>
                <th className="p-4">Niveau</th>
                <th className="p-4">Semaine</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    Chargement des fiches...
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    Aucune fiche pédagogique trouvée.
                  </td>
                </tr>
              ) : (
                lessons.map((l) => (
                  <tr key={l.id} className="hover:bg-background-surface/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-text-primary">{l.title}</p>
                      <p className="text-xs text-text-muted">{l.subjectId?.name || 'Général'}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                        {l.levelId?.code || 'Tous'}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary">
                      {l.week ? `Semaine ${l.week}` : '-'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          l.status === 'PUBLISHED'
                            ? 'bg-status-success-bg text-status-success-text border border-status-success-border'
                            : l.status === 'DRAFT'
                            ? 'bg-status-warning-bg text-status-warning-text border border-status-warning-border'
                            : 'bg-background-surface text-text-muted border border-border-default'
                        }`}
                      >
                        {l.status === 'PUBLISHED'
                          ? 'Publiée'
                          : l.status === 'DRAFT'
                          ? 'Brouillon'
                          : 'Archivée'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {l.status !== 'PUBLISHED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePublish(l.id)}
                          leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Publier
                        </Button>
                      )}
                      {l.status !== 'ARCHIVED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchive(l.id)}
                          leftIcon={<Archive className="w-3.5 h-3.5" />}
                        >
                          Archiver
                        </Button>
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
