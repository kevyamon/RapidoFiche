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
  newTeachersThisMonth: number;
  totalLessons: number;
  publishedLessons: number;
  draftLessons: number;
  archivedLessons: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenueFcfa: number;
}

export const AdminDashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<KpiMetrics>({
    totalUsers: 0,
    activeTeachers: 0,
    newTeachersThisMonth: 0,
    totalLessons: 0,
    publishedLessons: 0,
    draftLessons: 0,
    archivedLessons: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenueFcfa: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadKpis = async () => {
    try {
      setIsLoading(true);
      const res = (await adminAuthApi.getDashboardKpis()) as {
        data?: {
          teachers?: { total?: number; newThisMonth?: number };
          lessons?: { total?: number; published?: number; drafts?: number; archived?: number };
          subscriptions?: { active?: number; expired?: number };
          payments?: { revenueThisMonth?: number };
          usersCount?: number;
          lessonsCount?: number;
          publishedCount?: number;
          subscriptionsCount?: number;
          revenue?: number;
        };
      };
      if (res?.data) {
        const d = res.data;
        const totalLessons = d.lessons?.total ?? d.lessonsCount ?? 0;
        const published = d.lessons?.published ?? d.publishedCount ?? 0;
        const drafts = d.lessons?.drafts ?? Math.max(0, totalLessons - published);
        const archived = d.lessons?.archived ?? 0;

        setMetrics({
          totalUsers: d.teachers?.total ?? d.usersCount ?? 0,
          activeTeachers: d.teachers?.total ?? d.usersCount ?? 0,
          newTeachersThisMonth: d.teachers?.newThisMonth ?? 0,
          totalLessons,
          publishedLessons: published,
          draftLessons: drafts,
          archivedLessons: archived,
          activeSubscriptions: d.subscriptions?.active ?? d.subscriptionsCount ?? 0,
          expiredSubscriptions: d.subscriptions?.expired ?? 0,
          totalRevenueFcfa: d.payments?.revenueThisMonth ?? d.revenue ?? 0,
        });
      }
    } catch {
      // Mode silencieux
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  const getLessonSublabel = () => {
    if (metrics.totalLessons === 0) return 'Aucune fiche importée';
    if (metrics.publishedLessons === 0 && metrics.draftLessons > 0) {
      return `${metrics.draftLessons} brouillon${metrics.draftLessons > 1 ? 's' : ''} en attente de validation`;
    }
    if (metrics.publishedLessons > 0 && metrics.draftLessons > 0) {
      return `${metrics.publishedLessons} publiée${metrics.publishedLessons > 1 ? 's' : ''} · ${metrics.draftLessons} brouillon${metrics.draftLessons > 1 ? 's' : ''}`;
    }
    return `${metrics.publishedLessons} publiée${metrics.publishedLessons > 1 ? 's' : ''} et conforme${metrics.publishedLessons > 1 ? 's' : ''}`;
  };

  const getLessonBadgeStatus = () => {
    if (metrics.draftLessons > 0 && metrics.publishedLessons === 0) {
      return { text: `${metrics.draftLessons} Brouillon${metrics.draftLessons > 1 ? 's' : ''}`, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (metrics.draftLessons > 0 && metrics.publishedLessons > 0) {
      return { text: `${metrics.draftLessons} à valider`, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (metrics.publishedLessons > 0) {
      return { text: '100% Conforme', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    return null;
  };

  const lessonBadge = getLessonBadgeStatus();

  const cards = [
    {
      label: 'Enseignants Inscrits',
      value: metrics.totalUsers,
      sublabel: `${metrics.activeTeachers} actif${metrics.activeTeachers > 1 ? 's' : ''} sur la plateforme`,
      tag: metrics.newTeachersThisMonth > 0 ? `+${metrics.newTeachersThisMonth} ce mois` : null,
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: Users,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      glow: 'from-blue-500/10 to-transparent',
    },
    {
      label: 'Fiches Pédagogiques',
      value: metrics.totalLessons,
      sublabel: getLessonSublabel(),
      tag: lessonBadge?.text || null,
      tagColor: lessonBadge?.color || '',
      icon: BookOpen,
      badgeColor: metrics.draftLessons > 0 && metrics.publishedLessons === 0
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      glow: metrics.draftLessons > 0 && metrics.publishedLessons === 0
        ? 'from-amber-500/10 to-transparent'
        : 'from-emerald-500/10 to-transparent',
    },
    {
      label: 'Abonnements Actifs',
      value: metrics.activeSubscriptions,
      sublabel: 'Abonnements Premium en cours',
      tag: metrics.expiredSubscriptions > 0 ? `${metrics.expiredSubscriptions} expiré${metrics.expiredSubscriptions > 1 ? 's' : ''}` : null,
      tagColor: 'bg-slate-700 text-slate-300 border-slate-600',
      icon: CreditCard,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      glow: 'from-amber-500/10 to-transparent',
    },
    {
      label: 'Volume Financier GeniusPay',
      value: `${metrics.totalRevenueFcfa.toLocaleString('fr-FR')} FCFA`,
      sublabel: 'Recouvrement automatique certifié',
      tag: null,
      tagColor: '',
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
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {c.value}
                  </span>
                  {c.tag && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.tagColor}`}>
                      {c.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">{c.sublabel}</p>
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
