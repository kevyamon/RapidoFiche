import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HardDriveDownload, Bookmark, CreditCard, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { offlineStorage } from '../services/offline.storage';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { PdfViewer } from '../components/viewer/PdfViewer';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, openPayModal } = useSubscription();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState<string>('Fiche Pédagogique');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOfflineSaved, setIsOfflineSaved] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    let blobUrlToRevoke: string | null = null;

    const loadLessonPdf = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // 1. Vérifier si la fiche est stockée hors-ligne
        const localItem = await offlineStorage.getLesson(id);
        if (localItem) {
          setIsOfflineSaved(true);
          setTitle(localItem.lessonData.title);
          const url = URL.createObjectURL(localItem.pdfBlob);
          blobUrlToRevoke = url;
          setPdfBlobUrl(url);
          setIsLoading(false);
          return;
        }

        // 2. Si non stockée localement, vérifier le réseau et demander l'accès
        if (!navigator.onLine) {
          setErrorMessage(
            'Vous êtes actuellement hors-ligne et cette fiche n’a pas été sauvegardée localement.'
          );
          setIsLoading(false);
          return;
        }

        // Demande de jeton d'accès sécurisé (Mode Forteresse)
        const accessRes = await apiClient.post(`/lessons/${id}/access`);
        const { lesson, accessToken } = accessRes.data.data;
        setTitle(lesson.title);
        setIsFavorite(!!lesson.isFavorite);

        // Récupération du flux PDF binaire
        const pdfRes = await apiClient.get(`/lessons/${id}/stream`, {
          params: { token: accessToken },
          responseType: 'blob',
        });

        const url = URL.createObjectURL(pdfRes.data);
        blobUrlToRevoke = url;
        setPdfBlobUrl(url);
      } catch (err: any) {
        const errCode = err?.response?.data?.error?.code;
        if (errCode === 'SUBSCRIPTION_EXPIRED' || errCode === 'SUBSCRIPTION_REQUIRED') {
          setErrorMessage(
            'Votre abonnement est expiré. Activez votre forfait 200 FCFA pour consulter cette fiche.'
          );
        } else if (errCode === 'LEVEL_ACCESS_DENIED') {
          setErrorMessage(
            'Cette fiche pédagogique est réservée à un autre niveau scolaire que votre classe.'
          );
        } else {
          setErrorMessage('Impossible de charger le document pédagogique.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLessonPdf();

    return () => {
      if (blobUrlToRevoke) {
        URL.revokeObjectURL(blobUrlToRevoke);
      }
    };
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    try {
      setIsFavorite(!isFavorite);
      await apiClient.post('/favorites/toggle', { lessonId: id });
    } catch {
      setIsFavorite(isFavorite);
    }
  };

  const handleToggleOffline = async () => {
    if (!id || !user || !subscription?.endDate) return;
    if (isOfflineSaved) {
      await offlineStorage.removeLesson(id);
      setIsOfflineSaved(false);
      success('Fiche retirée de votre stockage hors-ligne');
    } else if (pdfBlobUrl) {
      try {
        const response = await fetch(pdfBlobUrl);
        const blob = await response.blob();
        await offlineStorage.saveLesson(
          { id, title },
          blob,
          user.id,
          subscription.endDate
        );
        setIsOfflineSaved(true);
        success('Fiche sauvegardée pour vos cours hors-ligne');
      } catch {
        toastError('Échec de la sauvegarde locale');
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Barre d'Actions de la Fiche */}
      <div className="flex items-center justify-between gap-3 bg-background-card p-4 rounded-xl border border-border-default shadow-subtle">
        <h1 className="text-base sm:text-lg font-bold text-text-primary truncate">
          {title}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            leftIcon={
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-secondary-600' : ''}`} />
            }
          >
            <span className="hidden sm:inline">
              {isFavorite ? 'Enregistrée' : 'Favoris'}
            </span>
          </Button>

          {subscription?.status === 'ACTIVE' && (
            <Button
              variant={isOfflineSaved ? 'outline' : 'primary'}
              size="sm"
              onClick={handleToggleOffline}
              leftIcon={<HardDriveDownload className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">
                {isOfflineSaved ? 'Sauvegardée' : 'Sauvegarder'}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Message de Blocage d'Accès si Abonnement Expiré */}
      {errorMessage && (
        <div className="p-6 sm:p-8 bg-background-card rounded-2xl border border-border-default shadow-card text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-status-danger-bg text-status-danger-badge flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Accès Restreint</h2>
          <p className="text-xs sm:text-sm text-text-secondary">{errorMessage}</p>

          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/fiches')}>
              Retour aux fiches
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={openPayModal}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Activer (200 FCFA)
            </Button>
          </div>
        </div>
      )}

      {/* Visionneuse PDF */}
      {!errorMessage && (
        <PdfViewer
          pdfBlobUrl={pdfBlobUrl}
          title={title}
          isLoading={isLoading}
          error={null}
          watermarkText={
            user
              ? `${user.firstName} ${user.lastName} • ${user.phone || user.email} • RapidoFiche Officiel`
              : 'RapidoFiche — Licence Enseignant Protégée'
          }
          onBack={() => navigate(-1)}
        />
      )}
    </div>
  );
};
