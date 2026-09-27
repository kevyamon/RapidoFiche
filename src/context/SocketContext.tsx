import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services/socket.service';
import { useAuth } from './AuthContext';
import { useAdminAuth } from './AdminAuthContext';
import { useSubscription } from './SubscriptionContext';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  on: (event: string, callback: (data: any) => void) => () => void;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { adminUser } = useAdminAuth();
  const { checkSubscription } = useSubscription();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const checkSubRef = useRef(checkSubscription);
  checkSubRef.current = checkSubscription;

  useEffect(() => {
    const s = socketService.connect();
    setSocket(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    if (s.connected) {
      setIsConnected(true);
    }

    // Écouteur global pour la mise à jour immédiate d'abonnement
    const unsubSub = socketService.on('SUBSCRIPTION_UPDATED', () => {
      checkSubRef.current();
    });

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      unsubSub();
    };
  }, []);

  // Reconnexion avec le token actuel lors d'une connexion / déconnexion
  useEffect(() => {
    const token = localStorage.getItem('rapidofiche_access_token');
    const adminToken = localStorage.getItem('rapidofiche_admin_token');
    const activeToken = token || adminToken || undefined;
    socketService.reconnectWithToken(activeToken);
    if (adminToken) {
      socketService.joinAdminRoom(adminToken);
    }
  }, [isAuthenticated, adminUser]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    return socketService.on(event, callback);
  }, []);

  const reconnect = useCallback(() => {
    const token = localStorage.getItem('rapidofiche_access_token');
    const adminToken = localStorage.getItem('rapidofiche_admin_token');
    const activeToken = token || adminToken || undefined;
    socketService.reconnectWithToken(activeToken);
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, on, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket doit être utilisé au sein d’un SocketProvider');
  }
  return context;
};

export const useSocketEvent = (event: string, callback: (data: any) => void): void => {
  const { on } = useSocket();
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    const handler = (data: any) => {
      savedCallback.current(data);
    };
    const unsubscribe = on(event, handler);
    return () => {
      unsubscribe();
    };
  }, [event, on]);
};
