import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, UploadCloud, Users, ArrowRight } from 'lucide-react';
import { AdminService, AdminKPIs } from '../../services/admin.service';
import { AdminStatsCards } from '../../components/admin/AdminStatsCards';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setIsLoading(true);
        const data = await AdminService.getKPIs();
        setKpis(data);
      } catch {
        // Ignorer
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-text-inverse flex items-center justify-center shadow-card">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
              Console d'Administration
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Supervision globale de RapidoFiche et indicateurs en temps réel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/import">
            <Button variant="primary" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
              Import Massif
            </Button>
          </Link>
          <Link to="/admin/utilisateurs">
            <Button variant="outline" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              Enseignants
            </Button>
          </Link>
        </div>
      </div>

      {/* Cartes d'Indicateurs */}
      <AdminStatsCards kpis={kpis} isLoading={isLoading} />

      {/* Raccourcis de Gestion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/import"
          className="p-5 rounded-2xl bg-background-card border border-border-default hover:border-primary-400 shadow-card hover:shadow-elevated transition-all group flex items-start justify-between"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-text-primary text-base group-hover:text-primary-600 transition-colors">
              Importer des Lots de Fiches
            </h3>
            <p className="text-xs text-text-muted">
              Déposez des archives ou des séries de fichiers PDF pour les insérer automatiquement.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/utilisateurs"
          className="p-5 rounded-2xl bg-background-card border border-border-default hover:border-primary-400 shadow-card hover:shadow-elevated transition-all group flex items-start justify-between"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-text-primary text-base group-hover:text-secondary-600 transition-colors">
              Gestion des Utilisateurs
            </h3>
            <p className="text-xs text-text-muted">
              Consultez les comptes enseignants, modifiez les classes et gérez les accès.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-secondary-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
