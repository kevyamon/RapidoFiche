import React, { useState, useEffect } from 'react';
import { Bookmark, SearchX } from 'lucide-react';
import { apiClient } from '../api/client';
import { LessonCard, LessonSummary } from '../components/lessons/LessonCard';
import { useToast } from '../components/ui/Toast';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success } = useToast();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/favorites');
        if (res.data?.success) {
          const items = res.data.data.map(
            (f: { lessonId: LessonSummary }) => ({
              ...f.lessonId,
              isFavorite: true,
            })
          );
          setFavorites(items.filter(Boolean));
        }
      } catch {
        // Ignorer
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (lessonId: string) => {
    await apiClient.post('/favorites/toggle', { lessonId });
    setFavorites((prev) => prev.filter((f) => f.id !== lessonId));
    success('Fiche retirée de vos favoris');
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-hidden">
      {/* En-tête */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-secondary-600 fill-current" />
          <span>Mes Fiches Favorites</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Retrouvez rapidement les fiches que vous avez épinglées pour vos préparations de cours.
        </p>
      </div>

      {/* Liste des Favoris */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-card rounded-xl border border-border-default p-5 shadow-card animate-pulse h-40"
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-background-card rounded-2xl border border-border-default text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center mb-3">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">Aucun favori enregistré</h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-sm">
            Cliquez sur l’icône signet d'une fiche pour la conserver dans votre sélection rapide.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {favorites.map((lesson) => (
            <LessonCard
              key={lesson.id || (lesson as any)._id || lesson.title}
              lesson={lesson}
              onToggleFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
