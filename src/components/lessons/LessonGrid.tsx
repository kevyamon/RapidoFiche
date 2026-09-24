import React from 'react';
import { SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonCard, LessonSummary } from './LessonCard';
import { Button } from '../ui/Button';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LessonGridProps {
  lessons: LessonSummary[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (newPage: number) => void;
  onToggleFavorite?: (lessonId: string) => Promise<void>;
  onSaveOffline?: (lesson: LessonSummary) => Promise<void>;
  emptyMessage?: string;
}

export const LessonGrid: React.FC<LessonGridProps> = ({
  lessons,
  isLoading,
  pagination,
  onPageChange,
  onToggleFavorite,
  onSaveOffline,
  emptyMessage = 'Aucune fiche pédagogique ne correspond à vos critères de recherche.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-background-card rounded-xl border border-border-default p-5 shadow-card animate-pulse flex flex-col justify-between h-44"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-24 bg-border-subtle rounded-full" />
                <div className="h-6 w-6 bg-border-subtle rounded-lg" />
              </div>
              <div className="h-5 w-3/4 bg-border-subtle rounded mb-2" />
              <div className="h-4 w-1/2 bg-border-subtle rounded" />
            </div>
            <div className="pt-4 border-t border-border-subtle flex justify-between">
              <div className="h-4 w-20 bg-border-subtle rounded" />
              <div className="h-4 w-16 bg-border-subtle rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-background-card rounded-2xl border border-border-default text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">Aucune fiche trouvée</h3>
        <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grille de Fiches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id || (lesson as any)._id || lesson.title}
            lesson={lesson}
            onToggleFavorite={onToggleFavorite}
            onSaveOffline={onSaveOffline}
          />
        ))}
      </div>

      {/* Barre de Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-default">
          <span className="text-xs text-text-muted">
            Page {pagination.page} sur {pagination.pages} ({pagination.total} fiches)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
