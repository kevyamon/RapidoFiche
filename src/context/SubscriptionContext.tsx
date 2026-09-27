import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from './AuthContext';

export interface SubscriptionData {
  hasSubscription: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'NONE';
  startDate?: string;
  endDate?: string;
  daysRemaining?: number;
  autoRenew?: boolean;
}

interface VerifyPaymentResult {
  success: boolean;
  status?: string;
  message?: string;
  subscription?: SubscriptionData;
}

interface SubscriptionContextValue {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  isVerifyingPayment: boolean;
  isPayModalOpen: boolean;
  openPayModal: () => void;
  closePayModal: () => void;
  checkSubscription: (isSilent?: boolean) => Promise<void>;
  verifyPayment: (reference?: string) => Promise<VerifyPaymentResult>;
  initiateSubscriptionPayment: (phoneNumber?: string) => Promise<{ checkoutUrl: string; reference: string }>;
}

const SUBSCRIPTION_CACHE_KEY = 'rapidofiche_subscription_cache';

const loadCachedSubscription = (): SubscriptionData | null => {
  try {
    const cached = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (!cached) return null;
    const parsed: SubscriptionData = JSON.parse(cached);
    if (parsed.status === 'ACTIVE') {
      if (parsed.endDate) {
        const end = new Date(parsed.endDate).getTime();
        const now = Date.now();
        if (end < now) {
          return { ...parsed, status: 'EXPIRED', daysRemaining: 0 };
        }
        const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
        return { ...parsed, daysRemaining };
      }
      return parsed;
    }
    return parsed;
  } catch {
    return null;
  }
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(() => loadCachedSubscription());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkSubscription = useCallback(
    async (isSilent = false) => {
      if (!isAuthenticated) {
        setSubscription(null);
        localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        return;
      }

      try {
        if (!isSilent && !subscription) {
          setIsLoading(true);
        }
        const response = await apiClient.get('/me/subscription');
        if (response.data?.success) {
          const data: SubscriptionData = response.data.data;
          setSubscription(data);
          localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(data));
        }
      } catch (err: any) {
        const isColdStartOrNetworkError =
          !err?.response ||
          err?.code === 'ECONNABORTED' ||
          err?.message?.includes('Network Error') ||
          err?.response?.status === 502 ||
          err?.response?.status === 503 ||
          err?.response?.status === 504;

        const currentCache = loadCachedSubscription();

        // Protection Forteresse : Si le backend est en veille, conserver le forfait valide et planifier un retry
        if (isColdStartOrNetworkError && currentCache && currentCache.status === 'ACTIVE') {
          setSubscription(currentCache);
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            checkSubscription(true);
          }, 3500);
          return;
        }

        if (err?.response?.status === 401) {
          setSubscription(null);
          localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        } else if (!currentCache || currentCache.status !== 'ACTIVE') {
          setSubscription({
            hasSubscription: false,
            status: 'NONE',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, subscription]
  );

  const verifyPayment = useCallback(
    async (reference?: string): Promise<VerifyPaymentResult> => {
      if (!isAuthenticated) return { success: false, message: 'Non authentifié' };

      try {
        setIsVerifyingPayment(true);
        const res = await apiClient.post('/payments/verify', { reference });
        if (res.data?.success) {
          const subData = res.data?.data?.subscription;
          if (subData) {
            setSubscription(subData);
            localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(subData));
          } else {
            await checkSubscription(false);
          }
          return {
            success: true,
            status: res.data?.data?.status || 'SUCCESS',
            subscription: subData,
          };
        }
        return {
          success: false,
          status: res.data?.data?.status,
          message: res.data?.data?.message || 'Paiement non confirmé',
        };
      } catch (err: any) {
        return {
          success: false,
          message: err?.response?.data?.error?.message || 'Erreur lors de la vérification du paiement',
        };
      } finally {
        setIsVerifyingPayment(false);
      }
    },
    [isAuthenticated, checkSubscription]
  );

  useEffect(() => {
    checkSubscription(false);
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [checkSubscription]);

  const verifiedRefTracker = useRef<Set<string>>(new Set());

  // Détection automatique du retour de paiement GeniusPay (sécurisée et unique)
  useEffect(() => {
    if (!isAuthenticated) return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const ref = params.get('reference') || params.get('ref') || 'default_ref';

    if (paymentStatus === 'success' || (ref && ref !== 'default_ref')) {
      const key = `${paymentStatus}_${ref}`;
      if (!verifiedRefTracker.current.has(key)) {
        verifiedRefTracker.current.add(key);
        verifyPayment(ref !== 'default_ref' ? ref : undefined).then(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        });
      }
    } else if (paymentStatus === 'cancelled') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated, verifyPayment]);

  const openPayModal = () => setIsPayModalOpen(true);
  const closePayModal = () => setIsPayModalOpen(false);

  const initiateSubscriptionPayment = async (phoneNumber?: string) => {
    const cleanPhone = phoneNumber?.trim();
    const payload: Record<string, string> = {
      callbackUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
    };

    if (cleanPhone && cleanPhone.length >= 8) {
      payload.phoneNumber = cleanPhone;
      payload.customerPhone = cleanPhone;
    }

    const response = await apiClient.post('/payments/initiate', payload);
    const checkoutUrl = response.data?.data?.checkoutUrl;
    const reference = response.data?.data?.reference;

    if (!checkoutUrl) {
      throw new Error(
        response.data?.error?.message ||
        'Impossible de générer le lien de paiement GeniusPay. Veuillez réessayer'
      );
    }

    return {
      checkoutUrl,
      reference,
    };
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        isVerifyingPayment,
        isPayModalOpen,
        openPayModal,
        closePayModal,
        checkSubscription,
        verifyPayment,
        initiateSubscriptionPayment,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription doit être utilisé à l’intérieur d’un SubscriptionProvider');
  }
  return context;
};
