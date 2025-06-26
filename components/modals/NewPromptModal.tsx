
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import FolderSelectComponent from '../FolderSelectComponent';
import { XMarkIcon, INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES, BoltIcon, YELLOW_BUTTON_FOCUS_CLASSES } from '../../constants';
import * as geminiService from '../../services/geminiService';

interface NewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCreationMode?: 'blank' | 'abTest' | 'chainBlueprint';
  initialContent?: string; 
  initialTitle?: string;
  initialNotes?: string;
  initialTagNames?: string[];
}

const NewPromptModal: React.FC<NewPromptModalProps> = ({ 
    isOpen, 
    onClose, 
    initialCreationMode = 'blank', 
    initialContent,
    initialTitle,
    initialNotes,
    initialTagNames
}) => {
  const { addPrompt, showToast, folders, currentFolderId, activeApiKey, showGlobalLoader, hideGlobalLoader, isGlobalLoading } = useAppContext();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [notes, setNotes] = useState(initialNotes || '');
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(initialTagNames || []);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId === undefined ? null : currentFolderId);
  const [creationMode, setCreationMode] = useState<'blank' | 'abTest' | 'chainBlueprint'>(initialCreationMode);

  useEffect(() => {
      if (isOpen) {
          setCreationMode(initialCreationMode);
          setSelectedFolderId(currentFolderId === undefined ? null : currentFolderId);
          
          setTitle(initialTitle || '');
          setNotes(initialNotes || '');
          setSelectedTagNames(initialTagNames || []);

          if (initialCreationMode === 'chainBlueprint' && initialContent) {
              setContent(initialContent);
              if (!initialTitle) setTitle("New Orchestrator Prompt"); 
          } else if (initialContent !== undefined) { // For AI generated or other pre-fills
              setContent(initialContent);
          } else {
              setContent(''); 
          }
          setTimeout(() => titleInputRef.current?.focus(), 0);
      } else {
         resetForm();
      }
  }, [currentFolderId, isOpen, initialCreationMode, initialContent, initialTitle, initialNotes, initialTagNames]);

  const resetForm = () => {
    setTitle(''); setContent(''); setNotes(''); setCurrentTagInput(''); setSelectedTagNames([]);
    setSelectedFolderId(currentFolderId === undefined ? null : currentFolderId);
    setCreationMode('blank'); 
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTagName = currentTagInput.trim();
      if (newTagName && !selectedTagNames.includes(newTagName)) {
        setSelectedTagNames([...selectedTagNames, newTagName]);
      }
      setCurrentTagInput('');
    }
  };

  const removeTag = (tagName: string) => { 
    setSelectedTagNames(selectedTagNames.filter(tag => tag !== tagName));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('Title is required.', 'error');
      return;
    }
    
    if (creationMode === 'blank' && !content.trim() && !initialContent) { 
        showToast('Content is required for a blank prompt.', 'error');
        return;
    }

    const newPromptData: Parameters<typeof addPrompt>[0] = {
        title,
        content: content || (creationMode === 'abTest' ? "Initial content for A/B Test." : (creationMode === 'chainBlueprint' ? "Orchestrator prompt. Define steps in Visual Chain Builder." : "")),
        notes,
        tagNames: selectedTagNames,
        folderId: selectedFolderId,
        _initialEditorMode: creationMode === 'blank' ? undefined : creationMode,
    };
    
    const newPrompt = await addPrompt(newPromptData);
    if (newPrompt) {
      resetForm();
      onClose();
    }
  };

  const handleAiGenerateForCurrentModal = async () => {
    if (!activeApiKey || !activeApiKey.encryptedKey) {
      showToast("No active API key. Please set one in Manage API Keys.", "error");
      // Consider opening API key manager if desired: onOpenModal('apiKeyManager');
      return;
    }
    showGlobalLoader("AI is crafting an idea for this prompt...");
    try {
      const idea = await geminiService.generatePromptIdea(activeApiKey.encryptedKey);
      setTitle(idea.title);
      setContent(idea.content);
      setNotes(idea.notes || '');
      setSelectedTagNames(idea.suggestedTags || []);
      showToast("AI prompt idea generated! Fields have been populated.", "success");
    } catch (error: any) {
      console.error("AI Generate for NewPromptModal error:", error);
      showToast(`Failed to generate prompt idea: ${error.message}`, "error");
    } finally {
      hideGlobalLoader();
    }
  };

  const modalTitle = creationMode === 'abTest' 
    ? "New A/B Test Blueprint" 
    : creationMode === 'chainBlueprint' 
    ? "New Orchestrator Prompt" 
    : "Create New Prompt";

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose();}} title={modalTitle} size="lg">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div>
          <label htmlFor="newPromptTitle" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            {creationMode === 'abTest' ? 'Title for A/B Test' : (creationMode === 'chainBlueprint' ? 'Orchestrator Prompt Title' : 'Title')}
          </label>
          <input type="text" id="newPromptTitle" value={title} onChange={(e) => setTitle(e.target.value)} required ref={titleInputRef}
            className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES}`} />
        </div>
        
        {(creationMode === 'blank' || creationMode === 'abTest' || initialContent !== undefined) && ( 
            <div>
              <label htmlFor="newPromptContent" className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                {creationMode === 'abTest' ? 'Initial Content for Prompt A' : (creationMode === 'chainBlueprint' ? 'Initial Orchestrator Content' : 'Content')}
              </label>
              <textarea id="newPromptContent" value={content} onChange={(e) => setContent(e.target.value)} rows={6} 
                required={creationMode === 'blank' && !initialContent}
                placeholder={creationMode === 'abTest' ? "Optional. Will be copied to Prompt B if A/B mode is started." : (creationMode === 'chainBlueprint' ? "This content will be used as the starting point." : "")}
                className={`${INPUT_BASE_CLASSES} px-3 py-2 resize-y ${INPUT_FOCUS_CLASSES}`} 
                readOnly={creationMode === 'chainBlueprint' && !!initialContent && !title.startsWith("New Orchestrator Prompt")} 
              />
              {(creationMode !== 'chainBlueprint' || !initialContent) && 
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">Use <code className="text-xs bg-[var(--bg-input-secondary-main)] text-[var(--accent1)] p-0.5 rounded">{'{{variable}}'}</code> or <code className="text-xs bg-[var(--bg-input-secondary-main)] text-[var(--accent1)] p-0.5 rounded">{'{{promptOutput:ID}}'}</code>.</p>
              }
            </div>
        )}
         {creationMode === 'chainBlueprint' && !initialContent && ( 
            <p className="text-sm text-[var(--text-secondary)] p-3 bg-[var(--bg-input-secondary-main)] rounded-lg">
                An Orchestrator Prompt will be created. Use the Visual Chain Builder (from the Prompt Editor) to define its steps and connections.
            </p>
        )}
        <div>
          <label htmlFor="newPromptNotes" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes (Optional)</label>
          <textarea id="newPromptNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            className={`${INPUT_BASE_CLASSES} px-3 py-2 resize-y ${INPUT_FOCUS_CLASSES}`} />
        </div>

        <div>
          <label htmlFor="newPromptFolderSelect" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Folder</label>
           <FolderSelectComponent
            id="newPromptFolderSelect"
            value={selectedFolderId}
            onChange={(folderId) => setSelectedFolderId(folderId)}
            folders={folders}
          />
        </div>
        <div>
          <label htmlFor="newPromptTagsInput" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tags</label>
          <div className={`flex flex-wrap gap-2 mb-2 p-2.5 border rounded-lg min-h-[44px] ${INPUT_BASE_CLASSES} ${INPUT_FOCUS_CLASSES}`}>
            {selectedTagNames.map(tagName => (
              <span key={tagName} className="flex items-center bg-[var(--accent1)] bg-opacity-20 text-[var(--button-primary-text)] text-xs px-2 py-1 rounded-full">
                {tagName}
                <button
                    type="button"
                    onClick={() => removeTag(tagName)}
                    aria-label={`Remove tag ${tagName}`}
                    className={`ml-1.5 p-0.5 text-[var(--button-primary-text)] hover:text-opacity-70 rounded-full ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
             <input type="text" id="newPromptTagsInput" value={currentTagInput} onChange={(e) => setCurrentTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
            placeholder={selectedTagNames.length === 0 ? "Add tags (type and press Enter)" : ""}
            className="flex-grow p-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)]" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleAiGenerateForCurrentModal}
            disabled={isGlobalLoading || !activeApiKey}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--accent-special)] hover:bg-opacity-80 text-black font-semibold rounded-lg shadow-sm transition-colors text-sm ${YELLOW_BUTTON_FOCUS_CLASSES} disabled:opacity-60 disabled:cursor-not-allowed`}
            title="Populate fields with an AI-generated idea"
          >
            <BoltIcon className="w-4 h-4" /> AI Generate Idea
          </button>
          <button type="button" onClick={() => { resetForm(); onClose();}} className={`px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Cancel</button>
          <button type="submit" className={`px-5 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>
            {creationMode === 'chainBlueprint' ? "Create Orchestrator & Open" : "Create Prompt"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewPromptModal;
