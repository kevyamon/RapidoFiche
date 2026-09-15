import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Bookmark,
  HardDriveDownload,
  CreditCard,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { StealthLogoTrigger } from '../common/StealthLogoTrigger';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { subscription, openPayModal } = useSubscription();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const levelLabel =
    typeof user?.primaryLevelId === 'object'
      ? user.primaryLevelId.label
        ? `${user.primaryLevelId.label} (${user.primaryLevelId.code})`
        : user.primaryLevelId.code
      : user?.primaryLevelId || 'Enseignant';

  const isSubActive = subscription?.status === 'ACTIVE';

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  const navLinks = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/fiches', label: 'Fiches Pédagogiques', icon: BookOpen },
    { to: '/favoris', label: 'Favoris', icon: Bookmark },
    { to: '/hors-ligne', label: 'Espace Hors-Ligne', icon: HardDriveDownload },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background-card/95 backdrop-blur-md border-b border-border-default shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 1. Logo Furtif & Marque RapidoFiche */}
        <div className="flex items-center gap-2.5 shrink-0">
          <StealthLogoTrigger
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
            imageClassName="w-full h-full rounded-xl object-cover shadow-card"
          />
          <Link to="/" className="flex flex-col focus:outline-none">
            <span className="font-bold text-base sm:text-lg text-primary-900 tracking-tight leading-tight">
              Rapido<span className="text-secondary-600">Fiche</span>
            </span>
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
              Bibliothèque Pédagogique
            </span>
          </Link>
        </div>

        {/* 2. Barre de Navigation Principale pour Ordinateur / PC (Masquée sur Mobile) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200/60 shadow-subtle'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-surface'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {/* 3. Espace Utilisateur & Statut sur Ordinateur / PC */}
        {user && (
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Niveau Enseigné Épuré */}
            <div className="flex flex-col text-right pr-3 border-r border-border-default">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                Niveau Enseigné
              </span>
              <span className="text-xs font-bold text-primary-700 truncate max-w-[140px]">
                {levelLabel}
              </span>
            </div>

            {/* Bouton ou Statut d'Abonnement */}
            {isSubActive ? (
              <span className="text-xs font-semibold text-status-success-text flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-success-badge animate-pulse" />
                <span>Actif ({subscription?.daysRemaining}j)</span>
              </span>
            ) : (
              <button
                onClick={openPayModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary-600 hover:bg-secondary-700 text-text-inverse shadow-subtle transition-all active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Activer (200 F)</span>
              </button>
            )}

            {/* Menu Utilisateur Ordinateur */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-background-surface transition-colors focus:outline-none"
                aria-label="Menu du compte"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profil"
                    className="w-8 h-8 rounded-full object-cover border border-primary-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-semibold text-xs flex items-center justify-center border border-primary-200">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

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

