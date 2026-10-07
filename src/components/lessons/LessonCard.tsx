import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, HardDriveDownload, Check, Clock, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { offlineStorage } from '../../services/offline.storage';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useSocketEvent } from '../../context/SocketContext';
import { apiClient } from '../../api/client';
import { useToast } from '../ui/Toast';

export interface LessonSummary {
  id: string;
  _id?: string;
  title: string;
  topic?: string;
  levelId?: { _id?: string; id?: string; code: string; label: string };
  subjectId?: { _id?: string; id?: string; name: string; icon?: string };
  domainId?: { _id?: string; id?: string; name: string };
  week?: number;
  term?: number;
  durationMinutes?: number;
  isFavorite?: boolean;
}

export interface LessonCardProps {
  lesson: LessonSummary;
  onToggleFavorite?: (lessonId: string) => Promise<void>;
  onSaveOffline?: (lesson: LessonSummary) => Promise<void>;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onToggleFavorite,
  onSaveOffline,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, openPayModal } = useSubscription();
  const { success, error } = useToast();

  const lessonId = lesson.id || lesson._id || (lesson as any)._id?.toString() || '';

  const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(lesson.isFavorite));
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<boolean>(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState<boolean>(false);
  const [isSavingOffline, setIsSavingOffline] = useState<boolean>(false);

  // Synchronisation avec la prop lesson.isFavorite
  useEffect(() => {
    if (lesson.isFavorite !== undefined) {
      setIsFavorite(Boolean(lesson.isFavorite));
    }
  }, [lesson.isFavorite]);

  // Synchronisation de l'état hors-ligne local
  useEffect(() => {
    let isMounted = true;
    if (lessonId) {
      offlineStorage.isLessonSaved(lessonId).then((saved) => {
        if (isMounted) setIsOfflineSaved(saved);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  // Synchronisation temps réel via socket
  useSocketEvent('FAVORITE_UPDATED', (data: { lessonId: string; isFavorite: boolean }) => {
    if (data?.lessonId === lessonId) {
      setIsFavorite(data.isFavorite);
    }
  });

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lessonId || isTogglingFavorite) return;

    if (!user) {
      error('Veuillez vous connecter pour gérer vos favoris');
      return;
    }

    const previousState = isFavorite;
    const nextState = !previousState;
    setIsFavorite(nextState);
    setIsTogglingFavorite(true);

    try {
      if (onToggleFavorite) {
        await onToggleFavorite(lessonId);
      } else {
        await apiClient.post('/favorites/toggle', { lessonId });
      }
      success(nextState ? 'Fiche ajoutée à vos favoris' : 'Fiche retirée de vos favoris');
    } catch {
      setIsFavorite(previousState);
      error('Impossible de modifier vos favoris');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleOfflineClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lessonId || isSavingOffline) return;

    if (isOfflineSaved) {
      try {
        await offlineStorage.removeLesson(lessonId);
        setIsOfflineSaved(false);
        success('Fiche retirée du stockage hors-ligne');
      } catch {
        error('Impossible de retirer la fiche du stockage local');
      }
      return;
    }

    if (!user) {
      error('Veuillez vous connecter pour sauvegarder hors-ligne');
      return;
    }

    if (subscription?.status !== 'ACTIVE' || !subscription?.endDate) {
      error('Abonnement actif requis pour la sauvegarde hors-ligne');
      openPayModal();
      return;
    }

    try {
      setIsSavingOffline(true);
      if (onSaveOffline) {
        await onSaveOffline({ ...lesson, id: lessonId });
      } else {
        // Demande autonome de jeton d'accès sécurisé
        const accessRes = await apiClient.post(`/lessons/${lessonId}/access`);
        const streamToken = accessRes.data?.data?.accessToken || accessRes.data?.data?.token;

        if (!streamToken) {
          throw new Error('Jeton d’accès sécurisé indisponible');
        }

        // Téléchargement du flux PDF
        const pdfRes = await apiClient.get(`/lessons/${lessonId}/stream`, {
          params: { token: streamToken },
          responseType: 'blob',
        });

        if (!pdfRes.data || pdfRes.data.size === 0) {
          throw new Error('Document PDF indisponible');
        }

        // Sauvegarde locale IndexedDB
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
      }
      setIsOfflineSaved(true);
      success('Fiche enregistrée pour consultation hors-ligne');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible d’enregistrer la fiche hors-ligne';
      error(msg);
    } finally {
      setIsSavingOffline(false);
    }
  };

  const subjectName = lesson.subjectId?.name || 'Matière';
  const levelCode = lesson.levelId?.code || '';

  return (
    <div
      onClick={() => lessonId && navigate(`/fiches/${lessonId}`)}
      className="group bg-background-card rounded-xl border border-border-default hover:border-primary-300 p-4 sm:p-5 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* En-tête : Badges Matière & Semaine */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
              {subjectName}
            </span>
            {levelCode && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-background-surface text-text-secondary border border-border-default">
                {levelCode}
              </span>
            )}
          </div>

          {/* Actions : Favoris & Hors-Ligne */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={isTogglingFavorite}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-secondary-600 bg-secondary-50'
                  : 'text-text-muted hover:text-secondary-600 hover:bg-background-surface'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-label="Favori"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-secondary-600' : ''}`} />
            </button>

            {subscription?.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={handleOfflineClick}
                disabled={isSavingOffline}
                className={`p-1.5 rounded-lg transition-colors ${
                  isOfflineSaved
                    ? 'text-status-success-badge bg-status-success-bg'
                    : 'text-text-muted hover:text-primary-600 hover:bg-background-surface'
                }`}
                title={isOfflineSaved ? 'Sauvegardée hors-ligne' : 'Sauvegarder hors-ligne'}
                aria-label="Sauvegarde hors-ligne"
              >
                {isSavingOffline ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                ) : isOfflineSaved ? (
                  <Check className="w-4 h-4 text-status-success-badge" />
                ) : (
                  <HardDriveDownload className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Titre & Sous-titre */}
        <h3 className="font-semibold text-text-primary text-base leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
          {lesson.title}
        </h3>
        {lesson.topic && (
          <p className="text-xs text-text-muted mt-1 line-clamp-1">{lesson.topic}</p>
        )}
      </div>

      {/* Pied de carte : Métadonnées & Bouton d'accès */}
      <div className="pt-4 mt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-3">
          {lesson.week && (
            <span className="flex items-center gap-1 text-text-muted font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary-500" />
              Semaine {lesson.week}
            </span>
          )}
          {lesson.durationMinutes && (
            <span className="flex items-center gap-1 text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              {lesson.durationMinutes} min
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-primary-600 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Consulter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

