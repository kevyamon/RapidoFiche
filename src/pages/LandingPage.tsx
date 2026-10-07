import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  WifiOff,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  FileCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StealthLogoTrigger } from '../components/common/StealthLogoTrigger';
import { useSeo } from '../hooks/useSeo';

export const LandingPage: React.FC = () => {
  useSeo({
    title: 'RapidoFiche — Fiches Pédagogiques Officielles du Primaire (CP1 au CM2)',
    description:
      'La plateforme numérique de référence pour les enseignants du primaire en Côte d’Ivoire. Téléchargez vos fiches de cours officielles conformes aux programmes MENA.',
    canonicalPath: '/',
  });

  const navigate = useNavigate();

  const features = [
    {
      icon: FileCheck,
      title: 'Conformité aux Programmes MENA',
      description:
        'Fiches pédagogiques complètes et standardisées pour chaque niveau du primaire (CP1, CP2, CE1, CE2, CM1, CM2), structurées par semaine et par trimestre.',
    },
    {
      icon: Clock,
      title: 'Gain de Temps Précieux',
      description:
        'Plus besoin de rédiger manuellement chaque fiche de cours. Préparez vos leçons en quelques clics et consacrez plus de temps à la réussite de vos élèves.',
    },
    {
      icon: WifiOff,
      title: 'Consultation Hors-Ligne',
      description:
        'Sauvegardez vos fiches pédagogiques directement sur votre téléphone pour les utiliser en classe, même en zone à faible couverture réseau.',
    },
    {
      icon: ShieldCheck,
      title: 'Tarif Solidaire & Transparent',
      description:
        'Un forfait unique de 200 FCFA par mois, sans engagement et payable simplement par Mobile Money, pour un accès illimité à toutes les matières de votre classe.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Créez votre compte',
      description: 'Renseignez vos coordonnées et choisissez votre niveau de classe enseigné.',
    },
    {
      number: '02',
      title: 'Activez votre accès (200 FCFA)',
      description: 'Débloquez l’accès illimité pour un mois via votre moyen de paiement habituel.',
    },
    {
      number: '03',
      title: 'Préparez vos cours sereinement',
      description: 'Consultez, enregistrez et utilisez vos fiches de cours chaque semaine.',
    },
  ];

  return (
    <div className="min-h-screen bg-background-main flex flex-col selection:bg-primary-500 selection:text-white">
      {/* 1. En-tête Public de Navigation */}
      <header className="sticky top-0 z-40 bg-background-card/95 backdrop-blur-md border-b border-border-default shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StealthLogoTrigger
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
              imageClassName="w-full h-full rounded-xl object-cover shadow-card"
            />
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-primary-900 tracking-tight leading-tight">
                Rapido<span className="text-secondary-600">Fiche</span>
              </span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                Primaire Officiel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/connexion"
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-background-surface transition-colors"
            >
              Se connecter
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/inscription')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              S’inscrire
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Section Hero Principale */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6">
            <GraduationCap className="w-4 h-4" />
            <span>Enseignement Primaire • CP1 au CM2</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Toutes vos fiches pédagogiques officielles en un clin d’œil
          </h1>

          <p className="mt-5 text-sm sm:text-base lg:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            RapidoFiche met à disposition des instituteurs et institutrices de Côte d’Ivoire l’ensemble des fiches de cours prêtes à l’emploi, rigoureusement conformes au programme national MENA.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => navigate('/inscription')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base shadow-elevated transition-all active:scale-95"
            >
              <span>Créer mon compte enseignant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/connexion"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border-default bg-background-card hover:bg-background-surface text-text-primary font-semibold text-xs sm:text-sm transition-colors"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success-badge" />
              <span>Conforme aux curricula MENA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success-badge" />
              <span>Disponible hors connexion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success-badge" />
              <span>Accès illimité à 200 FCFA / mois</span>
            </div>
          </div>
        </section>

        {/* 3. Section Avantages & Piliers */}
        <section className="py-14 sm:py-20 bg-background-card border-y border-border-default">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Pourquoi choisir RapidoFiche ?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-text-muted">
                Un outil conçu sur le terrain pour répondre aux exigences réelles de la classe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="p-5 sm:p-6 rounded-2xl bg-background-main border border-border-default hover:border-primary-300 transition-all flex flex-col justify-between shadow-subtle group"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Section 3 Étapes Simples */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Comment démarrer ?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-text-muted">
              Trois étapes simples pour préparer vos cours en toute sérénité.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-background-card border border-border-default relative shadow-subtle"
              >
                <span className="text-3xl font-extrabold text-primary-200 block mb-2">
                  {step.number}
                </span>
                <h3 className="text-base font-bold text-text-primary mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bouton d'Action Central */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => navigate('/inscription')}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base shadow-elevated transition-all active:scale-95"
            >
              <span>Commencer maintenant (Inscription rapide)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* 5. Pied de Page avec Copyright et Mentions Légales */}
      <footer className="bg-background-card border-t border-border-default py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-600" />
            <span>RapidoFiche — La bibliothèque numérique des enseignants du primaire.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/connexion" className="hover:text-text-primary transition-colors">
              Espace Connexion
            </Link>
            <span>•</span>
            <Link to="/inscription" className="hover:text-text-primary transition-colors">
              Créer un Compte
            </Link>
          </div>

          <p className="text-[11px] text-text-disabled text-center sm:text-right">
            © 2026 RapidoFiche. Tous droits réservés. Développé pour les enseignants du primaire.
          </p>
        </div>
      </footer>
    </div>
  );
};
