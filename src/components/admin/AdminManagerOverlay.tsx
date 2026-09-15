import React from 'react';
import { useAdminAuth, AdminTab } from '../../context/AdminAuthContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminLessonsView } from './views/AdminLessonsView';
import { AdminImportView } from './views/AdminImportView';
import { AdminUsersView } from './views/AdminUsersView';
import { AdminAuditLogsView } from './views/AdminAuditLogsView';
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
    { id: 'lessons', label: 'Fiches', icon: BookOpen },
    { id: 'import', label: 'Importation', icon: UploadCloud },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'audit', label: 'Audit & Sécurité', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-slate-950 text-slate-100 overflow-hidden animate-fade-in font-sans">
      {/* Barre Supérieure Responsive Mobile/Desktop */}
      <header className="px-3 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
        {/* Identité Cockpit & Utilisateur */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">
                Cockpit Furtif
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                  isSuperAdmin
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}
              >
                {isSuperAdmin && <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                {adminUser.role}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {adminUser.firstName} {adminUser.lastName} ({adminUser.email})
            </p>
          </div>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={closeManager}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Réduire sans déconnecter"
            aria-label="Réduire"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Réduire</span>
          </button>
          <button
            type="button"
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-800/60 hover:bg-red-900/80 text-xs font-semibold text-red-200 transition-colors"
            title="Déconnexion administrative"
            aria-label="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Barre de Navigation des Onglets (Scroll Horizontal Fluide Mobile) */}
      <nav className="px-2 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex gap-1 overflow-x-auto shrink-0 scrollbar-none py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone de Contenu Déroulante avec Padding Adaptatif */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-slate-900/40">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <AdminDashboardView />}
          {activeTab === 'lessons' && <AdminLessonsView />}
          {activeTab === 'import' && <AdminImportView />}
          {activeTab === 'users' && <AdminUsersView />}
          {activeTab === 'audit' && <AdminAuditLogsView />}
        </div>
      </main>
    </div>
  );
};
