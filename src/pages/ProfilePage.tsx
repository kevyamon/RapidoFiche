import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Sparkles,
  CreditCard,
  LogOut,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';

interface PaymentItem {
  id: string;
  reference: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
  provider: string;
}

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { subscription, openPayModal } = useSubscription();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  const levelLabel =
    typeof user?.primaryLevelId === 'object'
      ? `${user.primaryLevelId.label} (${user.primaryLevelId.code})`
      : 'Non assigné';

  const isSubActive = subscription?.status === 'ACTIVE';

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiClient.get('/payments/me');
        if (res.data?.success) {
          setPayments(res.data.data);
        }
      } catch {
        // Ignorer
      }
    };
    fetchPayments();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          Mon Profil Enseignant
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Gérez vos informations de compte et le suivi de votre abonnement.
        </p>
      </div>

      {/* 1. Carte Informations Personnelles */}
      <div className="bg-background-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-800 font-bold text-lg flex items-center justify-center border border-primary-200 shrink-0">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background-surface">
            <GraduationCap className="w-5 h-5 text-primary-600 shrink-0" />
            <div>
              <p className="text-[11px] text-text-muted font-medium">Niveau d'enseignement</p>
              <p className="text-xs sm:text-sm font-semibold text-text-primary">{levelLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-background-surface">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-subscription-activeBg text-subscription-activeText border border-subscription-activeBorder">
              <CheckCircle className="w-3.5 h-3.5" />
              Actif ({subscription?.daysRemaining} jours restants)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-status-danger-bg text-status-danger-text border border-status-danger-border">
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
          <Button
            variant="secondary"
            size="sm"
            onClick={openPayModal}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="shrink-0"
          >
            {isSubActive ? 'Prolonger (200 F)' : 'Activer (200 F)'}
          </Button>
        </div>
      </div>

      {/* 3. Historique des Transactions */}
      {payments.length > 0 && (
        <div className="bg-background-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-text-primary">Historique des Paiements</h2>
          </div>

          <div className="divide-y divide-border-subtle">
            {payments.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-text-primary">Réf : {p.reference}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-text-primary">{p.amount} FCFA</p>
                  <span
                    className={`text-[11px] font-medium ${
                      p.status === 'COMPLETED' ? 'text-status-success-text' : 'text-status-danger-text'
                    }`}
                  >
                    {p.status === 'COMPLETED' ? 'Payé' : 'Échoué'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
};
