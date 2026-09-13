import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Bookmark, HardDriveDownload, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/fiches', label: 'Fiches', icon: BookOpen },
    { to: '/favoris', label: 'Favoris', icon: Bookmark },
    { to: '/hors-ligne', label: 'Hors-Ligne', icon: HardDriveDownload },
    { to: '/profil', label: 'Profil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background-card/95 backdrop-blur-md border-t border-border-default shadow-elevated pb-safe">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors select-none ${
                isActive
                  ? 'text-primary-600 font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <div
                    className={`relative p-1 rounded-xl transition-all ${
                      isActive ? 'bg-primary-50' : 'bg-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] leading-none tracking-tight">
                    {item.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
