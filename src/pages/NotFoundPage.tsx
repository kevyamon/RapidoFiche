import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 text-slate-600">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
        Erreur 404
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
        Page introuvable
      </h1>

      <p className="text-sm sm:text-base text-slate-600 max-w-md mb-8">
        La ressource demandée n’existe pas ou a été déplacée. Veuillez vérifier l’adresse saisie ou retourner à l’accueil.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retourner à l’accueil
      </Link>
    </div>
  );
};
