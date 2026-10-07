import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, ShieldAlert, GraduationCap, Loader2, RefreshCw, X } from 'lucide-react';
import { AdminService, AdminUserItem } from '../../../services/admin.service';
import { apiClient } from '../../../api/client';
import { useToast } from '../../ui/Toast';
import { useSocketEvent } from '../../../context/SocketContext';

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

export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [levels, setLevels] = useState<Array<{ id: string; _id?: string; code: string; label: string }>>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [isSavingLevel, setIsSavingLevel] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [newLevelId, setNewLevelId] = useState('');
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const { success, error } = useToast();

  const loadUsers = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await AdminService.getUsers({ search });
      const list = (data.users || []).filter((u: any) => u.role !== 'SUPER_ADMIN');
      setUsers(list);
    } catch {
      error('Impossible de charger la liste des utilisateurs');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [search, error]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useSocketEvent('ADMIN_USERS_UPDATED', () => loadUsers(true));
  useSocketEvent('USER_REGISTERED', () => loadUsers(true));

  useEffect(() => {
    apiClient.get('/levels').then((res) => {
      if (res.data?.success) setLevels(res.data.data);
    }).catch(() => {});
  }, []);

  const handleToggleStatus = async (user: AdminUserItem) => {
    const userId = user.id || (user as any)._id;
    if (!userId) return;
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setActionUserId(userId);
      await AdminService.updateUserStatus(userId, nextStatus);
      success(`Statut mis à jour pour ${user.firstName} ${user.lastName}`);
      setUsers((prev) =>
        prev.map((u) => ((u.id || (u as any)._id) === userId ? { ...u, status: nextStatus } : u))
      );
      await loadUsers(true);
    } catch {
      error('Échec de la modification du statut');
    } finally {
      setActionUserId(null);
    }
  };

  const handleOpenLevelModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    const lvl = user.primaryLevelId as any;
    setNewLevelId(lvl?.id || lvl?._id || '');
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async () => {
    const userId = selectedUser?.id || (selectedUser as any)?._id;
    if (!userId || !newLevelId) return;
    try {
      setIsSavingLevel(true);
      await AdminService.updateUserLevel(userId, newLevelId);
      success('Niveau scolaire réassigné avec succès');
      setIsLevelModalOpen(false);
      await loadUsers(true);
    } catch {
      error('Échec de la réassignation');
    } finally {
      setIsSavingLevel(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Gestion des Utilisateurs & Enseignants</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Contrôle des habilitations, affectation de classe et modération
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un enseignant..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => loadUsers(false)}
            aria-label="Actualiser"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Classe assignée</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    <span>Chargement des utilisateurs...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleMeta = getRoleMeta(u.role);
                  return (
                    <tr key={u.id || (u as any)._id || u.email} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-white">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
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
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-300 border border-red-500/30'
                        }`}>
                          {u.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenLevelModal(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Classe</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionUserId === (u.id || (u as any)._id)}
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                            u.status === 'ACTIVE'
                              ? 'bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/80'
                              : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/80'
                          }`}
                        >
                          {actionUserId === (u.id || (u as any)._id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          <span>{u.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isLevelModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <span>Réassigner la Classe</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLevelModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Sélectionnez le nouveau niveau pour <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> :
            </p>
            <div>
              <select
                value={newLevelId}
                onChange={(e) => setNewLevelId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez un niveau...</option>
                {levels.map((lvl) => (
                  <option key={lvl.id || lvl._id} value={lvl.id || lvl._id}>
                    {lvl.label} ({lvl.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLevelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSavingLevel}
                onClick={handleSaveLevel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-colors disabled:opacity-50"
              >
                {isSavingLevel && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
