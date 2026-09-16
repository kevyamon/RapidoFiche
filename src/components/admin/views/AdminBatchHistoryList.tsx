import React from 'react';
import { ImportBatchSummary } from '../../../services/admin.service';

interface AdminBatchHistoryListProps {
  batches: ImportBatchSummary[];
}

export const AdminBatchHistoryList: React.FC<AdminBatchHistoryListProps> = ({ batches }) => {
  if (batches.length === 0) return null;

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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
