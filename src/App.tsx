import React from 'react';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminAuthModal } from './components/admin/auth/AdminAuthModal';
import { AdminManagerOverlay } from './components/admin/AdminManagerOverlay';
import { AppRouter } from './routes/AppRouter';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <SubscriptionProvider>
            <AppRouter />
            {/* Portails d'Administration Furtive Globaux */}
            <AdminAuthModal />
            <AdminManagerOverlay />
          </SubscriptionProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;


