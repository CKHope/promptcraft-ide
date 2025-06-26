
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import { INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES } from '../../constants';

interface ApiKeyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyManagerModal: React.FC<ApiKeyManagerModalProps> = ({ isOpen, onClose }) => {
    const { apiKeys, addApiKey, deleteApiKey, setActiveApiKey, activeApiKey, showToast } = useAppContext();
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyValue, setNewKeyValue] = useState('');
    const keyNameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(isOpen) {
            setNewKeyName(''); 
            setNewKeyValue('');
            setTimeout(() => keyNameInputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim() || !newKeyValue.trim()) {
            showToast("Key Name and Key Value are required.", "error");
            return;
        }
        const success = await addApiKey(newKeyName, newKeyValue);
        if (success) {
            setNewKeyName('');
            setNewKeyValue('');
            keyNameInputRef.current?.focus(); 
        }
    };

    const getDisplayKey = (key: string) => {
        if (!key) return "N/A";
        return key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : key;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage API Keys" size="xl">
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <label htmlFor="keyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key Name</label>
                    <input
                        type="text"
                        id="keyName"
                        ref={keyNameInputRef}
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., My Gemini Key"
                        className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES}`}
                    />
                </div>
                <div>
                    <label htmlFor="keyValue" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key Value</label>
                    <input
                        type="password"
                        id="keyValue"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="Enter your API key here"
                        className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES}`}
                    />
                </div>
                <button type="submit" className={`px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Add API Key</button>
            </form>

            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3">Saved API Keys:</h3>
            {apiKeys.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No API keys added yet.</p>
            ) : (
                <ul className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                    {apiKeys.map(key => (
                        <li key={key.id} className={`p-3 rounded-lg flex justify-between items-center ${activeApiKey?.id === key.id ? 'bg-emerald-50 dark:bg-emerald-800/40 border border-emerald-300 dark:border-emerald-700' : 'bg-slate-100 dark:bg-slate-700/60 border border-transparent'}`}>
                            <div>
                                <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{key.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Key: {getDisplayKey(key.encryptedKey)}</p>
                            </div>
                            <div className="flex gap-2">
                                {activeApiKey?.id !== key.id && (
                                    <button onClick={() => setActiveApiKey(key.id)} className={`text-xs px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>Set Active</button>
                                )}
                                <button onClick={() => deleteApiKey(key.id)} className={`text-xs px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {activeApiKey && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">Active key: {activeApiKey.name}</p>}
        </Modal>
    );
};

export default ApiKeyManagerModal;
