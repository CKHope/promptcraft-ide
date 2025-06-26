
import React, { useRef, useState } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import { ExportData } from '../../types';
import { COMMON_BUTTON_FOCUS_CLASSES, INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES } from '../../constants';

interface DataPortabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
}

const DataPortabilityModal: React.FC<DataPortabilityModalProps> = ({ isOpen, onClose, mode }) => {
  const { exportData, importData, showToast } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModeRadio, setImportModeRadio] = useState<'merge' | 'overwrite'>('merge');

  const handleExport = async () => {
    try {
      const data = await exportData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptcraft_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      showToast('Export failed.', 'error');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const parsedData = JSON.parse(text) as ExportData;
        if (!parsedData || !parsedData.schema_version || !parsedData.prompts || !parsedData.tags) {
            showToast('Invalid import file format.', 'error');
            return;
        }
        await importData(parsedData, importModeRadio);
        onClose();
      } catch (error) {
        console.error("Import failed:", error);
        showToast('Import failed. Make sure the file is a valid JSON export.', 'error');
      } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'import' ? 'Import Data' : 'Export Data'} size="md">
      {mode === 'export' ? (
        <div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            This will download a JSON file containing all your prompts, tags, versions, folders, and execution presets.
          </p>
          <button
            onClick={handleExport}
            className={`w-full px-5 py-2.5 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}
          >
            Download Export File
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="importFile" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Select JSON file to import:</label>
            <input
              type="file"
              id="importFile"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className={`${INPUT_BASE_CLASSES} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent1)] file:text-[var(--button-primary-text)] hover:file:bg-[var(--accent2)] ${INPUT_FOCUS_CLASSES}`}
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-[var(--text-primary)] mb-2">Import Mode:</p>
            <div className="flex items-center gap-x-6">
              <div className="flex items-center">
                <input
                  id="import-merge"
                  name="import-mode"
                  type="radio"
                  value="merge"
                  checked={importModeRadio === 'merge'}
                  onChange={() => setImportModeRadio('merge')}
                  className={`h-4 w-4 border-[var(--border-color)] text-[var(--accent1)] focus:ring-[var(--interactive-focus-ring)] ${COMMON_BUTTON_FOCUS_CLASSES}`}
                />
                <label htmlFor="import-merge" className="ml-2 block text-sm text-[var(--text-secondary)]">
                  Merge <span className="text-xs text-[var(--text-tertiary)]">(Adds new data, updates existing by ID where possible)</span>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="import-overwrite"
                  name="import-mode"
                  type="radio"
                  value="overwrite"
                  checked={importModeRadio === 'overwrite'}
                  onChange={() => setImportModeRadio('overwrite')}
                  className={`h-4 w-4 border-[var(--border-color)] text-[var(--accent1)] focus:ring-[var(--interactive-focus-ring)] ${COMMON_BUTTON_FOCUS_CLASSES}`}
                />
                <label htmlFor="import-overwrite" className="ml-2 block text-sm text-[var(--text-secondary)]">
                  Overwrite <span className="text-xs text-[var(--text-tertiary)]">(Deletes all current data before importing)</span>
                </label>
              </div>
            </div>
          </div>
           <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 p-2 bg-yellow-500 bg-opacity-10 rounded-md">
            <strong>Warning:</strong> Importing data can be destructive, especially with "Overwrite" mode. It's recommended to back up your current data by exporting it first.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default DataPortabilityModal;
