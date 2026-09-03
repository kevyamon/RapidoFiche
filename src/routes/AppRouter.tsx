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
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminLessonsPage } from '../pages/admin/AdminLessonsPage';
import { AdminImportPage } from '../pages/admin/AdminImportPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';

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

          {/* Routes Protégées Administration */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fiches"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLessonsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/import"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminImportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/utilisateurs"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
