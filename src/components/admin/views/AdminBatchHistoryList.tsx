import React from 'react';
import { ImportBatchSummary } from '../../../services/admin.service';

interface AdminBatchHistoryListProps {
  batches: ImportBatchSummary[];
}

export const AdminBatchHistoryList: React.FC<AdminBatchHistoryListProps> = ({ batches }) => {
  if (!batches || !Array.isArray(batches) || batches.length === 0) return null;

  return (
    <div className="space-y-3 pt-2 text-left">
      <h3 className="text-base font-bold text-white">Derniers Lots Téléversés</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {batches.map((b) => (
          <div
            key={b.id}
            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 shadow-md flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs sm:text-sm text-white">{b.batchName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {b.processedFiles} / {b.totalFiles} fichiers traités
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                b.status === 'COMPLETED'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : b.status === 'REVIEW_REQUIRED'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : b.status === 'FAILED'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              }`}
            >
              {b.status === 'COMPLETED' && 'Traité (Brouillon prêt)'}
              {b.status === 'REVIEW_REQUIRED' && 'Revue requise'}
              {b.status === 'FAILED' && 'Échec'}
              {b.status === 'PROCESSING' && 'En cours'}
              {!['COMPLETED', 'REVIEW_REQUIRED', 'FAILED', 'PROCESSING'].includes(b.status) && b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
