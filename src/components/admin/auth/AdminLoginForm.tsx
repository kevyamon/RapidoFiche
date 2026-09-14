import React, { useState } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export const AdminLoginForm: React.FC = () => {
  const { loginAdmin } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await loginAdmin({ email, password });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      setErrorMessage(
        errorObj.response?.data?.error?.message ||
          'Identifiants d’accès non valides ou autorisation insuffisante.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
            placeholder="admin@rapidofiche.ci"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Vérification sécurisée...</span>
          </>
        ) : (
          <span>Accéder au Cockpit</span>
        )}
      </button>
    </form>
  );
};
