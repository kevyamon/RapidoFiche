import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { LessonsPage } from '../pages/LessonsPage';
import { LessonDetailPage } from '../pages/LessonDetailPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { OfflineLessonsPage } from '../pages/OfflineLessonsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-main">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
        <p className="text-xs text-text-muted font-medium">Chargement de votre session...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <HomePage />
      </AppLayout>
    );
  }

  return <LandingPage />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Racine Dynamique (Landing Page pour visiteurs / Dashboard pour enseignants connectés) */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/accueil" element={<LandingPage />} />

        {/* Routes Publiques d'Authentification */}
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />

        {/* Leurre Furtif Public (Honey-pot 404) */}
        <Route path="/admin" element={<NotFoundPage />} />
        <Route path="/admin/*" element={<NotFoundPage />} />
        <Route path="/dashboard" element={<NotFoundPage />} />
        <Route path="/dashboard/*" element={<NotFoundPage />} />

        {/* Routes Protégées Enseignants (avec AppLayout) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/tableau-de-bord" element={<HomePage />} />
          <Route path="/fiches" element={<LessonsPage />} />
          <Route path="/fiches/:id" element={<LessonDetailPage />} />
          <Route path="/favoris" element={<FavoritesPage />} />
          <Route path="/hors-ligne" element={<OfflineLessonsPage />} />
          <Route path="/profil" element={<ProfilePage />} />
        </Route>

        {/* Page 404 & Redirection par défaut */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
