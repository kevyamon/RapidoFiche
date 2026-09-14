import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAuthApi, AdminUser, AdminLoginDto, AdminRegisterDto } from '../api/adminAuthApi';

export type AdminTab = 'dashboard' | 'lessons' | 'import' | 'users' | 'audit';

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
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const isAdmin = !!adminUser && (adminUser.role === 'ADMIN' || adminUser.role === 'SUPER_ADMIN');
  const isSuperAdmin = !!adminUser && adminUser.role === 'SUPER_ADMIN';

  const handleOpenStealth = useCallback(() => {
    const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (savedToken && adminUser) {
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

  const loginAdmin = async (data: AdminLoginDto): Promise<void> => {
    const result = await adminAuthApi.login(data);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(result.user));
    localStorage.setItem(ADMIN_TOKEN_KEY, result.accessToken);
    localStorage.setItem('rapidofiche_access_token', result.accessToken);
    setAdminUser(result.user);
    setIsAuthModalOpen(false);
    setIsManagerOpen(true);
  };

  const registerAdmin = async (data: AdminRegisterDto): Promise<void> => {
    const result = await adminAuthApi.register(data);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(result.user));
    localStorage.setItem(ADMIN_TOKEN_KEY, result.accessToken);
    localStorage.setItem('rapidofiche_access_token', result.accessToken);
    setAdminUser(result.user);
    setIsAuthModalOpen(false);
    setIsManagerOpen(true);
  };

  const logoutAdmin = (): void => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminUser(null);
    setIsManagerOpen(false);
    setIsAuthModalOpen(false);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openManager = () => setIsManagerOpen(true);
  const closeManager = () => setIsManagerOpen(false);

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
