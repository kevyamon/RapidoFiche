import React from 'react';
import { ShieldAlert, ShieldCheck, GraduationCap, Loader2 } from 'lucide-react';
import { AdminUserItem } from '../../../services/admin.service';

interface AdminUserRowProps {
  user: AdminUserItem;
  actionUserId: string | null;
  onOpenLevelModal: (user: AdminUserItem) => void;
  onToggleStatus: (user: AdminUserItem) => void;
}

const getRoleMeta = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return { label: 'Administrateur', style: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
    case 'CONTENT_MANAGER':
      return { label: 'Gestionnaire Contenu', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    case 'TEACHER':
    default:
      return { label: 'Enseignant', style: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
  }
};

export const AdminUserRow: React.FC<AdminUserRowProps> = ({
  user: u,
  actionUserId,
  onOpenLevelModal,
  onToggleStatus,
}) => {
  const userId = u.id || (u as any)._id;
  const isActionLoading = actionUserId === userId;
  const roleMeta = getRoleMeta(u.role);
  const sub = u.subscription;

  const renderSubscriptionBadge = () => {
    if (!sub || sub.status === 'NONE') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
          Aucun
        </span>
      );
    }
    if (sub.status === 'ACTIVE') {
      const days = sub.daysRemaining ?? 0;
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
          title={sub.endDate ? `Expire le ${new Date(sub.endDate).toLocaleDateString('fr-FR')}` : undefined}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Actif ({days} {days === 1 ? 'jour' : 'jours'})</span>
        </span>
      );
    }
    if (sub.status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          Expiré
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
        {sub.status}
      </span>
    );
  };

  return (
    <tr className="hover:bg-slate-700/40 transition-colors">
      <td className="p-4">
        <p className="font-semibold text-white">{u.firstName} {u.lastName}</p>
        <p className="text-xs text-slate-400">{u.email}</p>
        {u.phone && <p className="text-[11px] text-slate-500">{u.phone}</p>}
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${roleMeta.style}`}>
          {roleMeta.label}
        </span>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
          {u.primaryLevelId?.code || 'Non assigné'}
        </span>
      </td>
      <td className="p-4 whitespace-nowrap">
        {renderSubscriptionBadge()}
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            u.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-300 border border-red-500/30'
          }`}
        >
          {u.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
        </span>
      </td>
      <td className="p-4 text-right space-x-2 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onOpenLevelModal(u)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Classe</span>
        </button>
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => onToggleStatus(u)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
            u.status === 'ACTIVE'
              ? 'bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/80'
              : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/80'
          }`}
        >
          {isActionLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : u.status === 'ACTIVE' ? (
            <ShieldAlert className="w-3.5 h-3.5" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" />
          )}
          <span>{u.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}</span>
        </button>
      </td>
    </tr>
  );
};
