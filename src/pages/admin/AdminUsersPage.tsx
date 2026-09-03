import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, ShieldAlert, GraduationCap } from 'lucide-react';
import { AdminService, AdminUserItem } from '../../services/admin.service';
import { apiClient } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [levels, setLevels] = useState<Array<{ id: string; _id?: string; code: string; label: string }>>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [newLevelId, setNewLevelId] = useState('');
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const { success, error } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getUsers({ search });
      setUsers(data.users || []);
    } catch {
      error('Impossible de charger la liste des enseignants');
    } finally {
      setIsLoading(false);
    }
  }, [search, error]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await apiClient.get('/levels');
        if (res.data?.success) setLevels(res.data.data);
      } catch {
        // Ignorer
      }
    };
    fetchLevels();
  }, []);

  const handleToggleStatus = async (user: AdminUserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await AdminService.updateUserStatus(user.id, nextStatus);
      success(`Statut mis à jour pour ${user.firstName} ${user.lastName}`);
      await loadUsers();
    } catch {
      error('Échec de la modification du statut');
    }
  };

  const handleOpenLevelModal = (user: AdminUserItem) => {
    setSelectedUser(user);
    setNewLevelId(user.primaryLevelId?.id || '');
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async () => {
    if (!selectedUser || !newLevelId) return;
    try {
      await AdminService.updateUserLevel(selectedUser.id, newLevelId);
      success('Niveau de classe réassigné avec succès');
      setIsLevelModalOpen(false);
      await loadUsers();
    } catch {
      error('Échec de la réassignation du niveau');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            <span>Gestion des Enseignants</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Suivi des comptes, attribution des classes et contrôle d'accès.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un enseignant..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-card text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tableau des Utilisateurs */}
      <div className="bg-background-card rounded-2xl border border-border-default shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-background-surface border-b border-border-default text-text-muted text-xs font-semibold">
              <tr>
                <th className="p-4">Enseignant</th>
                <th className="p-4">Classe assignée</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    Chargement des enseignants...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    Aucun enseignant trouvé.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-background-surface/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-text-primary">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                        {u.primaryLevelId?.code || 'Non assigné'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.status === 'ACTIVE'
                            ? 'bg-status-success-bg text-status-success-text border border-status-success-border'
                            : 'bg-status-danger-bg text-status-danger-text border border-status-danger-border'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenLevelModal(u)}
                        leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
                      >
                        Classe
                      </Button>
                      <Button
                        variant={u.status === 'ACTIVE' ? 'danger' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleStatus(u)}
                        leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                      >
                        {u.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de Changement de Classe */}
      <Modal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        title="Réassigner la classe de l'enseignant"
        description={`Sélectionnez le nouveau niveau officiel pour ${selectedUser?.firstName} ${selectedUser?.lastName}`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Nouveau Niveau
            </label>
            <select
              value={newLevelId}
              onChange={(e) => setNewLevelId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            <Button variant="ghost" size="sm" onClick={() => setIsLevelModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveLevel}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
