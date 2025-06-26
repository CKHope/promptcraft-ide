import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import { Prompt, PromptVersion } from '../../types';
import DiffView from '../DiffView'; 
import { INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES } from '../../constants';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose, prompt }) => {
  const { getPromptVersions, restorePromptVersion, namePromptVersion, showToast } = useAppContext();
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null); // Changed to string
  const [commitMessageInput, setCommitMessageInput] = useState('');
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<PromptVersion | null>(null);

  const fetchVersions = useCallback(async () => {
    if (isOpen && prompt) {
      setLoading(true);
      setSelectedVersionForDiff(null);
      try {
        const fetchedVersions = await getPromptVersions(prompt.id);
        setVersions(fetchedVersions);
      } finally {
        setLoading(false);
      }
    }
  }, [isOpen, prompt, getPromptVersions]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestore = async (versionId?: string) => { // Changed to string
    if (typeof versionId === 'string') { // Changed to string
      await restorePromptVersion(versionId);
      onClose();
    }
  };

  const handleEditNameClick = (version: PromptVersion) => {
    setEditingVersionId(version.id); // version.id is string
    setCommitMessageInput(version.commitMessage || '');
  };

  const handleSaveName = async (versionId: string) => { // Changed to string
    if (!commitMessageInput.trim()) {
        showToast("Commit message cannot be empty.", "error");
    }
    await namePromptVersion(versionId, commitMessageInput.trim());
    setEditingVersionId(null);
    setCommitMessageInput('');
    fetchVersions();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Version History: "${prompt?.title || ''}"`} size="xl">
      {loading && <p role="status" className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Loading versions...</p>}
      {!loading && versions.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No version history for this prompt.</p>}


      {selectedVersionForDiff && prompt && (
        <div className="my-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-100">Comparing Version from <time dateTime={selectedVersionForDiff.created_at}>{new Date(selectedVersionForDiff.created_at).toLocaleString()}</time> with Current</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                    <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Selected Version</h4>
                    <pre className="text-xs whitespace-pre-wrap bg-[var(--bg-input-main)] p-2.5 rounded-md max-h-32 overflow-y-auto border border-[var(--border-color)] text-[var(--text-primary)]">{selectedVersionForDiff.content}</pre>
                    {selectedVersionForDiff.notes && <pre className="mt-1.5 text-xs whitespace-pre-wrap bg-[var(--bg-input-main)] p-2.5 rounded-md max-h-20 overflow-y-auto border border-[var(--border-color)] text-[var(--text-primary)]">Notes: {selectedVersionForDiff.notes}</pre>}
                </div>
                 <div>
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Current Prompt</h4>
                    <pre className="text-xs whitespace-pre-wrap bg-[var(--bg-input-main)] p-2.5 rounded-md max-h-32 overflow-y-auto border border-[var(--border-color)] text-[var(--text-primary)]">{prompt.content}</pre>
                    {prompt.notes && <pre className="mt-1.5 text-xs whitespace-pre-wrap bg-[var(--bg-input-main)] p-2.5 rounded-md max-h-20 overflow-y-auto border border-[var(--border-color)] text-[var(--text-primary)]">Notes: {prompt.notes}</pre>}
                </div>
            </div>
            <DiffView text1={selectedVersionForDiff.content} text2={prompt.content} type="Content" />
            {(selectedVersionForDiff.notes || prompt.notes) && <DiffView text1={selectedVersionForDiff.notes || ''} text2={prompt.notes || ''} type="Notes" />}
            <button onClick={() => setSelectedVersionForDiff(null)} className={`mt-2 text-xs px-2.5 py-1.5 bg-slate-400 hover:bg-slate-500 text-white rounded-md ${COMMON_BUTTON_FOCUS_CLASSES}`}>Close Diff</button>
        </div>
      )}

      {!loading && versions.length > 0 && (
        <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {versions.map(version => {
            const versionContentId = `version-content-${version.id}`;
            return (
            <li key={version.id} className="p-3 bg-slate-100 dark:bg-slate-700/80 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Version from: <time dateTime={version.created_at}>{new Date(version.created_at).toLocaleString()}</time>
                    </p>
                    {editingVersionId === version.id ? (
                        <div className="mt-1.5 flex gap-2 items-center">
                            <input
                                type="text"
                                value={commitMessageInput}
                                onChange={(e) => setCommitMessageInput(e.target.value)}
                                placeholder="Enter commit message..."
                                className={`${INPUT_BASE_CLASSES} flex-grow px-2 py-1 text-xs ${INPUT_FOCUS_CLASSES}`}
                            />
                            <button onClick={() => handleSaveName(version.id)} className={`text-xs px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>Save</button>
                            <button onClick={() => setEditingVersionId(null)} className={`text-xs px-2.5 py-1 bg-slate-400 hover:bg-slate-500 text-white rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>Cancel</button>
                        </div>
                    ) : (
                        version.commitMessage ? (
                            <p className="text-xs italic text-indigo-600 dark:text-indigo-400 mt-0.5" title="Commit Message">"{version.commitMessage}"
                                <button onClick={() => handleEditNameClick(version)} className={`ml-2 text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 text-xs rounded ${COMMON_BUTTON_FOCUS_CLASSES}`}>(edit)</button>
                            </p>
                        ) : (
                            <button onClick={() => handleEditNameClick(version)} className={`text-xs text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 mt-0.5 underline rounded ${COMMON_BUTTON_FOCUS_CLASSES}`}>Add Name</button>
                        )
                    )}
                </div>
                <div className="flex gap-2 self-start">
                    <button onClick={() => setSelectedVersionForDiff(version)} className={`text-xs px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>Diff</button>
                    <button onClick={() => handleRestore(version.id)} className={`text-xs px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>Restore</button>
                </div>
              </div>
              <details className="text-xs text-slate-600 dark:text-slate-400">
                  <summary className={`cursor-pointer hover:underline rounded ${COMMON_BUTTON_FOCUS_CLASSES}`} aria-controls={versionContentId}>View Content & Notes</summary>
                  <div id={versionContentId} className="mt-1 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Content:</p>
                    <pre className="whitespace-pre-wrap bg-[var(--bg-input-main)] p-2 rounded-sm max-h-24 overflow-y-auto border border-[var(--border-color)] text-[var(--text-primary)]">{version.content}</pre>
                    {version.notes && <>
                      <p className="mt-1.5 font-semibold text-slate-700 dark:text-slate-300">Notes:</p>
                      <pre className="whitespace-pre-wrap bg-[var(--bg-input-main)] p-2 rounded-sm max-h-24 overflow-y-auto border border-[var(--border-color)] text-[var(--text-primary)]">{version.notes}</pre>
                    </>}
                  </div>
              </details>
            </li>
          )})}
        </ul>
      )}
    </Modal>
  );
};

export default VersionHistoryModal;