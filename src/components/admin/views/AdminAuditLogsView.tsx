import React, { useEffect, useState } from 'react';
import { adminAuthApi } from '../../../api/adminAuthApi';
import { ShieldCheck, Loader2, RefreshCw, Clock } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorId?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (p = 1) => {
    setIsLoading(true);
    try {
      const res = (await adminAuthApi.getAuditLogs(p, 15)) as {
        data?: AuditLogEntry[];
        pagination?: { totalPages: number };
      };
      if (res?.data) {
        setLogs(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch {
      // Ignorer
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ADMIN_REGISTERED':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'ADMIN_LOGIN':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'USER_SUSPENDED':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      case 'USER_REACTIVATED':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'LESSON_PUBLISHED':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span>Journal d’Audit & Sécurité</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Traçabilité certifiée et immuable de toutes les opérations administratives
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mb-2" />
          <span className="text-xs font-medium">Chargement du journal d’audit...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-slate-800/90 rounded-2xl border border-slate-700">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-500" />
          <p className="text-xs">Aucune action enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Auteur</th>
                  <th className="py-3 px-4">Entité Ciblée</th>
                  <th className="py-3 px-4">Métadonnées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {log.actorId?.email || 'Système'}
                      {log.actorId?.role && (
                        <span className="block text-[10px] font-normal text-slate-400">
                          {log.actorId.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.entityType} {log.entityId ? `(#${log.entityId.slice(-6)})` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-slate-700 bg-slate-900/80 text-xs text-slate-300">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700"
              >
                Précédent
              </button>
              <span>
                Page {page} sur {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
