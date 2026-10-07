import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAuthApi, AdminUser, AdminLoginDto, AdminRegisterDto } from '../api/adminAuthApi';

export type AdminTab = 'dashboard' | 'lessons' | 'import' | 'users';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthModalOpen: boolean;
  isManagerOpen: boolean;
  activeTab: AdminTab;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openManager: () => void;
  closeManager: () => void;
  setActiveTab: (tab: AdminTab) => void;
  loginAdmin: (data: AdminLoginDto) => Promise<void>;
  registerAdmin: (data: AdminRegisterDto) => Promise<void>;
  logoutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'rapidofiche_admin_user';
const ADMIN_TOKEN_KEY = 'rapidofiche_admin_token';
const ADMIN_OPEN_KEY = 'rapidofiche_admin_manager_open';
const ADMIN_TAB_KEY = 'rapidofiche_admin_active_tab';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const user = localStorage.getItem(ADMIN_STORAGE_KEY);
    const wasOpen = localStorage.getItem(ADMIN_OPEN_KEY);
    if (token && user) {
      return wasOpen !== 'false';
    }
    return false;
  });

  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    const savedTab = localStorage.getItem(ADMIN_TAB_KEY) as AdminTab;
    if (savedTab && ['dashboard', 'lessons', 'import', 'users'].includes(savedTab)) {
      return savedTab;
    }
    return 'dashboard';
  });

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    localStorage.setItem(ADMIN_TAB_KEY, tab);
  };

  const isAdmin = !!adminUser && (adminUser.role === 'ADMIN' || adminUser.role === 'SUPER_ADMIN');
  const isSuperAdmin = !!adminUser && adminUser.role === 'SUPER_ADMIN';

  const handleOpenStealth = useCallback(() => {
    const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (savedToken && adminUser) {
      localStorage.setItem(ADMIN_OPEN_KEY, 'true');
      setIsManagerOpen(true);
      setIsAuthModalOpen(false);
    } else {
      setIsAuthModalOpen(true);
      setIsManagerOpen(false);
    }
  }, [adminUser]);

  useEffect(() => {
    const onStealthEvent = () => handleOpenStealth();
    window.addEventListener('open-stealth-admin', onStealthEvent);
    return () => {
      window.removeEventListener('open-stealth-admin', onStealthEvent);
    };
  }, [handleOpenStealth]);

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_OPEN_KEY);
      localStorage.removeItem(ADMIN_TAB_KEY);
      localStorage.removeItem('rapidofiche_access_token');
      localStorage.removeItem('rapidofiche_refresh_token');
      setAdminUser(null);
      setIsManagerOpen(false);
      setIsAuthModalOpen(true);
    };
    window.addEventListener('rapidofiche_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('rapidofiche_session_expired', handleSessionExpired);
    };
  }, []);

  const loginAdmin = async (data: AdminLoginDto): Promise<void> => {
    const result = await adminAuthApi.login(data);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(result.user));
    localStorage.setItem(ADMIN_TOKEN_KEY, result.accessToken);
    localStorage.setItem('rapidofiche_access_token', result.accessToken);
    localStorage.setItem(ADMIN_OPEN_KEY, 'true');
    if (result.tokens?.refreshToken) {
      localStorage.setItem('rapidofiche_refresh_token', result.tokens.refreshToken);
    }
    setAdminUser(result.user);
    setIsAuthModalOpen(false);
    setIsManagerOpen(true);
  };

  const registerAdmin = async (data: AdminRegisterDto): Promise<void> => {
    const result = await adminAuthApi.register(data);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(result.user));
    localStorage.setItem(ADMIN_TOKEN_KEY, result.accessToken);
    localStorage.setItem('rapidofiche_access_token', result.accessToken);
    localStorage.setItem(ADMIN_OPEN_KEY, 'true');
    if (result.tokens?.refreshToken) {
      localStorage.setItem('rapidofiche_refresh_token', result.tokens.refreshToken);
    }
    setAdminUser(result.user);
    setIsAuthModalOpen(false);
    setIsManagerOpen(true);
  };

  const logoutAdmin = (): void => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_OPEN_KEY);
    localStorage.removeItem(ADMIN_TAB_KEY);
    localStorage.removeItem('rapidofiche_access_token');
    localStorage.removeItem('rapidofiche_refresh_token');
    setAdminUser(null);
    setIsManagerOpen(false);
    setIsAuthModalOpen(false);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openManager = () => {
    localStorage.setItem(ADMIN_OPEN_KEY, 'true');
    setIsManagerOpen(true);
  };
  const closeManager = () => {
    localStorage.setItem(ADMIN_OPEN_KEY, 'false');
    setIsManagerOpen(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdmin,
        isSuperAdmin,
        isAuthModalOpen,
        isManagerOpen,
        activeTab,
        openAuthModal,
        closeAuthModal,
        openManager,
        closeManager,
        setActiveTab,
        loginAdmin,
        registerAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth doit être utilisé au sein d’un AdminAuthProvider');
  }
  return context;
};

