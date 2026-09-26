import React from 'react';
import { AlertCircle, CreditCard, ArrowLeft, RefreshCw, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';

export interface LessonAccessBlockedProps {
  errorType: 'SUBSCRIPTION' | 'LEVEL' | 'GENERAL' | null;
  errorMessage: string;
  onBack: () => void;
  onRetry?: () => void;
  onOpenPayModal?: () => void;
}

export const LessonAccessBlocked: React.FC<LessonAccessBlockedProps> = ({
  errorType,
  errorMessage,
  onBack,
  onRetry,
  onOpenPayModal,
}) => {
  const getHeaderTitle = () => {
    if (errorType === 'SUBSCRIPTION') return 'Abonnement Requis';
    if (errorType === 'LEVEL') return 'Fiche d’un Autre Niveau';
    return 'Document Indisponible';
  };

  return (
    <div className="p-6 sm:p-8 bg-background-card rounded-2xl border border-border-default shadow-card text-center space-y-4 max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-status-danger-bg text-status-danger-badge flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-text-primary">{getHeaderTitle()}</h2>
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{errorMessage}</p>

      <div className="pt-2 flex flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={errorType === 'LEVEL' ? <BookOpen className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        >
          {errorType === 'LEVEL' ? 'Mes fiches de classe' : 'Retour aux fiches'}
        </Button>

        {errorType === 'SUBSCRIPTION' && onOpenPayModal && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenPayModal}
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            Activer (200 FCFA)
          </Button>
        )}

        {errorType === 'GENERAL' && onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
};
