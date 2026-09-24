import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { AdminLessonItem } from './views/AdminLessonsView';

export interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: AdminLessonItem | null;
  onSuccess: () => void;
}

interface LevelOption {
  id: string;
  code: string;
  label: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

const DEFAULT_LEVELS: LevelOption[] = [
  { id: 'PS', code: 'PS', label: 'Petite Section' }, { id: 'MS', code: 'MS', label: 'Moyenne Section' },
  { id: 'GS', code: 'GS', label: 'Grande Section' }, { id: 'CP1', code: 'CP1', label: 'CP 1ère année' },
  { id: 'CP2', code: 'CP2', label: 'CP 2ème année' }, { id: 'CE1', code: 'CE1', label: 'CE 1ère année' },
  { id: 'CE2', code: 'CE2', label: 'CE 2ème année' }, { id: 'CM1', code: 'CM1', label: 'CM 1ère année' },
  { id: 'CM2', code: 'CM2', label: 'CM 2ème année' },
];

export const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [levelId, setLevelId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [week, setWeek] = useState<number>(1);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [levels, setLevels] = useState<LevelOption[]>(DEFAULT_LEVELS);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await apiClient.get('/levels');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const apiLevels = res.data.data.map((l: any) => ({
            id: l.id || l._id || l.code,
            code: l.code,
            label: l.label,
          }));
          setLevels(apiLevels);
        }
      } catch {
        // Fallback default levels
      }
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    if (!levelId) return;
    const fetchSubjects = async () => {
      try {
        const res = await apiClient.get('/subjects', { params: { levelId } });
        if (res.data?.success && Array.isArray(res.data.data)) {
          const apiSubjects = res.data.data.map((s: any) => ({
            id: s.id || s._id || s.name,
            name: s.name,
          }));
          setSubjects(apiSubjects);
        }
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [levelId]);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      const rawLevel =
        typeof lesson.levelId === 'object'
          ? (lesson.levelId as any)._id || (lesson.levelId as any).id || (lesson.levelId as any).code
          : lesson.levelId || '';
      setLevelId(rawLevel);

      const rawSubject =
        typeof lesson.subjectId === 'object'
          ? (lesson.subjectId as any)._id || (lesson.subjectId as any).id || (lesson.subjectId as any).name
          : lesson.subjectId || '';
      setSubjectId(rawSubject);

      setWeek(lesson.week || 1);
      setStatus(
        lesson.status === 'PUBLISHED'
          ? 'PUBLISHED'
          : lesson.status === 'ARCHIVED'
          ? 'ARCHIVED'
          : 'DRAFT'
      );
    }
  }, [lesson, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;

    const lessonId = lesson.id || (lesson as any)._id;
    if (!lessonId) {
      error('Identifiant de la fiche introuvable');
      return;
    }

    try {
      setIsLoading(true);
      const payload: Record<string, any> = {
        title: title.trim(),
        week: Number(week),
        status,
      };

      if (levelId) payload.levelId = levelId;
      if (subjectId) payload.subjectId = subjectId;

      await apiClient.patch(`/admin/lessons/${lessonId}`, payload);
      success('Fiche pédagogique mise à jour avec succès !');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        'Échec de la mise à jour de la fiche pédagogique';
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier la Fiche Pédagogique"
      description="Ajustez le titre, la classe assignée, la matière et le statut officiel."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        {/* Titre */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Titre de la fiche pédagogique *
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Mathématiques - PS - Semaine 1 : Les Formes"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Classe & Matière */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Classe */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Classe / Niveau *
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Sélectionnez une classe...</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.code} - {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matière */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Matière Pédagogique *
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Sélectionnez une matière...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Semaine & Statut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Semaine */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Semaine du programme
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={1}
                max={52}
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value, 10) || 1)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Statut de la fiche
            </label>
            <div className="relative">
              <CheckCircle2 className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border-default bg-background-input text-xs text-text-primary focus:ring-2 focus:ring-primary-500 outline-none font-semibold"
              >
                <option value="DRAFT">Brouillon (invisible enseignants)</option>
                <option value="PUBLISHED">Publiée (visible enseignants)</option>
                <option value="ARCHIVED">Archivée</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </Modal>
  );
};
