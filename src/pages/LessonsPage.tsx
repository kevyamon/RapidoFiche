import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, ShieldAlert, CreditCard } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { LessonFilter, LessonFilterValues, SubjectItem } from '../components/lessons/LessonFilter';
import { LessonGrid, PaginationInfo } from '../components/lessons/LessonGrid';
import { LessonSummary } from '../components/lessons/LessonCard';
import { offlineStorage } from '../services/offline.storage';
import { useToast } from '../components/ui/Toast';
import { useSeo } from '../hooks/useSeo';

export const LessonsPage: React.FC = () => {
  useSeo({
    title: 'Catalogue des Fiches Pédagogiques',
    description: 'Explorez la bibliothèque complète des fiches pédagogiques du primaire (CP1 au CM2) : mathématiques, français, sciences, histoire-géo, EDHC, conformes au programme officiel MENA.',
    canonicalPath: '/fiches',
  });

  const { user } = useAuth();
  const { subscription, openPayModal } = useSubscription();
  const { error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<LessonFilterValues>({
    search: searchParams.get('search') || '',
    subjectId: searchParams.get('subjectId') || '',
    week: searchParams.get('week') || '',
    term: searchParams.get('term') || '',
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
      try {
        const res = await apiClient.get('/me/subjects');
        if (res.data?.success) {
          setSubjects(res.data.data);
        }
      } catch {
        // Mode silencieux
      }
    };
    fetchSubjects();
  }, [user]);

  const errorRef = useRef(error);
  errorRef.current = error;

  const fetchLessons = useCallback(
    async (pageNumber = 1) => {
      try {
        setIsLoading(true);
        const params: Record<string, unknown> = {
          page: pageNumber,
          limit: 12,
        };

        if (filters.search) params.search = filters.search;
        if (filters.subjectId) params.subjectId = filters.subjectId;
        if (filters.week) params.week = filters.week;
        if (filters.term) params.term = filters.term;

        const res = await apiClient.get('/lessons', { params });
        if (res.data?.success) {
          setLessons(res.data.data);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err: any) {
        if (err?.response?.status !== 401 && err?.response?.status !== 429) {
          errorRef.current('Impossible de charger les fiches pédagogiques');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchLessons(1);
  }, [fetchLessons]);

  const handleFilterChange = (newFilters: LessonFilterValues) => {
    setFilters(newFilters);
    const params: Record<string, string> = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.subjectId) params.subjectId = newFilters.subjectId;
    if (newFilters.week) params.week = newFilters.week;
    if (newFilters.term) params.term = newFilters.term;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setFilters({ search: '', subjectId: '', week: '', term: '' });
    setSearchParams({});
  };

  const handleToggleFavorite = async (lessonId: string) => {
    setLessons((prev) =>
      prev.map((l) => {
        const lid = l.id || (l as any)._id;
        return lid === lessonId ? { ...l, isFavorite: !l.isFavorite } : l;
      })
    );
    await apiClient.post('/favorites/toggle', { lessonId });
  };

  const handleSaveOffline = async (lesson: LessonSummary) => {
    if (!subscription?.endDate || !user) {
      throw new Error('Abonnement actif requis pour la sauvegarde hors-ligne');
    }
    const lessonId = lesson.id || (lesson as any)._id;
    if (!lessonId) throw new Error('Identifiant de fiche introuvable');

    const accessRes = await apiClient.post(`/lessons/${lessonId}/access`);
    const streamToken = accessRes.data?.data?.accessToken || accessRes.data?.data?.token;

    const pdfRes = await apiClient.get(`/lessons/${lessonId}/stream`, {
      params: { token: streamToken },
      responseType: 'blob',
    });

    await offlineStorage.saveLesson(
      {
        id: lessonId,
        title: lesson.title,
        levelId: lesson.levelId,
        subjectId: lesson.subjectId,
        week: lesson.week,
        topic: lesson.topic,
      },
      pdfRes.data,
      user.id,
      subscription.endDate
    );
  };

  const isSubActive = subscription?.status === 'ACTIVE';

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-hidden">
      {/* Bannière Rouge Bien Visible si Abonnement Inactif ou Expiré */}
      {!isSubActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-status-danger-bg border-2 border-status-danger-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-status-danger-badge text-white shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-status-danger-text">
                Abonnement requis ou expiré
              </h2>
              <p className="text-xs text-status-danger-text/90 mt-0.5">
                Activez votre forfait (200 FCFA) pour débloquer l’ensemble des fiches de votre classe.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openPayModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-status-danger-badge hover:bg-red-600 text-white font-bold text-xs sm:text-sm shadow-subtle shrink-0 transition-all active:scale-95 animate-pulse"
          >
            <CreditCard className="w-4 h-4" />
            <span>S’abonner (200 FCFA)</span>
          </button>
        </div>
      )}

      {/* En-tête de Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <span>Bibliothèque de Fiches</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Fiches pédagogiques conformes aux programmes officiels du primaire.
          </p>
        </div>
      </div>

      {/* Barre de Filtres */}
      <LessonFilter
        subjects={subjects}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Grille de Fiches Intelligente */}
      <LessonGrid
        lessons={lessons}
        isLoading={isLoading}
        isSubActive={isSubActive}
        onOpenPayModal={openPayModal}
        pagination={pagination}
        onPageChange={(page) => fetchLessons(page)}
        onToggleFavorite={handleToggleFavorite}
        onSaveOffline={handleSaveOffline}
        emptyMessage="Aucune fiche pédagogique n’a encore été publiée pour cette matière ou semaine."
      />
    </div>
  );
};
