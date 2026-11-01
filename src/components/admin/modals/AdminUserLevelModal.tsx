import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Loader2, X } from 'lucide-react';
import { AdminUserItem } from '../../../services/admin.service';

interface AdminUserLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserItem | null;
  levels: Array<{ id: string; _id?: string; code: string; label: string }>;
  newLevelId: string;
  onLevelChange: (levelId: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

export const AdminUserLevelModal: React.FC<AdminUserLevelModalProps> = ({
  isOpen,
  onClose,
  user,
  levels,
  newLevelId,
  onLevelChange,
  isSaving,
  onSave,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !user || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      style={{ minHeight: '100dvh' }}
    >
      <div
        className="w-full max-w-md my-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>Réassigner la Classe</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Sélectionnez le nouveau niveau pour <strong>{user.firstName} {user.lastName}</strong> :
        </p>

        <div>
          <select
            value={newLevelId}
            onChange={(e) => onLevelChange(e.target.value)}
            disabled={isSaving}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Sélectionnez un niveau...</option>
            {levels.map((lvl) => (
              <option key={lvl.id || lvl._id} value={lvl.id || lvl._id}>
                {lvl.label} ({lvl.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isSaving || !newLevelId}
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-colors disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

