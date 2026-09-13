import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { LessonFilter, LessonFilterValues, SubjectItem } from '../components/lessons/LessonFilter';
import { LessonGrid, PaginationInfo } from '../components/lessons/LessonGrid';
import { LessonSummary } from '../components/lessons/LessonCard';
import { offlineStorage } from '../services/offline.storage';
import { useToast } from '../components/ui/Toast';

export const LessonsPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
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

  // Charger les matières de l'enseignant
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await apiClient.get('/me/subjects');
        if (res.data?.success) {
          setSubjects(res.data.data);
        }
      } catch {
        // Ignorer
      }
    };
    fetchSubjects();
  }, []);

  // Charger les fiches avec filtres et pagination
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
      } catch (err: unknown) {
        error('Impossible de charger les fiches pédagogiques');
      } finally {
        setIsLoading(false);
      }
    },
    [filters, error]
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
    const emptyFilters = { search: '', subjectId: '', week: '', term: '' };
    setFilters(emptyFilters);
    setSearchParams({});
  };

  const handleToggleFavorite = async (lessonId: string) => {
    await apiClient.post('/favorites/toggle', { lessonId });
  };

  const handleSaveOffline = async (lesson: LessonSummary) => {
    if (!subscription?.endDate || !user) {
      throw new Error('Abonnement actif requis pour la sauvegarde hors-ligne');
    }
    const accessRes = await apiClient.post(`/lessons/${lesson.id}/access`);
    const streamToken = accessRes.data?.data?.accessToken;

    const pdfRes = await apiClient.get(`/lessons/${lesson.id}/stream`, {
      params: { token: streamToken },
      responseType: 'blob',
    });

    await offlineStorage.saveLesson(
      {
        id: lesson.id,
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

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-hidden">
      {/* En-tête de Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            <span>Bibliothèque de Fiches</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Fiches pédagogiques conformes aux programmes officiels de votre classe.
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

      {/* Grille de Fiches */}
      <LessonGrid
        lessons={lessons}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(page) => fetchLessons(page)}
        onToggleFavorite={handleToggleFavorite}
        onSaveOffline={handleSaveOffline}
      />
    </div>
  );
};
