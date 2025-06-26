import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import { Folder } from '../../types';
import { INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES } from '../../constants';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'newFolder' | 'renameFolder';
  parentId?: string | null;
  folderToRename?: Folder;
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, mode, parentId, folderToRename }) => {
    const { addFolder, updateFolder, showToast } = useAppContext();
    const [name, setName] = useState('');
    const folderNameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'renameFolder' && folderToRename) {
                setName(folderToRename.name);
            } else {
                setName('');
            }
            setTimeout(() => folderNameInputRef.current?.focus(), 0);
        }
    }, [isOpen, mode, folderToRename]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast("Folder name cannot be empty.", "error");
            return;
        }
        if (mode === 'newFolder') {
            await addFolder(name, parentId);
        } else if (mode === 'renameFolder' && folderToRename) {
            await updateFolder(folderToRename.id, name, folderToRename.parentId);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'newFolder' ? 'New Folder' : 'Rename Folder'} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="folderName" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Folder Name</label>
                    <input
                        type="text"
                        id="folderName"
                        ref={folderNameInputRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES}`}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className={`px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium rounded-lg text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Cancel</button>
                    <button type="submit" className={`px-5 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-sm text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>{mode === 'newFolder' ? 'Create' : 'Save'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default FolderModal;