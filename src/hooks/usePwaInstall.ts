import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'rapidofiche_pwa_prompt_dismissed';

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // 1. Vérifier si l'application est déjà exécutée en mode Standalone / Installée
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Détection iOS (Safari ne supporte pas beforeinstallprompt nativement)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Capture de l'événement natif d'installation PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Ouvrir automatiquement la modale après un court délai si non masquée
      const isDismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!isDismissed) {
        setTimeout(() => {
          setIsModalOpen(true);
        }, 1200);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsModalOpen(false);
      setDeferredPrompt(null);
      sessionStorage.setItem(DISMISS_KEY, 'installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Sur iOS, proposer la modale avec instructions si première visite
    if (isIosDevice && !isStandalone) {
      const isDismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!isDismissed) {
        setTimeout(() => {
          setIsModalOpen(true);
        }, 1500);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsModalOpen(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((rememberChoice = true) => {
    setIsModalOpen(false);
    if (rememberChoice) {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    }
  }, []);

  return {
    canInstall: !!deferredPrompt || isIos,
    isInstalled,
    isIos,
    isModalOpen,
    promptInstall,
    openModal,
    closeModal,
  };
};
