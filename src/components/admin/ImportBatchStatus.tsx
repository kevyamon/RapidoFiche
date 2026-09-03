import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, FileText } from 'lucide-react';
import { ImportBatchSummary } from '../../services/admin.service';

export interface ImportBatchStatusProps {
  batch: ImportBatchSummary;
}

export const ImportBatchStatus: React.FC<ImportBatchStatusProps> = ({ batch }) => {
  const percent =
    batch.totalFiles > 0
      ? Math.round((batch.processedFiles / batch.totalFiles) * 100)
      : 0;

  return (
    <div className="bg-background-card rounded-2xl border border-border-default p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <span>Lot : {batch.batchName}</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Créé le {new Date(batch.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            batch.status === 'COMPLETED'
              ? 'bg-status-success-bg text-status-success-text border border-status-success-border'
              : batch.status === 'PROCESSING'
              ? 'bg-status-info-bg text-status-info-text border border-status-info-border'
              : batch.status === 'FAILED'
              ? 'bg-status-danger-bg text-status-danger-text border border-status-danger-border'
              : 'bg-background-surface text-text-muted border border-border-default'
          }`}
        >
          {batch.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {batch.status === 'PROCESSING' && <Clock className="w-3.5 h-3.5 animate-spin" />}
          {batch.status === 'FAILED' && <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{batch.status}</span>
        </span>
      </div>

      {/* Barre de Progression */}
      <div>
        <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
          <span>{batch.processedFiles} / {batch.totalFiles} fichier(s) traités</span>
          <span className="font-semibold">{percent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-background-surface overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Fichiers Traités */}
      {batch.files && batch.files.length > 0 && (
        <div className="pt-2 border-t border-border-subtle max-h-48 overflow-y-auto space-y-2">
          {batch.files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-background-surface text-xs"
            >
              <span className="font-mono text-text-primary truncate max-w-xs">{file.fileName}</span>
              {file.status === 'SUCCESS' ? (
                <span className="text-status-success-text font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success-badge" />
                  <span>Validé (Brouillon)</span>
                </span>
              ) : (
                <span className="text-status-danger-text font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-danger-badge" />
                  <span>{file.errorMessage || 'Erreur format'}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
