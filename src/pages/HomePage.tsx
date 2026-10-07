import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, Layers, CreditCard, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { apiClient } from '../api/client';
import { LessonCard, LessonSummary } from '../components/lessons/LessonCard';
import { Button } from '../components/ui/Button';
import { useSeo } from '../hooks/useSeo';

interface SubjectItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
}

export const HomePage: React.FC = () => {
  useSeo({
    title: 'Tableau de Bord Enseignant',
    description: 'Accédez aux fiches pédagogiques officielles du primaire en Côte d’Ivoire (CP1 au CM2). Préparation de cours rapide et consultation hors-ligne.',
    canonicalPath: '/',
  });

  const { user } = useAuth();
  const { subscription, openPayModal } = useSubscription();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [recentLessons, setRecentLessons] = useState<LessonSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const levelCode =
    typeof user?.primaryLevelId === 'object'
      ? user.primaryLevelId?.label
        ? `${user.primaryLevelId.label} (${user.primaryLevelId.code})`
        : user.primaryLevelId.code
      : user?.primaryLevelId || 'Votre Classe';

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [subjectsRes, historyRes] = await Promise.all([
          apiClient.get('/me/subjects'),
          apiClient.get('/history?limit=3'),
        ]);

        if (subjectsRes.data?.success) {
          setSubjects(subjectsRes.data.data);
        }

        if (historyRes.data?.success) {
          const lessons = historyRes.data.data.map((h: any) => h.lessonId);
          setRecentLessons(lessons.filter(Boolean));
        }
      } catch {
        // Mode silencieux
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const isSubActive = subscription?.status === 'ACTIVE';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full max-w-full overflow-hidden">
      {/* Bannière d'Avertissement Grand Format si Abonnement Inactif ou Expiré */}
      {!isSubActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-status-danger-bg border-2 border-status-danger-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-status-danger-badge text-white shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-status-danger-text">
                Abonnement requis pour consulter toutes les fiches
              </h2>
              <p className="text-xs text-status-danger-text/90 mt-0.5">
                Activez votre forfait mensuel (200 FCFA) pour débloquer l’ensemble des matières et semaines de votre classe ({levelCode}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openPayModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-status-danger-badge hover:bg-red-600 text-white text-xs sm:text-sm font-bold shadow-elevated shrink-0 transition-all active:scale-95 animate-pulse"
          >
            <CreditCard className="w-4 h-4" />
            <span>Activer l'accès illimité (200 FCFA)</span>
          </button>
        </div>
      )}

      {/* 1. Bannière d'Accueil Enseignant */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-text-inverse p-6 sm:p-8 shadow-elevated">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold text-primary-200 tracking-wider uppercase mb-2">
            Programme National Primaire • {levelCode}
          </p>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Bonjour, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-primary-100 mt-1.5 leading-relaxed">
            Accédez à toutes vos fiches pédagogiques conformes aux programmes éducatifs ivoiriens, prêtes à l'emploi pour votre classe.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/fiches')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explorer les fiches
            </Button>

            {!isSubActive && (
              <button
                type="button"
                onClick={openPayModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-status-danger-badge hover:bg-red-600 text-white transition-all shadow-subtle active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Activer l'accès illimité (200 FCFA)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Accès Rapide par Matière */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" />
            <span>Matières de votre niveau ({levelCode})</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-background-card border border-border-default shadow-card animate-pulse h-24"
                />
              ))
            : subjects.map((sub) => {
                const subId = sub.id || sub._id;
                return (
                  <button
                    key={subId}
                    onClick={() => navigate(`/fiches?subjectId=${subId}`)}
                    className="p-4 rounded-xl bg-background-card border border-border-default hover:border-primary-300 hover:shadow-card transition-all text-left flex flex-col justify-between h-24 group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-primary-700 transition-colors truncate">
                      {sub.name}
                    </span>
                  </button>
                );
              })}
        </div>
      </div>

      {/* 3. Fiches Récemment Consultées */}
      {recentLessons.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <span>Récemment consultées</span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/fiches')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Voir tout
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLessons.map((lesson) => (
              <LessonCard key={lesson.id || (lesson as any)._id || lesson.title} lesson={lesson} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
