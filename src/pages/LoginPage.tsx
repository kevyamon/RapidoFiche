import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const apiErr = err?.response?.data?.error;
      const detailMsg = apiErr?.details?.[0]?.message;
      const msg =
        detailMsg ||
        apiErr?.message ||
        'Identifiants incorrects. Veuillez vérifier vos accès.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-main animate-fade-in">
      <div className="max-w-md w-full bg-background-card rounded-2xl border border-border-default p-6 sm:p-8 shadow-elevated">
        {/* Logo & Titre */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Logo RapidoFiche"
            className="w-14 h-14 rounded-2xl object-cover mx-auto mb-3 shadow-card"
          />
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Connexion Enseignant
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Accédez à vos fiches pédagogiques officielles
          </p>
        </div>

        {/* Message d'Erreur */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-status-danger-bg border border-status-danger-border flex items-start gap-2.5 text-xs text-status-danger-text">
            <AlertCircle className="w-4 h-4 text-status-danger-badge shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enseignant@ecole.ci"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded"
                aria-label="Afficher le mot de passe"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button variant="primary" type="submit" fullWidth isLoading={isLoading}>
            Se connecter
          </Button>
        </form>

        {/* Lien Inscription */}
        <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-secondary">
          <span>Vous n’avez pas encore de compte ? </span>
          <Link
            to="/inscription"
            className="font-semibold text-primary-600 hover:text-primary-700 underline"
          >
            Créer un compte enseignant
          </Link>
        </div>
      </div>
    </div>
  );
};
