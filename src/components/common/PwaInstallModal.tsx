import React from 'react';
import { Download, X, Smartphone, Zap, WifiOff, Share, PlusSquare, ShieldCheck } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export const PwaInstallModal: React.FC = () => {
  const { isModalOpen, closeModal, promptInstall, isIos, isInstalled } = usePwaInstall();

  useBodyScrollLock(isModalOpen);

  if (!isModalOpen || isInstalled) return null;

  const handleInstallClick = async () => {
    if (isIos) {
      // Sur iOS, les instructions sont affichées dans la modale
      return;
    }
    await promptInstall();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-left"
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-background-card rounded-2xl sm:rounded-3xl border border-border-default shadow-elevated overflow-hidden animate-scale-up">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={() => closeModal(true)}
          aria-label="Fermer"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-background-surface transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Corps de la Modale */}
        <div className="p-5 sm:p-6 text-center">
          {/* Logo & Badge */}
          <div className="relative inline-block mb-3.5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-50 border border-primary-200 p-2 shadow-card mx-auto flex items-center justify-center">
              <img
                src="/logo.png"
                alt="RapidoFiche"
                className="w-full h-full object-cover rounded-xl pointer-events-none select-none"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary-600 text-white border-2 border-background-card shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2
            id="pwa-install-title"
            className="text-lg sm:text-xl font-bold text-text-primary tracking-tight"
          >
            Installer l'application
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-xs mx-auto">
            Ajoutez RapidoFiche sur votre téléphone pour un accès direct et rapide à vos préparations de cours.
          </p>

          {/* Avantages Clés */}
          <div className="my-4 p-3 sm:p-3.5 rounded-xl bg-background-surface border border-border-subtle text-left space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-text-secondary">
              <div className="p-1 rounded-lg bg-primary-100 text-primary-700 shrink-0 mt-0.5">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="leading-tight">
                <strong className="text-text-primary">1 clic sur l'écran d'accueil :</strong> Accès direct comme une application native.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-text-secondary">
              <div className="p-1 rounded-lg bg-secondary-100 text-secondary-700 shrink-0 mt-0.5">
                <WifiOff className="w-3.5 h-3.5" />
              </div>
              <span className="leading-tight">
                <strong className="text-text-primary">Mode Hors-Ligne :</strong> Vos fiches restent accessibles partout, sans consommer de données.
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-text-secondary">
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="leading-tight">
                <strong className="text-text-primary">Ultra-légère :</strong> Moins de 2 Mo, n'encombre pas la mémoire de votre téléphone.
              </span>
            </div>
          </div>

          {/* Instructions spécifiques iOS */}
          {isIos ? (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-left text-xs text-blue-900 space-y-1.5">
              <p className="font-semibold text-blue-950 flex items-center gap-1.5">
                <span>Pour installer sur iPhone / iPad :</span>
              </p>
              <div className="flex items-center gap-2 text-[11px] text-blue-800">
                <span>1. Appuyez sur le bouton Partager</span>
                <Share className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-blue-800">
                <span>2. Sélectionnez</span>
                <span className="font-semibold inline-flex items-center gap-1">
                  « Sur l'écran d'accueil »
                  <PlusSquare className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                </span>
              </div>
            </div>
          ) : null}

          {/* Boutons d'Action */}
          <div className="space-y-2 pt-1">
            {!isIos ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-700 text-text-inverse shadow-subtle hover:shadow-card transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger l'application</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => closeModal(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-background-surface transition-colors"
            >
              {isIos ? 'Compris, fermer' : 'Télécharger plus tard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
