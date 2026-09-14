import React from 'react';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AppRouter } from './routes/AppRouter';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <SubscriptionProvider>
            <AppRouter />
          </SubscriptionProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

