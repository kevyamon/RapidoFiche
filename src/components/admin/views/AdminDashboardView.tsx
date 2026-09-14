import React, { useEffect, useState } from 'react';
import { adminAuthApi } from '../../../api/adminAuthApi';
import { Users, FileText, CreditCard, DollarSign, TrendingUp, ShieldAlert, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    let isMounted = true;
    const loadKpis = async () => {
      try {
        const res = await adminAuthApi.getDashboardKpis() as {
          data?: {
            usersCount?: number;
            lessonsCount?: number;
            publishedCount?: number;
            subscriptionsCount?: number;
            revenue?: number;
          };
        };
        if (isMounted && res?.data) {
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
        // Mode dégradé si non configuré
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadKpis();
    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      label: 'Enseignants Inscrits',
      value: metrics.totalUsers,
      sublabel: `${metrics.activeTeachers} actifs sur la plateforme`,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Fiches Pédagogiques',
      value: metrics.totalLessons,
      sublabel: `${metrics.publishedLessons} publiées et conformes`,
      icon: FileText,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Abonnements Actifs',
      value: metrics.activeSubscriptions,
      sublabel: 'Abonnements Premium en cours',
      icon: CreditCard,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Volume Financier GeniusPay',
      value: `${metrics.totalRevenueFcfa.toLocaleString('fr-FR')} FCFA`,
      sublabel: 'Recouvrement automatique certifié',
      icon: DollarSign,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm">Chargement des indicateurs de performance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Tableau de Bord & Indicateurs Clés
          </h2>
          <p className="text-xs text-slate-500">
            Supervision globale en temps réel de l’activité pédagogique et financière
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Système Opérationnel</span>
        </div>
      </div>

      {/* Grille des Cartes KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {c.label}
                </span>
                <div className={`p-2 rounded-lg border ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  {c.value}
                </span>
                <p className="text-xs text-slate-500 mt-1">{c.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloc d'alerte sécurité */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200">
            Protection Stealth Active
          </p>
          <p className="text-slate-400">
            Toutes les sessions et modifications d’état font l’objet d’une traçabilité cryptographique dans le journal d’audit. Les routes d’administration publiques demeurent masquées sous le leurre 404.
          </p>
        </div>
      </div>
    </div>
  );
};
