import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import { AdminLoginForm } from './AdminLoginForm';
import { AdminRegisterForm } from './AdminRegisterForm';
import { ShieldCheck, X } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useAdminAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  useBodyScrollLock(isAuthModalOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête Furtif */}
        <div className="px-6 pt-6 pb-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Administration Sécurisée
              </h2>
              <p className="text-xs text-slate-400">
                Portail de supervision & pilotage RapidoFiche
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Fermer la fenêtre"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bascule Onglets */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors border-b-2 ${
              tab === 'login'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Connexion Staff
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center transition-colors border-b-2 ${
              tab === 'register'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Inscription Staff
          </button>
        </div>

        {/* Corps de Formulaire */}
        <div className="p-6">
          {tab === 'login' ? <AdminLoginForm /> : <AdminRegisterForm />}
        </div>
      </div>
    </div>
  );
};
