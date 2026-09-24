import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN' | 'CONTENT_MANAGER';
  primaryLevelId?: {
    _id?: string;
    id?: string;
    code: string;
    label: string;
  } | string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    primaryLevelId: string;
  }) => Promise<void>;
  loginWithGoogle: (idToken: string, primaryLevelId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('rapidofiche_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data?.success && response.data?.data) {
        const freshUser = response.data.data.user || response.data.data;
        setUser(freshUser);
        localStorage.setItem('rapidofiche_user', JSON.stringify(freshUser));
      }
    } catch {
      // Ignorer si déconnecté ou token invalide
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('rapidofiche_access_token');
      if (token) {
        await refreshProfile();
      }
      setIsLoading(false);
    };

    initAuth();

    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem('rapidofiche_access_token');
      localStorage.removeItem('rapidofiche_user');
    };

    window.addEventListener('rapidofiche_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('rapidofiche_session_expired', handleSessionExpired);
    };
  }, [refreshProfile]);

  const syncAdminState = (userObj: any, token?: string) => {
    if (token) {
      localStorage.setItem('rapidofiche_access_token', token);
      if (userObj.role === 'ADMIN' || userObj.role === 'SUPER_ADMIN') {
        localStorage.setItem('rapidofiche_admin_token', token);
      }
    }
    localStorage.setItem('rapidofiche_user', JSON.stringify(userObj));
    if (userObj.role === 'ADMIN' || userObj.role === 'SUPER_ADMIN') {
      localStorage.setItem('rapidofiche_admin_user', JSON.stringify(userObj));
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const resData = response.data.data;
    const loggedUser = resData.user || resData;
    const token = resData.accessToken || resData.tokens?.accessToken;
    syncAdminState(loggedUser, token);
    setUser(loggedUser);
    await refreshProfile();
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    primaryLevelId: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    const resData = response.data.data;
    const registeredUser = resData.user || resData;
    const token = resData.accessToken || resData.tokens?.accessToken;
    syncAdminState(registeredUser, token);
    setUser(registeredUser);
    await refreshProfile();
  };

  const loginWithGoogle = async (idToken: string, primaryLevelId?: string) => {
    const response = await apiClient.post('/auth/google', { idToken, primaryLevelId });
    const resData = response.data.data;
    const loggedUser = resData.user || resData;
    const token = resData.accessToken || resData.tokens?.accessToken;
    syncAdminState(loggedUser, token);
    setUser(loggedUser);
    await refreshProfile();
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignorer l'erreur réseau au logout
    } finally {
      setUser(null);
      localStorage.removeItem('rapidofiche_access_token');
      localStorage.removeItem('rapidofiche_refresh_token');
      localStorage.removeItem('rapidofiche_user');
      localStorage.removeItem('rapidofiche_admin_token');
      localStorage.removeItem('rapidofiche_admin_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
};
