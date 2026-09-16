import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Loader2, CheckCircle2, Layers, BookOpen, Sparkles } from 'lucide-react';
import { AdminService, ImportBatchSummary } from '../../../services/admin.service';
import { apiClient } from '../../../api/client';
import { useToast } from '../../ui/Toast';

interface LevelOption {
  id: string;
  code: string;
  label: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

export const AdminImportView: React.FC = () => {
  const [mode, setMode] = useState<'bulk_class' | 'targeted'>('bulk_class');
  const [levels, setLevels] = useState<LevelOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchPedagogy = async () => {
      try {
        const res = await apiClient.get('/levels');
        const list = res.data?.data || [];
        setLevels(list);
        if (list.length > 0) setSelectedLevelId(list[0].id);
      } catch {
        // Mode silencieux
      }
    };
    fetchPedagogy();
    loadBatches();
  }, []);

  useEffect(() => {
    if (!selectedLevelId) return;
    const fetchSubjects = async () => {
      try {
        const res = await apiClient.get('/subjects', { params: { levelId: selectedLevelId } });
        const list = res.data?.data || [];
        setSubjects(list);
        if (list.length > 0) setSelectedSubjectId(list[0].id);
        else setSelectedSubjectId('');
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [selectedLevelId]);

  const loadBatches = async () => {
    try {
      const data = await AdminService.getBatches();
      setBatches(data);
    } catch {
      // Mode silencieux
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(
        (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
      );
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      const options: { primaryLevelId?: string; subjectId?: string } = {};
      if (selectedLevelId) options.primaryLevelId = selectedLevelId;
      if (mode === 'targeted' && selectedSubjectId) options.subjectId = selectedSubjectId;

      const createdBatch = await AdminService.uploadBatch(selectedFiles, options);
      success(`Lot "${createdBatch.batchName}" importé avec succès (${createdBatch.successfulFiles} réussis)`);
      setSelectedFiles([]);
      await loadBatches();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: { message?: string } } } };
      error(errObj.response?.data?.error?.message || 'Échec de l’importation du lot');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-left">
      {/* En-tête */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-blue-400" />
          <span>Importation Pédagogique Intelligente</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Téléversement unitaire ou par lot de fichiers PDF avec indexation automatique en Brouillon
        </p>
      </div>

      {/* Sélecteur de Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode('bulk_class')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'bulk_class'
              ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <Sparkles className={`w-4 h-4 ${mode === 'bulk_class' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Mode 1 : Lot par Classe (Reconnaissance Auto)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Choisis la classe (ex: CM1) et dépose tous les PDF. La matière est extraite automatiquement.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode('targeted')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'targeted'
              ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <BookOpen className={`w-4 h-4 ${mode === 'targeted' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>Mode 2 : Formulaire Ciblé (Classe & Matière)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Sélectionne explicitement la classe et la matière avant d’ajouter tes fiches.
          </p>
        </button>
      </div>

      {/* Formulaire de Configuration du Lot */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Classe Cible (Niveau)</span>
          </label>
          <select
            value={selectedLevelId}
            onChange={(e) => setSelectedLevelId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.code} - {lvl.label}
              </option>
            ))}
          </select>
        </div>

        {mode === 'targeted' ? (
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Matière Pédagogique</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mr-2" />
            <span>Matières détectées automatiquement (EDHC, Maths, Histoire-Géo, Français, Sciences...)</span>
          </div>
        )}
      </div>

      {/* Zone de Téléversement Drag & Drop */}
      <div className="bg-slate-800/90 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500/60 p-8 text-center transition-all shadow-xl">
        <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-2 animate-pulse" />
        <h3 className="text-sm sm:text-base font-bold text-white">
          Glissez-déposez vos fichiers PDF ici
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Sélection multiple autorisée (jusqu’à 50 documents par lot)
        </p>

        <input
          type="file"
          id="bulkPdfInputOverlay"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="bulkPdfInputOverlay">
          <span className="inline-flex items-center justify-center font-bold rounded-xl text-xs px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 cursor-pointer transition-all active:scale-95">
            Sélectionner les PDF
          </span>
        </label>
      </div>

      {/* Fichiers Sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">
              {selectedFiles.length} document(s) prêt(s) pour traitement
            </h3>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importation en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lancer l’import du lot</span>
                </>
              )}
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-700/60 pr-1">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-mono text-slate-200 truncate">{file.name}</span>
                  <span className="text-slate-500 font-medium">({(file.size / 1024).toFixed(0)} Ko)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  aria-label="Retirer ce fichier"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique des Lots */}
      {batches.length > 0 && (
        <div className="space-y-3 pt-2">
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
      )}
    </div>
  );
};
