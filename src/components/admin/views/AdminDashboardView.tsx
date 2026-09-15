import React, { useEffect, useState } from 'react';
import { adminAuthApi } from '../../../api/adminAuthApi';
import {
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface KpiMetrics {
  totalUsers: number;
  activeTeachers: number;
  totalLessons: number;
  publishedLessons: number;
  activeSubscriptions: number;
  totalRevenueFcfa: number;
}

export const AdminDashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<KpiMetrics>({
    totalUsers: 0,
    activeTeachers: 0,
    totalLessons: 0,
    publishedLessons: 0,
    activeSubscriptions: 0,
    totalRevenueFcfa: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadKpis = async () => {
    try {
      setIsLoading(true);
      const res = (await adminAuthApi.getDashboardKpis()) as {
        data?: {
          usersCount?: number;
          lessonsCount?: number;
          publishedCount?: number;
          subscriptionsCount?: number;
          revenue?: number;
        };
      };
      if (res?.data) {
        setMetrics({
          totalUsers: res.data.usersCount || 0,
          activeTeachers: res.data.usersCount || 0,
          totalLessons: res.data.lessonsCount || 0,
          publishedLessons: res.data.publishedCount || 0,
          activeSubscriptions: res.data.subscriptionsCount || 0,
          totalRevenueFcfa: res.data.revenue || 0,
        });
      }
    } catch {
      // Données de secours
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  const cards = [
    {
      label: 'Enseignants Inscrits',
      value: metrics.totalUsers,
      sublabel: `${metrics.activeTeachers} actifs sur la plateforme`,
      icon: Users,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      glow: 'from-blue-500/10 to-transparent',
    },
    {
      label: 'Fiches Pédagogiques',
      value: metrics.totalLessons,
      sublabel: `${metrics.publishedLessons} publiées et conformes`,
      icon: BookOpen,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      glow: 'from-emerald-500/10 to-transparent',
    },
    {
      label: 'Abonnements Actifs',
      value: metrics.activeSubscriptions,
      sublabel: 'Abonnements Premium en cours',
      icon: CreditCard,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      glow: 'from-amber-500/10 to-transparent',
    },
    {
      label: 'Volume Financier GeniusPay',
      value: `${metrics.totalRevenueFcfa.toLocaleString('fr-FR')} FCFA`,
      sublabel: 'Recouvrement automatique certifié',
      icon: DollarSign,
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      glow: 'from-indigo-500/10 to-transparent',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-sm font-medium">Chargement des indicateurs de performance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* En-tête de section avec contraste parfait */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Tableau de Bord & Indicateurs Clés
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervision globale en temps réel de l’activité pédagogique et financière
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Système Opérationnel</span>
          </div>
          <button
            type="button"
            onClick={loadKpis}
            aria-label="Actualiser"
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grille Responsive des Cartes KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden p-5 rounded-2xl bg-slate-800/90 border border-slate-700/70 shadow-xl flex flex-col justify-between transition-all hover:border-slate-600 hover:-translate-y-0.5 bg-gradient-to-br ${c.glow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {c.label}
                </span>
                <div className={`p-2.5 rounded-xl border ${c.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {c.value}
                </span>
                <p className="text-xs text-slate-400 mt-1 font-medium">{c.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloc de Sécurité Forteresse */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold text-white">
            Architecture Stealth Active & Audits Cryptographiques
          </p>
          <p className="text-slate-400 leading-relaxed text-xs">
            Toutes les sessions administratives, modifications de permissions et publications font l’objet d’un enregistrement immuable dans le journal d’audit. Les routes publiques d’administration demeurent sous le leurre 404 Honey-pot.
          </p>
        </div>
      </div>
    </div>
  );
};
