import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { Navbar } from './Navbar';
import { BottomNavigation } from './BottomNavigation';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ScrollToTopButton } from '../common/ScrollToTopButton';
import { useToast } from '../ui/Toast';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const {
    isPayModalOpen,
    closePayModal,
    initiateSubscriptionPayment,
    checkSubscription,
  } = useSubscription();
  const { error: toastError, info: toastInfo } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (user?.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone, isPayModalOpen]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      toastInfo('Connexion à la passerelle GeniusPay...');
      const res = await initiateSubscriptionPayment(phoneNumber || undefined);
      if (res.checkoutUrl) {
        closePayModal();
        setIsSubmitting(false);

        const isExternal =
          res.checkoutUrl.startsWith('https://pay.genius.ci') ||
          res.checkoutUrl.startsWith('http://pay.genius.ci') ||
          (!res.checkoutUrl.includes(window.location.host) &&
            (res.checkoutUrl.startsWith('http://') || res.checkoutUrl.startsWith('https://')));

        if (isExternal) {
          window.location.href = res.checkoutUrl;
          return;
        }

        // Mode Mock local : rechargement propre avec abonnement activé
        await checkSubscription();
        window.location.reload();
      } else {
        throw new Error('L’URL de paiement GeniusPay est introuvable.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Échec de l’ouverture de la page de paiement. Veuillez réessayer';
      toastError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-main text-text-primary overflow-x-hidden w-full max-w-full relative">
      {/* Bannière de Connexion Hors-Ligne */}
      {!isOnline && (
        <div className="bg-status-warning-bg border-b border-status-warning-border px-4 py-2 text-center text-xs font-medium text-status-warning-text flex items-center justify-center gap-2 sticky top-0 z-50">
          <WifiOff className="w-4 h-4 text-status-warning-badge" />
          <span>Mode Hors-Ligne activé : seules vos fiches sauvegardées sont accessibles.</span>
        </div>
      )}

      {/* En-tête Supérieur */}
      <Navbar />

      {/* Contenu Principal avec marge basse pour la Bottom Bar Mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Barre de Navigation Basse (Smartphone) */}
      {user && <BottomNavigation />}

      {/* Bouton de Scroll en haut */}
      <ScrollToTopButton />

      {/* Modale d'Abonnement 200 FCFA GeniusPay */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={closePayModal}
        title="Abonnement Mensuel RapidoFiche"
        description="Accès illimité à l’ensemble des fiches pédagogiques officielles de votre niveau"
        maxWidth="md"
      >
        <form onSubmit={handlePay} className="space-y-4">
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-900">Forfait Essentiel Enseignant</p>
              <p className="text-xs text-primary-700 mt-0.5">Valable 30 jours pour votre classe</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary-900">200</span>
              <span className="text-xs font-semibold text-primary-700 ml-1">FCFA / mois</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Numéro de téléphone mobile (Orange, MTN, Moov, Wave)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex : 0708091011"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-background-input text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Paiement sécurisé instantané via la passerelle GeniusPay.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={closePayModal} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button variant="secondary" type="submit" isLoading={isSubmitting}>
              Payer 200 FCFA
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

