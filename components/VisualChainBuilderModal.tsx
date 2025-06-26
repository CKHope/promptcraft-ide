import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext'; 
import { Prompt } from '../types';
import { XMarkIcon, PlusIcon, LinkIcon, InformationCircleIcon, COMMON_BUTTON_FOCUS_CLASSES, INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES } from '../constants';

interface VisualChainBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  onApplyContent: (newContent: string) => void;
  promptIdToExclude?: string;
  isNewChainSetup?: boolean; // For Rec 1: Guided Chain Initiation
}

interface ChainStep extends Pick<Prompt, 'id' | 'title'> {}

const VisualChainBuilderModal: React.FC<VisualChainBuilderModalProps> = ({
  isOpen,
  onClose,
  initialContent,
  onApplyContent,
  promptIdToExclude,
  isNewChainSetup = false, // For Rec 1
}) => {
  const { prompts: allPromptsFromContext, showToast, getPromptById } = useAppContext();
  const [chainSteps, setChainSteps] = useState<ChainStep[]>([]);
  const [previewContent, setPreviewContent] = useState('');
  const [availablePromptsSearch, setAvailablePromptsSearch] = useState('');
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  const [showStructurePreview, setShowStructurePreview] = useState(false); // For Rec 3
  const [structurePreviewText, setStructurePreviewText] = useState(''); // For Rec 3


  useEffect(() => {
    if (isOpen) {
      const effectiveInitialContent = isNewChainSetup && initialContent.includes("STEP_1_PLACEHOLDER_ID")
        ? "This Orchestrator Prompt will manage a sequence of Step Prompts.\nDefine your overall goal and how outputs from steps connect." // Cleaner start for totally new chain
        : initialContent;
      setPreviewContent(effectiveInitialContent);
      
      const initialSteps: ChainStep[] = [];
      const seenIds = new Set<string>();
      const regex = /{{\s*promptOutput:\s*([a-zA-Z0-9-]+)\s*}}/g;
      let match;
      while ((match = regex.exec(initialContent)) !== null) { // Use original initialContent for parsing existing chains
        const id = match[1];
        if (id !== "STEP_1_PLACEHOLDER_ID" && !seenIds.has(id)) {
          const prompt = allPromptsFromContext.find(p => p.id === id);
          if (prompt && prompt.id !== promptIdToExclude) {
            initialSteps.push({ id: prompt.id, title: prompt.title });
            seenIds.add(id);
          }
        }
      }
      setChainSteps(initialSteps);
      setAvailablePromptsSearch('');
      setDraggedItemId(null);
      setDragOverItemId(null);
      setShowStructurePreview(false); // Reset preview visibility
    }
  }, [isOpen, initialContent, allPromptsFromContext, promptIdToExclude, isNewChainSetup]);

  // Rec 3: Update Structure Preview Text
  useEffect(() => {
    const generatePreview = async () => {
      let tempPreview = previewContent;
      const regex = /{{\s*promptOutput:\s*([a-zA-Z0-9-]+)\s*}}/g;
      let match;
      const replacements = new Map<string, string>();

      const placeholders = new Set<string>();
      while ((match = regex.exec(tempPreview)) !== null) {
        placeholders.add(match[0]);
      }
      regex.lastIndex = 0; 

      for (const placeholder of placeholders) {
        const idMatch = /{{\s*promptOutput:\s*([a-zA-Z0-9-]+)\s*}}/.exec(placeholder);
        if (idMatch && idMatch[1]) {
          const promptId = idMatch[1];
          const prompt = allPromptsFromContext.find(p => p.id === promptId) || await getPromptById(promptId);
          replacements.set(placeholder, `>>> [Output of: "${prompt ? prompt.title : 'Unknown Prompt'}" (ID: ${promptId})] <<<`);
        }
      }
      
      replacements.forEach((replacementText, placeholder) => {
        const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        tempPreview = tempPreview.replace(new RegExp(escapedPlaceholder, 'g'), replacementText);
      });
      setStructurePreviewText(tempPreview);
    };

    if (showStructurePreview) {
      generatePreview();
    }
  }, [previewContent, showStructurePreview, allPromptsFromContext, getPromptById]);


  const availablePrompts = allPromptsFromContext
    .filter(p => p.id !== promptIdToExclude)
    .filter(p =>
        p.title.toLowerCase().includes(availablePromptsSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(availablePromptsSearch.toLowerCase())
    )
    .sort((a,b) => a.title.localeCompare(b.title));

  const insertTextAtCursor = (textToInsert: string) => {
    if (!contentTextAreaRef.current) return;
    const textarea = contentTextAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = previewContent.substring(0, start) + textToInsert + previewContent.substring(end);

    setPreviewContent(newText);

    const newCursorPosition = start + textToInsert.length;
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };
  
  const handleAddStepOnly = (prompt: Pick<Prompt, 'id' | 'title'>) => {
    if (chainSteps.find(step => step.id === prompt.id)) {
        showToast(`"${prompt.title}" is already in the chain steps.`, "info");
        return;
    }
    setChainSteps(prev => [...prev, { id: prompt.id, title: prompt.title }]);
    showToast(`"${prompt.title}" added to chain steps.`, "success");
  };

  const handleAddStepAndInsertOutput = (prompt: Pick<Prompt, 'id' | 'title'>) => {
    const isAlreadyInChain = chainSteps.some(step => step.id === prompt.id);
    if (!isAlreadyInChain) {
        setChainSteps(prev => [...prev, { id: prompt.id, title: prompt.title }]);
    }
    const placeholder = `{{promptOutput:${prompt.id}}}`;
    insertTextAtCursor(placeholder);
    if (!isAlreadyInChain) {
      showToast(`"${prompt.title}" added to chain and placeholder inserted.`, "success");
    } else {
      showToast(`Placeholder for "${prompt.title}" inserted.`, "success");
    }
  };


  const handleRemoveStep = (idToRemove: string) => {
    setChainSteps(prev => prev.filter(step => step.id !== idToRemove));
  };

  const handleApply = () => {
    if (isNewChainSetup && previewContent.includes("STEP_1_PLACEHOLDER_ID")) {
        showToast("Please add at least one Step Prompt to your new Orchestrator Prompt.", "error");
        return;
    }
    onApplyContent(previewContent);
    onClose();
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== id) {
        setDragOverItemId(id);
        e.dataTransfer.dropEffect = 'move';
    } else {
        setDragOverItemId(null);
         e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = () => {
      setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    const draggedIndex = chainSteps.findIndex(step => step.id === draggedItemId);
    const targetIndex = chainSteps.findIndex(step => step.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedItemId(null);
        setDragOverItemId(null);
        return;
    }

    const newChainSteps = [...chainSteps];
    const [draggedItem] = newChainSteps.splice(draggedIndex, 1);
    newChainSteps.splice(targetIndex, 0, draggedItem);

    setChainSteps(newChainSteps);
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };
  
  const modalTitle = isNewChainSetup ? "Create New Orchestrator Prompt" : "Build Prompt Chain"; 

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
      <div className="flex flex-col md:flex-row gap-6 min-h-[65vh]"> 
        <div className="w-full md:w-2/5 space-y-4 p-3 bg-[var(--bg-input-secondary-main)] rounded-lg"> 
          <div>
            <h3 className="text-md font-semibold text-[var(--text-primary)] mb-2">Chain Steps (Drag to reorder)</h3>
            {chainSteps.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] py-2">
                {isNewChainSetup ? "Add Step Prompts from 'Available Prompts' below to start building your chain." : "No steps added yet."}
              </p>
            ) : (
              <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {chainSteps.map((step, index) => (
                  <li
                    key={step.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, step.id)}
                    onDragOver={(e) => handleDragOver(e, step.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, step.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex justify-between items-center p-2.5 bg-[var(--bg-input-main)] rounded-md text-xs shadow-sm group
                        ${draggedItemId === step.id ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
                        ${dragOverItemId === step.id && draggedItemId !== step.id ? 'ring-2 ring-[var(--interactive-focus-ring)] bg-[var(--accent1)] bg-opacity-20' : ''}
                    `}
                  >
                    <span className="truncate flex-grow text-[var(--text-primary)]" title={step.title}>{index + 1}. {step.title}</span>
                    <div className="flex-shrink-0 flex items-center ml-2">
                        <button
                            onClick={() => handleAddStepAndInsertOutput({id: step.id, title: step.title})} 
                            className={`p-1 text-[var(--accent1)] hover:text-[var(--accent2)] rounded-full ${COMMON_BUTTON_FOCUS_CLASSES} opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}
                            title="Insert Output Placeholder at cursor"
                            aria-label={`Insert placeholder for ${step.title}`}
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleRemoveStep(step.id)}
                            className={`p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300 rounded-full ${COMMON_BUTTON_FOCUS_CLASSES} opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}
                            title="Remove step"
                            aria-label={`Remove step ${step.title}`}>
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <hr className="dark:border-slate-600"/>
          <div>
            <h3 className="text-md font-semibold text-[var(--text-primary)] mb-2">Available Step Prompts</h3>
            <input
              type="search"
              value={availablePromptsSearch}
              onChange={(e) => setAvailablePromptsSearch(e.target.value)}
              placeholder="Search available prompts..."
              className={`${INPUT_BASE_CLASSES} px-3 py-1.5 mb-2 text-xs ${INPUT_FOCUS_CLASSES}`}
            />
            {availablePrompts.length === 0 && availablePromptsSearch && (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-2">No prompts match.</p>
            )}
            <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {availablePrompts.map(prompt => (
                <li key={prompt.id}>
                  <div
                    className={`w-full text-left p-2.5 bg-[var(--available-prompt-item-bg)] hover:bg-[var(--available-prompt-item-bg-hover)] rounded-md text-xs flex items-center justify-between group transition-colors duration-150 ${chainSteps.some(cs => cs.id === prompt.id) ? 'opacity-60' : ''}`}
                  >
                    <span className="truncate flex-grow text-[var(--available-prompt-item-text)]" title={prompt.title}>{prompt.title}</span>
                    <div className="flex-shrink-0 flex items-center ml-2 space-x-1">
                        <button
                            onClick={() => handleAddStepOnly(prompt)}
                            disabled={chainSteps.some(cs => cs.id === prompt.id)}
                            className={`p-1.5 rounded-md text-green-500 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed ${COMMON_BUTTON_FOCUS_CLASSES} ${chainSteps.some(cs => cs.id === prompt.id) ? 'opacity-30' : 'opacity-0 group-hover:opacity-100'} focus-within:opacity-100 transition-opacity`}
                            title="Add to Chain Steps list"
                            aria-label={`Add ${prompt.title} to chain steps`}
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleAddStepAndInsertOutput(prompt)}
                            className={`p-1.5 rounded-md text-[var(--accent1)] hover:text-[var(--accent2)] ${COMMON_BUTTON_FOCUS_CLASSES} opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}
                            title="Add to Chain & Insert Output Placeholder"
                            aria-label={`Add ${prompt.title} to chain and insert its placeholder`}
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-3/5 space-y-4 p-3 bg-[var(--bg-input-secondary-main)] rounded-lg flex flex-col"> 
          <div>
            <div className="flex justify-between items-center mb-1.5">
                <h3 className="text-md font-semibold text-[var(--text-primary)]">Orchestrator Prompt Content</h3>
                <div className="relative group">
                    <InformationCircleIcon className="w-4 h-4 text-[var(--text-tertiary)] cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 text-xs bg-black text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                       {
                         "Variables `{{like_this}}` in this Orchestrator Prompt are processed first. Then, `{{promptOutput:ID}}` placeholders are replaced by the AI-generated text from the corresponding Step Prompts. Variables within Step Prompts are independent and use their own defined defaults or require direct editing of that Step Prompt."
                       }
                        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-black rotate-45"></div>
                    </div>
                </div>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mb-2">
              Compose your Orchestrator Prompt here. Use the buttons on Step Prompts (left) to insert their output placeholders <code className="text-xs bg-[var(--bg-input-main)] p-0.5 rounded">{`{{promptOutput:ID}}`}</code>.
            </p>
            <textarea
              ref={contentTextAreaRef}
              value={previewContent}
              onChange={(e) => setPreviewContent(e.target.value)}
              rows={12}
              className={`${INPUT_BASE_CLASSES} px-3 py-2 resize-y ${INPUT_FOCUS_CLASSES} min-h-[200px] flex-grow`}
              placeholder="Example: The analysis from {{promptOutput:some_id}} suggests..."
            />
          </div>
          
          <div className="mt-3">
            <button 
                onClick={() => setShowStructurePreview(!showStructurePreview)}
                className={`text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
                {showStructurePreview ? "Hide" : "Show"} Structure Preview
                <InformationCircleIcon className="w-3 h-3" title="This shows how placeholders will be substituted, not an AI execution."/>
            </button>
            {showStructurePreview && (
                <div className="mt-1.5 p-2.5 border border-dashed border-[var(--border-color-strong)] rounded-md bg-[var(--bg-input-main)] text-xs text-[var(--text-tertiary)] max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{structurePreviewText || "Type in the content editor to see the structure preview."}</pre>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
        <button type="button" onClick={onClose} className={`px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Cancel</button>
        <button type="button" onClick={handleApply} className={`px-5 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>
            {isNewChainSetup ? "Create & Open in Editor" : "Apply to Prompt Editor"}
        </button>
      </div>
    </Modal>
  );
};

export default VisualChainBuilderModal;