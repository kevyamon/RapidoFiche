import React from 'react';
import { useAdminAuth, AdminTab } from '../../context/AdminAuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
import { AdminLessonsPage } from '../../pages/admin/AdminLessonsPage';
import { AdminImportPage } from '../../pages/admin/AdminImportPage';
import { AdminUsersPage } from '../../pages/admin/AdminUsersPage';
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Users,
  ShieldCheck,
  LogOut,
  Minimize2,
  Crown,
} from 'lucide-react';

export const AdminManagerOverlay: React.FC = () => {
  const {
    isManagerOpen,
    closeManager,
    logoutAdmin,
    adminUser,
    isSuperAdmin,
    activeTab,
    setActiveTab,
  } = useAdminAuth();

  useBodyScrollLock(isManagerOpen);

  if (!isManagerOpen || !adminUser) return null;

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'lessons', label: 'Fiches Pédagogiques', icon: BookOpen },
    { id: 'import', label: 'Importation Massive', icon: UploadCloud },
    { id: 'users', label: 'Utilisateurs & Enseignants', icon: Users },
    { id: 'audit', label: 'Journal d’Audit', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-slate-900/95 backdrop-blur-md text-slate-100 overflow-hidden animate-fade-in">
      {/* Barre Supérieure du Cockpit */}
      <header className="h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                Cockpit Furtif RapidoFiche
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isSuperAdmin
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}
              >
                {isSuperAdmin && <Crown className="w-3 h-3 text-amber-400" />}
                {adminUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
              {adminUser.firstName} {adminUser.lastName} ({adminUser.email})
            </p>
          </div>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={closeManager}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            title="Réduire sans déconnecter"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réduire</span>
          </button>
          <button
            type="button"
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 hover:bg-red-900/80 text-xs font-medium text-red-200 transition-colors"
            title="Déconnexion staff"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Barre de Navigation des Onglets */}
      <nav className="px-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 flex gap-1 overflow-x-auto shrink-0 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone de Contenu Déroulante */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <AdminDashboardView />}
          {activeTab === 'lessons' && <AdminLessonsPage />}
          {activeTab === 'import' && <AdminImportPage />}
          {activeTab === 'users' && <AdminUsersPage />}
          {activeTab === 'audit' && <AdminAuditLogsView />}
        </div>
      </main>
    </div>
  );
};
