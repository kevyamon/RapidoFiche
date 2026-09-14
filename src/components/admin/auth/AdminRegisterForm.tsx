import React, { useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { KeyRound, Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';

export const AdminRegisterForm: React.FC = () => {
  const { registerAdmin } = useAdminAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPw, setAdminPw] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await registerAdmin({
        firstName,
        lastName,
        email,
        password,
        adminPw,
      });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMessage(
        errorObj.response?.data?.error?.message ||
          'Clé d’autorisation incorrecte ou informations non valides.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Prénom
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Amadou"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Nom
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Koné"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Courriel Professionnel
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@rapidofiche.ci"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Mot de passe (8+ caractères)
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
          <KeyRound className="w-3.5 h-3.5" />
          Clé Secrète Staff (ADMIN_PW)
        </label>
        <div className="relative">
          <KeyRound className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
          <input
            type="password"
            required
            value={adminPw}
            onChange={(e) => setAdminPw(e.target.value)}
            placeholder="Clé maîtresse d’ingénierie..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-amber-300 bg-amber-50/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enregistrement du compte staff...</span>
          </>
        ) : (
          <span>Initialiser le Compte Administrateur</span>
        )}
      </button>
    </form>
  );
};
