import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { AdminService, ImportBatchSummary } from '../../services/admin.service';
import { ImportBatchStatus } from '../../components/admin/ImportBatchStatus';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export const AdminImportPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const { success, error } = useToast();

  const loadBatches = async () => {
    try {
      const data = await AdminService.getBatches();
      setBatches(data);
    } catch {
      // Ignorer
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
    } catch (err: any) {
      error(err?.response?.data?.error?.message || 'Échec de l’importation du lot');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-primary-600" />
          <span>Import Massif de Fiches Pédagogiques</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          Téléversez des lots de documents PDF. Les fiches seront analysées et créées en statut Brouillon.
        </p>
      </div>

      {/* Guide de Nommage Officiel */}
      <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 text-xs text-primary-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Format de nommage recommandé pour le découpage automatique :</p>
          <code className="inline-block px-2 py-1 rounded bg-white font-mono text-[11px] text-primary-800 border border-primary-200">
            Niveau_Matiere_SemaineXX_Titre.pdf (Ex: CM2_Maths_Semaine12_Fractions.pdf)
          </code>
        </div>
      </div>

      {/* Zone de Téléversement */}
      <div className="bg-background-card rounded-2xl border-2 border-dashed border-border-default hover:border-primary-400 p-8 text-center transition-colors">
        <UploadCloud className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-text-primary">
          Glissez-déposez vos fichiers PDF ici
        </h3>
        <p className="text-xs text-text-muted mt-1 mb-4">
          ou cliquez pour sélectionner plusieurs fichiers depuis votre ordinateur
        </p>

        <input
          type="file"
          id="bulkPdfInput"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="bulkPdfInput">
          <span className="inline-flex items-center justify-center font-medium rounded-lg text-xs sm:text-sm px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-text-inverse shadow-card cursor-pointer transition-all">
            Sélectionner les PDF
          </span>
        </label>
      </div>

      {/* Fichiers Sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="bg-background-card rounded-2xl border border-border-default p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-text-primary">
              {selectedFiles.length} fichier(s) prêt(s) à être importé(s)
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUpload}
              isLoading={isUploading}
            >
              Lancer l'import du lot
            </Button>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-border-subtle">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                  <span className="font-mono text-text-primary truncate">{file.name}</span>
                  <span className="text-text-muted">({(file.size / 1024).toFixed(0)} Ko)</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1 text-text-muted hover:text-status-danger-text rounded"
                  aria-label="Supprimer de la sélection"
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
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-text-primary">Historique des Lots Traités</h2>
          <div className="space-y-4">
            {batches.map((b) => (
              <ImportBatchStatus key={b.id} batch={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
