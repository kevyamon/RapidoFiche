import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { LessonsPage } from '../pages/LessonsPage';
import { LessonDetailPage } from '../pages/LessonDetailPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { OfflineLessonsPage } from '../pages/OfflineLessonsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Publiques d'Authentification */}
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />

        {/* Routes Protégées Enseignants (avec AppLayout) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/fiches" element={<LessonsPage />} />
          <Route path="/fiches/:id" element={<LessonDetailPage />} />
          <Route path="/favoris" element={<FavoritesPage />} />
          <Route path="/hors-ligne" element={<OfflineLessonsPage />} />
          <Route path="/profil" element={<ProfilePage />} />

          {/* Leurre Furtif (Honey-pot 404) pour toute tentative d'accès direct */}
          <Route path="/admin" element={<NotFoundPage />} />
          <Route path="/admin/*" element={<NotFoundPage />} />
          <Route path="/dashboard" element={<NotFoundPage />} />
          <Route path="/dashboard/*" element={<NotFoundPage />} />
        </Route>

        {/* Page 404 & Redirection par défaut */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

