import React from 'react';
import { Clock, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';

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
}

export const ProfilePaymentsHistory: React.FC<ProfilePaymentsHistoryProps> = ({
  payments,
  onVerify,
  verifyingId,
}) => {
  if (payments.length === 0) return null;

  return (
    <div className="bg-background-card rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-primary-600" />
        <h2 className="text-base font-bold text-text-primary">Historique des Paiements</h2>
      </div>

      <div className="divide-y divide-border-subtle">
        {payments.map((p) => {
          const isPaid = p.status === 'SUCCESS' || p.status === 'COMPLETED';
          const isPending = p.status === 'PENDING' || p.status === 'CREATED';

          return (
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
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="font-bold text-text-primary">{p.amount} FCFA</p>
                  <span
                    className={`text-[11px] font-medium ${
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

                {isPending && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVerify(p.reference)}
                    isLoading={verifyingId === p.reference}
                    leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                    className="text-xs py-1 px-2 h-7"
                  >
                    Vérifier
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
