import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LevelSelector } from '../components/common/LevelSelector';
import { Button } from '../components/ui/Button';

import { StealthLogoTrigger } from '../components/common/StealthLogoTrigger';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [primaryLevelId, setPrimaryLevelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !phone || !primaryLevelId) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires (dont votre numéro de téléphone).');
      return;
    }

    if (phone.trim().length < 8) {
      setErrorMessage('Veuillez saisir un numéro de téléphone valide (au moins 8 chiffres).');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        primaryLevelId,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Erreur complète inscription:', err);
      const apiErr = err?.response?.data?.error;
      const detailMsg = apiErr?.details?.[0]?.message;
      const msg =
        detailMsg ||
        apiErr?.message ||
        (err?.message && !err?.response ? `Erreur technique : ${err.message}` : null) ||
        'Échec de l’inscription. Veuillez vérifier vos informations.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-main animate-fade-in py-8">
      <div className="max-w-lg w-full bg-background-card rounded-2xl border border-border-default p-6 sm:p-8 shadow-elevated">
        {/* Logo Furtif & Titre */}
        <div className="text-center mb-6">
          <StealthLogoTrigger />
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Créer un Compte Enseignant
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Rejoignez RapidoFiche et accédez aux fiches de votre classe
          </p>
        </div>

        {/* Message d'Erreur */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-status-danger-bg border border-status-danger-border flex items-start gap-2.5 text-xs text-status-danger-text">
            <AlertCircle className="w-4 h-4 text-status-danger-badge shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulaire d'Inscription */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Prénom *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Nom *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Koffi"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Sélecteur de Classe Haute Fidélité */}
          <LevelSelector
            value={primaryLevelId}
            onChange={setPrimaryLevelId}
            label="Classe / Niveau d'enseignement principal"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Adresse Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enseignant@ecole.ci"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 caractères"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded transition-colors"
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Téléphone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0708091011"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border-default bg-background-input text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <Button variant="primary" type="submit" fullWidth isLoading={isLoading}>
            Créer mon compte
          </Button>
        </form>

        {/* Lien Connexion */}
        <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-secondary">
          <span>Vous avez déjà un compte ? </span>
          <Link
            to="/connexion"
            className="font-semibold text-primary-600 hover:text-primary-700 underline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};
