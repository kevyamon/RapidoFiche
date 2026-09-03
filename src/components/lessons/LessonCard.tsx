import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, HardDriveDownload, Check, Clock, Calendar, ArrowRight } from 'lucide-react';
import { offlineStorage } from '../../services/offline.storage';
import { useSubscription } from '../../context/SubscriptionContext';
import { useToast } from '../ui/Toast';

export interface LessonSummary {
  id: string;
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
  const { subscription } = useSubscription();
  const { success, error } = useToast();
  const [isFavorite, setIsFavorite] = useState<boolean>(!!lesson.isFavorite);
  const [isOfflineSaved, setIsOfflineSaved] = useState<boolean>(false);
  const [isSavingOffline, setIsSavingOffline] = useState<boolean>(false);

  useEffect(() => {
    offlineStorage.isLessonSaved(lesson.id).then(setIsOfflineSaved);
  }, [lesson.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsFavorite(!isFavorite);
      if (onToggleFavorite) {
        await onToggleFavorite(lesson.id);
      }
    } catch {
      setIsFavorite(isFavorite);
    }
  };

  const handleOfflineClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOfflineSaved) {
      await offlineStorage.removeLesson(lesson.id);
      setIsOfflineSaved(false);
      success('Fiche retirée du stockage hors-ligne');
      return;
    }

    if (onSaveOffline) {
      try {
        setIsSavingOffline(true);
        await onSaveOffline(lesson);
        setIsOfflineSaved(true);
        success('Fiche enregistrée pour consultation hors-ligne');
      } catch (err: unknown) {
        error(
          err instanceof Error
            ? err.message
            : 'Impossible d’enregistrer la fiche hors-ligne'
        );
      } finally {
        setIsSavingOffline(false);
      }
    }
  };

  const subjectName = lesson.subjectId?.name || 'Matière';
  const levelCode = lesson.levelId?.code || '';

  return (
    <div
      onClick={() => navigate(`/fiches/${lesson.id}`)}
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
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-secondary-600 bg-secondary-50'
                  : 'text-text-muted hover:text-secondary-600 hover:bg-background-surface'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-label="Favori"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {subscription?.status === 'ACTIVE' && (
              <button
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
                {isOfflineSaved ? <Check className="w-4 h-4" /> : <HardDriveDownload className="w-4 h-4" />}
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
