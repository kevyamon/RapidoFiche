import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      error('Le mot de passe actuel est obligatoire');
      return;
    }

    if (newPassword.length < 8) {
      error('Le nouveau mot de passe doit comporter au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.post('/me/change-password', {
        currentPassword,
        newPassword,
      });

      success('Votre mot de passe a été modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        'Échec de la modification du mot de passe. Vérifiez votre mot de passe actuel.';
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Changer de mot de passe"
      description="Pour des raisons de sécurité, veuillez saisir votre mot de passe actuel."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Mot de Passe Actuel */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Mot de passe actuel *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Saisissez votre mot de passe actuel"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nouveau Mot de Passe */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Nouveau mot de passe *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 caractères"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmation du Nouveau Mot de Passe */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Confirmez le nouveau mot de passe *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le nouveau mot de passe"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Mettre à jour le mot de passe
          </Button>
        </div>
      </form>
    </Modal>
  );
};
