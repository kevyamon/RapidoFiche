import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Upload } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LevelSelector } from '../common/LevelSelector';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryLevelId, setPrimaryLevelId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      const levelId =
        typeof user.primaryLevelId === 'object'
          ? (user.primaryLevelId as any)._id || (user.primaryLevelId as any).id || (user.primaryLevelId as any).code
          : user.primaryLevelId || '';
      setPrimaryLevelId(levelId);
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user, isOpen]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      error('La taille de la photo ne doit pas dépasser 2 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await apiClient.patch('/me/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || '',
        primaryLevelId,
        avatarUrl,
      });

      await refreshProfile();
      success('Profil mis à jour avec succès');
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        'Échec de la mise à jour des informations de profil';
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier mes informations"
      description="Mettez à jour vos coordonnées personnelles et votre niveau d’enseignement."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Photo de Profil */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-background-surface">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-800 font-bold text-lg flex items-center justify-center border border-primary-200">
                {firstName?.[0]}
                {lastName?.[0]}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-primary-600 text-text-inverse shadow-card hover:bg-primary-700 cursor-pointer transition-colors">
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Photo de profil</p>
            <p className="text-[11px] text-text-muted">JPG, PNG ou WebP (max. 2 Mo)</p>
          </div>
        </div>

        {/* Nom & Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Prénom
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Nom
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Adresse Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Numéro de Téléphone
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0708091011"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Sélecteur de Classe */}
        <LevelSelector
          value={primaryLevelId}
          onChange={setPrimaryLevelId}
          label="Niveau d’enseignement assigné"
          required
        />

        {/* Boutons d'Action */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </Modal>
  );
};
