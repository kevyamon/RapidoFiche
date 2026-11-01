import React from 'react';
import { Edit3, CheckCircle, Archive, Trash2, Loader2 } from 'lucide-react';
import { AdminLessonItem } from './AdminLessonsView';

interface AdminLessonRowProps {
  lesson: AdminLessonItem;
  actionLoading: { id: string; type: 'publish' | 'archive' | 'delete' } | null;
  onEdit: (lesson: AdminLessonItem) => void;
  onPublish: (lesson: AdminLessonItem) => void;
  onArchive: (lesson: AdminLessonItem) => void;
  onDelete: (lesson: AdminLessonItem) => void;
}

export const AdminLessonRow: React.FC<AdminLessonRowProps> = ({
  lesson: l,
  actionLoading,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
}) => {
  const lessonId = l.id || l._id || '';

  return (
    <tr className="hover:bg-slate-700/40 transition-colors">
      <td className="p-4">
        <p className="font-semibold text-white">{l.title}</p>
        <p className="text-xs text-slate-400">{l.subjectId?.name || 'Général'}</p>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
          {l.levelId?.code || 'Tous'}
        </span>
      </td>
      <td className="p-4 text-slate-300 font-medium">
        {l.week ? `Semaine ${l.week}` : '—'}
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            l.status === 'PUBLISHED'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : l.status === 'DRAFT'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'bg-slate-700 text-slate-300 border border-slate-600'
          }`}
        >
          {l.status === 'PUBLISHED' ? 'Publiée' : l.status === 'DRAFT' ? 'Brouillon' : 'Archivée'}
        </span>
      </td>
      <td className="p-4 text-right space-x-2 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onEdit(l)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Éditer</span>
        </button>
        {l.status !== 'PUBLISHED' && (
          <button
            type="button"
            disabled={actionLoading?.id === lessonId}
            onClick={() => onPublish(l)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {actionLoading?.id === lessonId && actionLoading?.type === 'publish' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            <span>Publier</span>
          </button>
        )}
        {l.status !== 'ARCHIVED' && (
          <button
            type="button"
            disabled={actionLoading?.id === lessonId}
            onClick={() => onArchive(l)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/60 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {actionLoading?.id === lessonId && actionLoading?.type === 'archive' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Archive className="w-3.5 h-3.5" />
            )}
            <span>Archiver</span>
          </button>
        )}
        <button
          type="button"
          disabled={actionLoading?.id === lessonId}
          onClick={() => onDelete(l)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-900/60 hover:text-red-200 text-xs font-semibold transition-colors disabled:opacity-50"
          title="Supprimer définitivement"
        >
          {actionLoading?.id === lessonId && actionLoading?.type === 'delete' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span>Supprimer</span>
        </button>
      </td>
    </tr>
  );
};
