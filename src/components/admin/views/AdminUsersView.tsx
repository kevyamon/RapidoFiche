import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Loader2, RefreshCw } from 'lucide-react';
import { AdminService, AdminUserItem } from '../../../services/admin.service';
import { apiClient } from '../../../api/client';
import { useToast } from '../../ui/Toast';
import { useSocketEvent } from '../../../context/SocketContext';
import { AdminUserRow } from './AdminUserRow';
import { AdminUserLevelModal } from '../modals/AdminUserLevelModal';

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
      success(
        nextStatus === 'ACTIVE'
          ? `Compte réactivé avec succès pour ${user.firstName} ${user.lastName}`
          : `Compte suspendu pour ${user.firstName} ${user.lastName}`
      );
      setUsers((prev) =>
        prev.map((u) => ((u.id || (u as any)._id) === userId ? { ...u, status: nextStatus } : u))
      );
      await loadUsers(true);
    } catch {
      error(nextStatus === 'ACTIVE' ? 'Échec de la réactivation' : 'Échec de la suspension');
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
            Contrôle des abonnements, affectation de classe et modération des accès
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
                <th className="p-4">Abonnement</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    <span>Chargement des utilisateurs...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <AdminUserRow
                    key={u.id || (u as any)._id || u.email}
                    user={u}
                    actionUserId={actionUserId}
                    onOpenLevelModal={handleOpenLevelModal}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminUserLevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        user={selectedUser}
        levels={levels}
        newLevelId={newLevelId}
        onLevelChange={setNewLevelId}
        isSaving={isSavingLevel}
        onSave={handleSaveLevel}
      />
    </div>
  );
};
