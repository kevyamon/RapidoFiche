import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardDriveDownload, Trash2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { offlineStorage, StoredOfflineLesson } from '../services/offline.storage';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const OfflineLessonsPage: React.FC = () => {
  const [savedLessons, setSavedLessons] = useState<StoredOfflineLesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { success } = useToast();

  const loadSavedLessons = async () => {
    try {
      setIsLoading(true);
      const items = await offlineStorage.getAllSavedLessons();
      setSavedLessons(items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedLessons();
  }, []);

  const handleRemove = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await offlineStorage.removeLesson(lessonId);
    setSavedLessons((prev) => prev.filter((item) => item.lessonId !== lessonId));
    success('Fiche supprimée de votre espace hors-ligne');
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-hidden">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
            <HardDriveDownload className="w-6 h-6 text-primary-600" />
            <span>Fiches Hors-Ligne</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Consultez vos fiches pédagogiques directement en classe sans connexion Internet.
          </p>
        </div>

        <span className="text-xs font-medium text-text-muted self-start sm:self-auto">
          {savedLessons.length} fiche(s) disponible(s)
        </span>
      </div>

      {/* Avertissement Technique sur la Validité de l'Accès */}
      <div className="p-4 rounded-xl bg-background-card border border-border-default flex items-start gap-3 text-xs text-text-secondary">
        <AlertCircle className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Les fiches enregistrées restent consultables hors-ligne tant que votre abonnement mensuel est actif, avec un délai de grâce technique de 24h après échéance.
        </p>
      </div>

      {/* Liste des Fiches Enregistrées */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-card rounded-xl border border-border-default p-5 shadow-card animate-pulse h-36"
            />
          ))}
        </div>
      ) : savedLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-background-card rounded-2xl border border-border-default text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            Aucune fiche sauvegardée hors-ligne
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-sm mb-4">
            Téléchargez les fiches de la semaine pendant que vous êtes connecté afin d'y accéder librement en classe.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/fiches')}>
            Parcourir les fiches
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedLessons.map((item) => (
            <div
              key={item.lessonId}
              onClick={() => navigate(`/fiches/${item.lessonId}`)}
              className="bg-background-card rounded-xl border border-border-default hover:border-primary-300 p-4 sm:p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-status-success-bg text-status-success-text border border-status-success-border">
                    Disponible hors-ligne
                  </span>
                  <button
                    onClick={(e) => handleRemove(item.lessonId, e)}
                    className="p-1.5 text-text-muted hover:text-status-danger-text hover:bg-status-danger-bg rounded-lg transition-colors"
                    title="Supprimer du stockage"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-text-primary text-base leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
                  {item.lessonData.title}
                </h3>
              </div>

              <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <span>Enregistrée le {new Date(item.savedAt).toLocaleDateString('fr-FR')}</span>
                <span className="inline-flex items-center gap-1 text-primary-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Ouvrir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
