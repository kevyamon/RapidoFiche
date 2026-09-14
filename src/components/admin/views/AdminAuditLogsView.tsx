import React, { useEffect, useState } from 'react';
import { adminAuthApi } from '../../../api/adminAuthApi';
import { Shield, Loader2, RefreshCw, Clock } from 'lucide-react';

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
      const res = await adminAuthApi.getAuditLogs(p, 15) as {
        data?: AuditLogEntry[];
        pagination?: { totalPages: number };
      };
      if (res?.data) {
        setLogs(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch {
      // Ignorer ou gérer dégradé
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
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ADMIN_LOGIN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'USER_SUSPENDED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'USER_REACTIVATED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LESSON_PUBLISHED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Journal d’Audit & Sécurité
          </h2>
          <p className="text-xs text-slate-500">
            Historique certifié et immuable de toutes les opérations administratives
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
          <span className="text-xs">Chargement du journal d’audit...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-xs">Aucune action enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Auteur</th>
                  <th className="py-3 px-4">Entité / Cible</th>
                  <th className="py-3 px-4">Métadonnées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border font-medium ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {log.actorId?.email || 'Système'}
                      {log.actorId?.role && (
                        <span className="block text-[10px] text-slate-400">
                          {log.actorId.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
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
            <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50 text-xs">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-slate-600">
                Page {page} sur {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-white border border-slate-300 disabled:opacity-40"
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
