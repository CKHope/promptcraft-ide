
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import { INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES } from '../../constants';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  existingPresetNames: string[];
}

const SavePresetModal: React.FC<SavePresetModalProps> = ({ isOpen, onClose, onSave, initialName, existingPresetNames }) => {
    const [name, setName] = useState(initialName || '');
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useAppContext();

    useEffect(() => {
        if(isOpen) {
             setName(initialName || '');
            setTimeout(() => nameInputRef.current?.focus(), 0);
        }
    }, [isOpen, initialName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            showToast("Preset name cannot be empty.", "error");
            return;
        }
        if (existingPresetNames.includes(trimmedName) && trimmedName !== initialName) {
            showToast(`A preset named "${trimmedName}" already exists. Please choose a different name.`, "error");
            return;
        }
        onSave(trimmedName);
        onClose();
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialName ? "Update Preset Name" : "Save Execution Preset"} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="presetName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preset Name</label>
                    <input type="text" id="presetName" ref={nameInputRef} value={name} onChange={e => setName(e.target.value)}
                        className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES}`} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className={`px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-lg text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Cancel</button>
                    <button type="submit" className={`px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-sm text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                        {initialName ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SavePresetModal;
