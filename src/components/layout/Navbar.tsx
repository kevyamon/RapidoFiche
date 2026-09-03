import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { subscription, openPayModal } = useSubscription();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const levelLabel =
    typeof user?.primaryLevelId === 'object'
      ? user.primaryLevelId.code
      : 'Enseignant';

  const isSubActive = subscription?.status === 'ACTIVE';

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  return (
    <header className="sticky top-0 z-40 bg-background-card/95 backdrop-blur-md border-b border-border-default shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Marque */}
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none">
          <img
            src="/logo.png"
            alt="Logo RapidoFiche"
            className="w-10 h-10 rounded-xl object-cover shadow-card shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-primary-900 tracking-tight leading-tight">
              Rapido<span className="text-secondary-600">Fiche</span>
            </span>
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
              Bibliothèque Pédagogique
            </span>
          </div>
        </Link>

        {/* Espace Central / Indicateurs Enseignant */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Badge Niveau */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
              Classe : {levelLabel}
            </span>

            {/* Badge Abonnement */}
            {isSubActive ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-subscription-activeBg text-subscription-activeText border border-subscription-activeBorder">
                <span className="w-2 h-2 rounded-full bg-status-success-badge animate-pulse" />
                Abonnement Actif ({subscription?.daysRemaining}j)
              </span>
            ) : (
              <button
                onClick={openPayModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-secondary-600 hover:bg-secondary-700 text-text-inverse shadow-subtle transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Activer (200 F)</span>
              </button>
            )}

            {/* Menu Utilisateur */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background-surface transition-colors focus:outline-none"
                aria-label="Menu du compte"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-semibold text-xs flex items-center justify-center border border-primary-200">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
              </button>

              {/* Menu Déroulant */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-background-card rounded-xl shadow-elevated border border-border-default py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-border-subtle bg-background-main/50">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-background-surface transition-colors"
                    >
                      <Shield className="w-4 h-4 text-primary-600" />
                      <span>Console d'Administration</span>
                    </Link>
                  )}

                  <Link
                    to="/profil"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-background-surface transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-text-muted" />
                    <span>Mon Profil & Abonnement</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-status-danger-badge hover:bg-status-danger-bg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
