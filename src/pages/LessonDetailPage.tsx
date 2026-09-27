import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../api/client';
import { offlineStorage } from '../services/offline.storage';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { PdfViewer } from '../components/viewer/PdfViewer';
import { LessonActionHeader } from '../components/lessons/LessonActionHeader';
import { LessonAccessBlocked } from '../components/lessons/LessonAccessBlocked';
import { useToast } from '../components/ui/Toast';
import { useSeo } from '../hooks/useSeo';

export const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { subscription, openPayModal, verifyPayment } = useSubscription();
  const { success, error: toastError, info } = useToast();

  const [title, setTitle] = useState<string>('Fiche Pédagogique');

  useSeo({
    title: title || 'Fiche Pédagogique Numérique',
    description: `Consultez la fiche pédagogique ${title} : préparation de cours, objectifs d'apprentissage et déroulement didactique.`,
    canonicalPath: `/fiches/${id || ''}`,
    ogType: 'article',
  });
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOfflineSaved, setIsOfflineSaved] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const hasVerifiedRef = React.useRef<boolean>(false);

  // Vérification unique si retour de paiement avec query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    const ref = params.get('reference') || params.get('ref');

    if ((paymentStatus === 'success' || ref) && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      info('Validation de votre paiement en cours...');
      verifyPayment(ref || undefined).then((res) => {
        if (res.success) {
          success('Votre forfait 30 jours est activé ! Chargement du document...');
          setErrorMessage(null);
          navigate(location.pathname, { replace: true });
        }
      });
    }
  }, [location.search, location.pathname, navigate, verifyPayment, success, info]);

  const [errorType, setErrorType] = useState<'SUBSCRIPTION' | 'LEVEL' | 'GENERAL' | null>(null);

  const activeBlobUrlRef = React.useRef<string | null>(null);

  const loadLessonPdf = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setErrorType(null);

      // 1. Vérifier si la fiche est stockée hors-ligne
      const localItem = await offlineStorage.getLesson(id);
      if (localItem) {
        setIsOfflineSaved(true);
        setTitle(localItem.lessonData.title);
        if (activeBlobUrlRef.current) URL.revokeObjectURL(activeBlobUrlRef.current);
        const url = URL.createObjectURL(localItem.pdfBlob);
        activeBlobUrlRef.current = url;
        setPdfBlobUrl(url);
        setIsLoading(false);
        return;
      }

      // 2. Si non stockée localement, vérifier le réseau et demander l'accès
      if (!navigator.onLine) {
        setErrorType('GENERAL');
        setErrorMessage(
          'Vous êtes actuellement hors-ligne et cette fiche n’a pas été sauvegardée localement.'
        );
        setIsLoading(false);
        return;
      }

      // Demande de jeton d'accès sécurisé (Mode Forteresse)
      const accessRes = await apiClient.post(`/lessons/${id}/access`);
      const accessData = accessRes.data?.data;
      const streamToken = accessData?.accessToken || accessData?.token;

      if (accessData?.lesson?.title) {
        setTitle(accessData.lesson.title);
      } else {
        try {
          const detailRes = await apiClient.get(`/lessons/${id}`);
          if (detailRes.data?.data?.title) {
            setTitle(detailRes.data.data.title);
          }
        } catch {
          // Ignorer
        }
      }

      if (accessData?.lesson?.isFavorite !== undefined) {
        setIsFavorite(!!accessData.lesson.isFavorite);
      }

      if (!streamToken) {
        throw new Error('Jeton de visionnage non fourni par le serveur');
      }

      // Récupération du flux PDF binaire
      const pdfRes = await apiClient.get(`/lessons/${id}/stream`, {
        params: { token: streamToken },
        responseType: 'blob',
      });

      if (!pdfRes.data || pdfRes.data.size === 0) {
        throw new Error('Document PDF vide ou indisponible');
      }

      // Si le serveur a renvoyé du JSON d'erreur encapsulé dans un blob
      if (pdfRes.data.type && pdfRes.data.type.includes('application/json')) {
        const text = await pdfRes.data.text();
        const jsonErr = JSON.parse(text);
        throw new Error(jsonErr?.error?.message || 'Erreur lors du chargement de la fiche');
      }

      if (activeBlobUrlRef.current) URL.revokeObjectURL(activeBlobUrlRef.current);
      const pdfBlob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      activeBlobUrlRef.current = url;
      setPdfBlobUrl(url);
    } catch (err: any) {
      let errCode = err?.response?.data?.error?.code;

      if (!errCode && err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          errCode = parsed?.error?.code;
          if (parsed?.error?.message) {
            setErrorMessage(parsed.error.message);
          }
        } catch {
          // Ignorer
        }
      }

      if (errCode === 'SUBSCRIPTION_EXPIRED' || errCode === 'SUBSCRIPTION_REQUIRED') {
        setErrorType('SUBSCRIPTION');
        setErrorMessage(
          'Votre abonnement est expiré. Activez votre forfait 200 FCFA pour consulter cette fiche.'
        );
      } else if (errCode === 'LEVEL_ACCESS_DENIED') {
        setErrorType('LEVEL');
        setErrorMessage(
          'Cette fiche pédagogique est réservée à un autre niveau scolaire que votre classe principale.'
        );
      } else {
        setErrorType('GENERAL');
        setErrorMessage(
          err?.response?.data?.error?.message ||
          err?.message ||
          'Impossible de charger le document pédagogique.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLessonPdf();
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, [loadLessonPdf]);

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
      <LessonActionHeader
        title={title}
        isFavorite={isFavorite}
        isOfflineSaved={isOfflineSaved}
        isSubscriptionActive={subscription?.status === 'ACTIVE'}
        onToggleFavorite={handleToggleFavorite}
        onToggleOffline={handleToggleOffline}
      />

      {/* Message de Blocage d'Accès si Abonnement Expiré, Accès Refusé ou Erreur */}
      {errorMessage && (
        <LessonAccessBlocked
          errorType={errorType}
          errorMessage={errorMessage}
          onBack={() => navigate('/fiches')}
          onRetry={loadLessonPdf}
          onOpenPayModal={openPayModal}
        />
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
