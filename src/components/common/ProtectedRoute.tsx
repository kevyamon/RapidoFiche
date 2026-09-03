import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'ADMIN' | 'CONTENT_MANAGER' | 'TEACHER';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-main">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
        <p className="text-xs text-text-muted font-medium">Chargement de votre session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};
