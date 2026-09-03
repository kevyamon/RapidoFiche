import React from 'react';
import { DollarSign, Users, BookOpen, CheckCircle2 } from 'lucide-react';
import { AdminKPIs } from '../../services/admin.service';

export interface AdminStatsCardsProps {
  kpis: AdminKPIs | null;
  isLoading: boolean;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ kpis, isLoading }) => {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-background-card p-5 rounded-2xl border border-border-default shadow-card animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Revenus Collectés',
      value: `${kpis.totalRevenueXOF.toLocaleString('fr-FR')} FCFA`,
      subtitle: 'Passerelle GeniusPay',
      icon: DollarSign,
      color: 'text-status-success-badge',
      bg: 'bg-status-success-bg',
    },
    {
      title: 'Abonnements Actifs',
      value: kpis.activeSubscriptions.toString(),
      subtitle: 'Forfait 200 FCFA / mois',
      icon: CheckCircle2,
      color: 'text-secondary-600',
      bg: 'bg-secondary-50',
    },
    {
      title: 'Enseignants Inscrits',
      value: kpis.totalTeachers.toString(),
      subtitle: 'Comptes enseignants actifs',
      icon: Users,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      title: 'Fiches Pédagogiques',
      value: `${kpis.publishedLessons} / ${kpis.totalLessons}`,
      subtitle: `${kpis.totalViews} consultations`,
      icon: BookOpen,
      color: 'text-primary-700',
      bg: 'bg-primary-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-background-card p-5 rounded-2xl border border-border-default shadow-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-text-muted">{c.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-text-primary mt-1 tracking-tight">
                {c.value}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">{c.subtitle}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
