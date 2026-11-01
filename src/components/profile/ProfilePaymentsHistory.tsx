import React, { useState } from 'react';
import { Clock, RotateCw, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface PaymentItem {
  id: string;
  reference: string;
  amount: number;
  status: 'SUCCESS' | 'COMPLETED' | 'PENDING' | 'FAILED' | 'CREATED';
  createdAt: string;
  provider: string;
}

interface ProfilePaymentsHistoryProps {
  payments: PaymentItem[];
  onVerify: (reference: string) => void;
  verifyingId: string | null;
  onDelete?: (paymentId: string) => Promise<void> | void;
  onClearAll?: () => Promise<void> | void;
}

export const ProfilePaymentsHistory: React.FC<ProfilePaymentsHistoryProps> = ({
  payments,
  onVerify,
  verifyingId,
  onDelete,
  onClearAll,
}) => {
  const [targetPayment, setTargetPayment] = useState<PaymentItem | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (payments.length === 0) return null;

  const handleConfirmDeleteSingle = async () => {
    if (!targetPayment || !onDelete) return;
    const paymentId = targetPayment.id || (targetPayment as any)._id || targetPayment.reference;
    try {
      setIsDeleting(true);
      await onDelete(paymentId);
      setTargetPayment(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClearAll = async () => {
    if (!onClearAll) return;
    try {
      setIsDeleting(true);
      await onClearAll();
      setIsClearAllOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-background-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          <h2 className="text-base font-bold text-text-primary">Historique des Paiements</h2>
        </div>
        {onClearAll && payments.length > 1 && (
          <button
            type="button"
            onClick={() => setIsClearAllOpen(true)}
            className="text-xs text-status-danger-badge hover:underline font-medium inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-status-danger-bg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vider l'historique</span>
          </button>
        )}
      </div>

      <div className="divide-y divide-border-subtle">
        {payments.map((p) => {
          const isPaid = p.status === 'SUCCESS' || p.status === 'COMPLETED';
          const isPending = p.status === 'PENDING' || p.status === 'CREATED';

          return (
            <div
              key={p.id || (p as any)._id || p.reference}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary truncate">
                  Réf : {p.reference}
                </p>
                <p className="text-[11px] sm:text-xs text-text-muted mt-0.5">
                  {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                <div className="text-left sm:text-right shrink-0">
                  <p className="font-bold text-text-primary">{p.amount} FCFA</p>
                  <span
                    className={`text-[11px] font-semibold ${
                      isPaid
                        ? 'text-status-success-text'
                        : isPending
                        ? 'text-status-warning-text'
                        : 'text-status-danger-text'
                    }`}
                  >
                    {isPaid ? 'Payé' : isPending ? 'En attente' : 'Échoué'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isPending && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerify(p.reference)}
                      isLoading={verifyingId === p.reference}
                      leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                      className="text-xs py-1 px-2.5 h-7"
                    >
                      Vérifier
                    </Button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => setTargetPayment(p)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-status-danger-badge hover:bg-status-danger-bg transition-colors shrink-0"
                      title="Supprimer cette transaction"
                      aria-label={`Supprimer la transaction ${p.reference}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modale de Confirmation : Suppression unitaire */}
      <Modal
        isOpen={Boolean(targetPayment)}
        onClose={() => !isDeleting && setTargetPayment(null)}
        title="Supprimer la transaction"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-status-danger-bg border border-status-danger-border">
            <AlertTriangle className="w-5 h-5 text-status-danger-badge shrink-0 mt-0.5" />
            <div className="text-xs text-status-danger-text">
              <p className="font-semibold">Suppression définitive de la trace</p>
              <p className="mt-0.5">
                Réf : <strong>{targetPayment?.reference}</strong> ({targetPayment?.amount} FCFA)
              </p>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Êtes-vous sûr de vouloir supprimer cette transaction passée de votre historique ?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setTargetPayment(null)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDeleteSingle}
              leftIcon={isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modale de Confirmation : Vidage complet */}
      <Modal
        isOpen={isClearAllOpen}
        onClose={() => !isDeleting && setIsClearAllOpen(false)}
        title="Vider l'historique des paiements"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-status-danger-bg border border-status-danger-border">
            <AlertTriangle className="w-5 h-5 text-status-danger-badge shrink-0 mt-0.5" />
            <div className="text-xs text-status-danger-text">
              <p className="font-semibold">Action irréversible</p>
              <p className="mt-0.5">
                Toutes les transactions passées ({payments.length}) seront définitivement retirées de votre vue.
              </p>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Voulez-vous supprimer l'intégralité de l'historique de vos paiements pour libérer l'espace ?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setIsClearAllOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmClearAll}
              leftIcon={isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            >
              Tout vider
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
