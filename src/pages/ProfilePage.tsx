import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  CreditCard,
  LogOut,
  CheckCircle,
  Edit3,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { ProfilePaymentsHistory, PaymentItem } from '../components/profile/ProfilePaymentsHistory';
import { useToast } from '../components/ui/Toast';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { subscription, openPayModal, verifyPayment, checkSubscription } = useSubscription();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const levelLabel =
    typeof user?.primaryLevelId === 'object'
      ? `${user.primaryLevelId.label} (${user.primaryLevelId.code})`
      : user?.primaryLevelId || 'Non assigné';

  const isSubActive = subscription?.status === 'ACTIVE';

  const fetchPayments = async () => {
    try {
      const res = await apiClient.get('/me/payments');
      if (res.data?.success) {
        setPayments(res.data.data);
      }
    } catch {
      // Ignorer
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (ref: string) => {
    try {
      setVerifyingId(ref);
      info('Vérification auprès de GeniusPay...');
      const res = await verifyPayment(ref);
      if (res.success) {
        success('Abonnement validé avec succès !');
        await checkSubscription();
        await fetchPayments();
      } else {
        toastError(res.message || 'Le paiement est toujours en attente.');
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            Mon Profil Enseignant
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Gérez vos informations personnelles et le suivi de votre abonnement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPasswordModalOpen(true)}
            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
          >
            Mot de passe
          </Button>
        </div>
      </div>

      {/* 1. Carte Informations Personnelles */}
      <div className="bg-background-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Photo de profil"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-300 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-800 font-bold text-lg flex items-center justify-center border border-primary-200 shrink-0">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
          )}
          <div className="truncate">
            <h2 className="text-base sm:text-lg font-bold text-text-primary truncate">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted truncate">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background-surface">
            <GraduationCap className="w-5 h-5 text-primary-600 shrink-0" />
            <div>
              <p className="text-[11px] text-text-muted font-medium">Niveau d'enseignement</p>
              <p className="text-xs sm:text-sm font-semibold text-text-primary">{levelLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background-surface">
            <User className="w-5 h-5 text-primary-600 shrink-0" />
            <div>
              <p className="text-[11px] text-text-muted font-medium">Téléphone</p>
              <p className="text-xs sm:text-sm font-semibold text-text-primary">
                {user?.phone || 'Non renseigné'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Statut de l'Abonnement (Offre 200 FCFA) */}
      <div className="bg-background-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-secondary-600" />
            <h2 className="text-base font-bold text-text-primary">Abonnement Mensuel</h2>
          </div>
          {isSubActive ? (
            <span className="text-xs font-semibold text-status-success-text flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Actif ({subscription?.daysRemaining} jours restants)</span>
            </span>
          ) : (
            <span className="text-xs font-semibold text-status-danger-text">
              Expiré / Inactif
            </span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-900">
              Forfait Essentiel Enseignant (200 FCFA / mois)
            </p>
            <p className="text-xs text-primary-700 mt-0.5">
              Accès illimité en ligne et hors-ligne à toutes les fiches de votre classe.
            </p>
          </div>

          {!isSubActive ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={openPayModal}
              leftIcon={<CreditCard className="w-4 h-4" />}
              className="shrink-0"
            >
              Activer (200 FCFA)
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-status-success-bg text-status-success-text text-xs font-bold border border-status-success-border shrink-0">
              <CheckCircle className="w-4 h-4 text-status-success-badge" />
              <span>Forfait actif</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Historique des Transactions */}
      <ProfilePaymentsHistory
        payments={payments}
        onVerify={handleVerify}
        verifyingId={verifyingId}
      />

      {/* 4. Déconnexion */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4 text-status-danger-badge" />}
          className="text-status-danger-badge hover:bg-status-danger-bg hover:border-status-danger-border"
        >
          Se déconnecter
        </Button>
      </div>

      {/* Modales d'Édition */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
