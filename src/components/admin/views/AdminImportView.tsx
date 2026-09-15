import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { AdminService, ImportBatchSummary } from '../../../services/admin.service';
import { useToast } from '../../ui/Toast';

export const AdminImportView: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const { success, error } = useToast();

  const loadBatches = async () => {
    try {
      const data = await AdminService.getBatches();
      setBatches(data);
    } catch {
      // Mode silencieux
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

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
      const createdBatch = await AdminService.uploadBatch(selectedFiles);
      success(`Lot "${createdBatch.batchName}" importé avec succès`);
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
          <span>Importation Massive de Fiches Pédagogiques</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Téléversement par lot de fichiers PDF avec indexation automatique en Brouillon
        </p>
      </div>

      {/* Guide de Nommage Officiel */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Nomenclature recommandée pour la reconnaissance automatique :</p>
          <code className="inline-block px-2.5 py-1 rounded-lg bg-slate-900/80 font-mono text-[11px] text-blue-300 border border-blue-500/30">
            Niveau_Matiere_SemaineXX_Titre.pdf (Ex: CM2_Maths_Semaine12_Fractions.pdf)
          </code>
        </div>
      </div>

      {/* Zone de Téléversement Drag & Drop */}
      <div className="bg-slate-800/90 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500/60 p-8 sm:p-12 text-center transition-all shadow-xl">
        <UploadCloud className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base sm:text-lg font-bold text-white">
          Glissez-déposez vos fichiers PDF ici
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
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
          <span className="inline-flex items-center justify-center font-bold rounded-xl text-xs sm:text-sm px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 cursor-pointer transition-all active:scale-95">
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
