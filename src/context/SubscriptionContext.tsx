import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface SubscriptionContextValue {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  isPayModalOpen: boolean;
  openPayModal: () => void;
  closePayModal: () => void;
  checkSubscription: () => Promise<void>;
  initiateSubscriptionPayment: (phoneNumber?: string) => Promise<{ checkoutUrl: string; reference: string }>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get('/subscriptions/me');
      if (response.data?.success) {
        setSubscription(response.data.data);
      }
    } catch {
      setSubscription({
        hasSubscription: false,
        status: 'NONE',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const openPayModal = () => setIsPayModalOpen(true);
  const closePayModal = () => setIsPayModalOpen(false);

  const initiateSubscriptionPayment = async (phoneNumber?: string) => {
    const response = await apiClient.post('/payments/initiate', {
      phoneNumber,
      callbackUrl: `${window.location.origin}/profil?payment=success`,
    });

    return {
      checkoutUrl: response.data?.data?.checkoutUrl,
      reference: response.data?.data?.reference,
    };
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        isPayModalOpen,
        openPayModal,
        closePayModal,
        checkSubscription,
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
