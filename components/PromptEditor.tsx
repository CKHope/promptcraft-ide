import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Prompt, ModelConfig, LinkedOutput, ResultLabel } from '../types';
import * as geminiService from '../services/geminiService';
import FolderSelectComponent from './FolderSelectComponent';
import ExecutionBlock from './ExecutionBlock'; // Import the new component
import DiffView from './DiffView';
import ZenModeActionBar from './ZenModeActionBar'; 
import {
    INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES, YELLOW_BUTTON_FOCUS_CLASSES,
    AVAILABLE_MODELS, GEMINI_MODEL_TEXT, DEFAULT_MODEL_CONFIG, MAX_MICRO_HISTORY_LENGTH,
    PROMPT_OUTPUT_REGEX,
    XMarkIcon, ArrowsRightLeftIcon, Cog6ToothIcon, ViewfinderCircleIcon, 
    PlayIcon, ClipboardIcon, ArrowUpTrayIcon, 
    HistoryIcon, StarIconSolid, StarIconOutline, SparklesIcon,
    ChevronUpIcon, ChevronDownIcon
} from '../constants';


// Helper to extract unique variable names only
const extractVariableNames = (content: string): string[] => {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*(?:\|.*?)?}}/g; // Matches variable name, ignoring default part for name extraction
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && !match[1].startsWith('promptOutput:')) {
      matches.add(match[1]);
    }
  }
  return Array.from(matches);
};
// Helper to extract variable names and their optional default values
const getVariablesAndDefaults = (content: string): Record<string, string> => {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*(?:\|\s*(.*?)\s*)?}}/g; // Capture name (group 1) and optional default (group 2)
  const vars: Record<string, string> = {};
  let match;
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1];
    if (varName && !varName.startsWith('promptOutput:')) {
      // Only add if not already present, first occurrence wins for default
      if (!(varName in vars)) {
         vars[varName] = match[2]?.trim() || ''; // Default is match[2] or empty string
      }
    }
  }
  return vars;
};


const PromptEditor: React.FC<{
    prompt: Prompt & { _initialEditorMode?: 'abTest' | 'chainBlueprint' };
}> = ({ prompt }) => {
  const { 
      updatePrompt, tags: allTags, showToast, activeApiKey: activeApiKeyEntry, folders, getPromptById, 
      executionPresets, 
      isZenMode, setIsZenMode, onOpenModal, setSelectedPrompt, prompts: allPromptsFromContext,
      pinPrompt, unpinPrompt, pinnedPromptIds,
      showGlobalLoader, hideGlobalLoader 
  } = useAppContext(); 
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentATextareaRef = useRef<HTMLTextAreaElement>(null);
  const contentBTextareaRef = useRef<HTMLTextAreaElement>(null);
  const snippetsButtonARef = useRef<HTMLButtonElement>(null);
  const snippetsButtonBRef = useRef<HTMLButtonElement>(null);


  const [title, setTitle] = useState(prompt.title);
  const [notes, setNotes] = useState(prompt.notes || '');
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(prompt.folderId || null);
  const [isPromptDetailsVisibleInZen, setIsPromptDetailsVisibleInZen] = useState(false); 


  const [isAbComparisonMode, setIsAbComparisonMode] = useState(false);

  const [resultALabel, setResultALabel] = useState<ResultLabel>(null);
  const [resultBLabel, setResultBLabel] = useState<ResultLabel>(null);


  const [contentA, setContentA] = useState(prompt.content);
  const [modelA, setModelA] = useState<string>(AVAILABLE_MODELS[0]?.id || GEMINI_MODEL_TEXT);
  const [modelConfigA, setModelConfigA] = useState<ModelConfig>({...DEFAULT_MODEL_CONFIG});
  const [currentPresetAId, setCurrentPresetAId] = useState<string | null>(null);
  const [isExecutingA, setIsExecutingA] = useState(false);
  const [executionResultA, setExecutionResultA] = useState<string | null>(null);
  const [executionErrorA, setExecutionErrorA] = useState<string | null>(null);
  const [variablesA, setVariablesA] = useState<string[]>([]); 
  const [variableValuesA, setVariableValuesA] = useState<Record<string, string>>({});
  const [contentAMicroHistory, setContentAMicroHistory] = useState<string[]>([]);
  const [currentAHistoryIndex, setCurrentAHistoryIndex] = useState(-1);
  const [variableWarningsA, setVariableWarningsA] = useState<string[]>([]); 
  const [showSnippetsA, setShowSnippetsA] = useState(false); 
  const [linkedOutputsA, setLinkedOutputsA] = useState<LinkedOutput[]>([]); 
  const [isAutoFillingA, setIsAutoFillingA] = useState(false);


  const [contentB, setContentB] = useState(prompt.content);
  const [modelB, setModelB] = useState<string>(AVAILABLE_MODELS[0]?.id || GEMINI_MODEL_TEXT);
  const [modelConfigB, setModelConfigB] = useState<ModelConfig>({...DEFAULT_MODEL_CONFIG});
  const [currentPresetBId, setCurrentPresetBId] = useState<string | null>(null);
  const [isExecutingB, setIsExecutingB] = useState(false);
  const [executionResultB, setExecutionResultB] = useState<string | null>(null);
  const [executionErrorB, setExecutionErrorB] = useState<string | null>(null);
  const [variablesB, setVariablesB] = useState<string[]>([]); 
  const [variableValuesB, setVariableValuesB] = useState<Record<string, string>>({});
  const [contentBMicroHistory, setContentBMicroHistory] = useState<string[]>([]);
  const [currentBHistoryIndex, setCurrentBHistoryIndex] = useState(-1);
  const [variableWarningsB, setVariableWarningsB] = useState<string[]>([]); 
  const [showSnippetsB, setShowSnippetsB] = useState(false); 
  const [linkedOutputsB, setLinkedOutputsB] = useState<LinkedOutput[]>([]); 
  const [isAutoFillingB, setIsAutoFillingB] = useState(false);
  
  const [showModelConfigA, setShowModelConfigA] = useState(false); 
  const [showModelConfigB, setShowModelConfigB] = useState(false); 
  const isCurrentPromptPinned = pinnedPromptIds.includes(prompt.id);
  const activeApiKeyExists = !!activeApiKeyEntry; 

  useEffect(() => {
    setTitle(prompt.title);
    setNotes(prompt.notes || '');
    setSelectedTagNames(prompt.tags.map(tagId => allTags.find(t => t.id === tagId)?.name).filter(Boolean) as string[]);
    setSelectedFolderId(prompt.folderId || null);
  }, [prompt.title, prompt.notes, prompt.tags, prompt.folderId, allTags]);


  useEffect(() => {
    const newIsAbMode = prompt._initialEditorMode === 'abTest';
    setIsAbComparisonMode(newIsAbMode);
    let effectiveInitialContentA = prompt.content;

    if (prompt._initialEditorMode === 'chainBlueprint' && newIsAbMode) {
      showToast("Chain Blueprint started in A/B mode. Prompt A is the orchestrator.", "info");
    } else if (prompt._initialEditorMode === 'chainBlueprint' && !newIsAbMode) {
      showToast("Chained Prompt Blueprint started. Edit Prompt A.", "info");
    } else if (prompt._initialEditorMode === 'abTest') {
      showToast("A/B Test Blueprint started. Modify Prompt B for variations.", "info");
    }

    setContentA(effectiveInitialContentA);
    setModelA(AVAILABLE_MODELS[0]?.id || GEMINI_MODEL_TEXT);
    setModelConfigA({...DEFAULT_MODEL_CONFIG});
    setCurrentPresetAId(null);
    const varNamesA = extractVariableNames(effectiveInitialContentA);
    const varsWithDefaultsA = getVariablesAndDefaults(effectiveInitialContentA);
    const initialVarValuesA = Object.fromEntries(varNamesA.map(name => [name, varsWithDefaultsA[name] || '']));
    setVariablesA(varNamesA);
    setVariableValuesA(initialVarValuesA);
    resetMicroHistory('A', effectiveInitialContentA);

    setContentB(effectiveInitialContentA); 
    setModelB(AVAILABLE_MODELS[0]?.id || GEMINI_MODEL_TEXT);
    setModelConfigB({...DEFAULT_MODEL_CONFIG});
    setCurrentPresetBId(null);
    const varNamesB = extractVariableNames(effectiveInitialContentA);
    const varsWithDefaultsB = getVariablesAndDefaults(effectiveInitialContentA);
    const initialVarValuesB = Object.fromEntries(varNamesB.map(name => [name, varsWithDefaultsB[name] || '']));
    setVariablesB(varNamesB);
    setVariableValuesB(initialVarValuesB);
    resetMicroHistory('B', effectiveInitialContentA);
    
    setExecutionResultA(null); setExecutionErrorA(null); setIsExecutingA(false); setResultALabel(null); setIsAutoFillingA(false);
    setExecutionResultB(null); setExecutionErrorB(null); setIsExecutingB(false); setResultBLabel(null); setIsAutoFillingB(false);
  
  }, [prompt.id, prompt.content, prompt._initialEditorMode, showToast]);


  useEffect(() => {
    setIsPromptDetailsVisibleInZen(false);
    setShowModelConfigA(false);
    setShowModelConfigB(false);
    if (titleInputRef.current && !isZenMode) {
        titleInputRef.current.focus();
    }
  }, [isZenMode, prompt.id]);


   useEffect(() => { 
    if (!isAbComparisonMode) { 
        setContentB(contentA); 
        setModelB(modelA);
        setVariablesB([...variablesA]); 
        setVariableValuesB({...variableValuesA});
        setModelConfigB({...modelConfigA});
        setCurrentPresetBId(currentPresetAId);
        setExecutionResultB(null); 
        setExecutionErrorB(null);
        setResultBLabel(null);
        setIsAutoFillingB(false);
        resetMicroHistory('B', contentA);
    }
  }, [isAbComparisonMode, contentA, modelA, variablesA, variableValuesA, modelConfigA, currentPresetAId]);


  const extractPromptOutputs = useCallback(async (content: string): Promise<LinkedOutput[]> => {
    const outputs: LinkedOutput[] = [];
    const regex = new RegExp(PROMPT_OUTPUT_REGEX); 
    let match;
    regex.lastIndex = 0; 

    const uniquePlaceholders = new Set<string>();
    while ((match = regex.exec(content)) !== null) {
      uniquePlaceholders.add(match[0]);
    }

    for (const placeholder of Array.from(uniquePlaceholders)) {
        PROMPT_OUTPUT_REGEX.lastIndex = 0; 
        const individualMatch = PROMPT_OUTPUT_REGEX.exec(placeholder);
        if (individualMatch && individualMatch[1]) {
            const id = individualMatch[1];
            const linkedPrompt = await getPromptById(id);
            outputs.push({
                id,
                title: linkedPrompt ? linkedPrompt.title : 'Prompt Not Found',
                fullPlaceholder: placeholder,
            });
        }
    }
    return outputs.sort((a,b) => a.fullPlaceholder.localeCompare(b.fullPlaceholder));
  }, [getPromptById]);


  useEffect(() => {
    extractPromptOutputs(contentA).then(setLinkedOutputsA);
  }, [contentA, extractPromptOutputs]);

  useEffect(() => {
    extractPromptOutputs(contentB).then(setLinkedOutputsB);
  }, [contentB, extractPromptOutputs]);


  const checkVariables = useCallback((content: string, currentVarValues: Record<string, string>, side: 'A' | 'B') => {
    const usedInContent = extractVariableNames(content);
    const declared = Object.keys(currentVarValues);
    const warnings: string[] = [];

    const unusedDeclared = declared.filter(d => !usedInContent.includes(d) && currentVarValues[d]?.trim() !== ''); 
    if (unusedDeclared.length > 0) {
      warnings.push(`Unused declared variable(s): ${unusedDeclared.join(', ')}.`);
    }
    
    if (side === 'A') setVariableWarningsA(warnings);
    else setVariableWarningsB(warnings);
  }, []);


  useEffect(() => {
    const newVarNames = extractVariableNames(contentA);
    setVariablesA(newVarNames);
    setVariableValuesA(prevValues => {
        const newValues: Record<string, string> = {};
        const varsWithDefaults = getVariablesAndDefaults(contentA);
        newVarNames.forEach(name => {
            newValues[name] = prevValues[name] !== undefined ? prevValues[name] : (varsWithDefaults[name] || '');
        });
        return newValues;
    });
  }, [contentA]);

  useEffect(() => {
    checkVariables(contentA, variableValuesA, 'A');
  }, [contentA, variableValuesA, checkVariables]);

  useEffect(() => {
    const newVarNames = extractVariableNames(contentB);
    setVariablesB(newVarNames);
    setVariableValuesB(prevValues => {
        const newValues: Record<string, string> = {};
        const varsWithDefaults = getVariablesAndDefaults(contentB);
        newVarNames.forEach(name => {
            newValues[name] = prevValues[name] !== undefined ? prevValues[name] : (varsWithDefaults[name] || '');
        });
        return newValues;
    });
  }, [contentB]);

  useEffect(() => {
    checkVariables(contentB, variableValuesB, 'B');
  }, [contentB, variableValuesB, checkVariables]);


  const handleStartAbTest = () => { 
      setIsAbComparisonMode(true);
      setContentB(contentA); 
      setModelB(modelA);
      setVariablesB([...variablesA]);
      setVariableValuesB({...variableValuesA});
      setModelConfigB({...modelConfigA});
      setCurrentPresetBId(currentPresetAId);
      setExecutionResultB(null);
      setExecutionErrorB(null);
      setResultBLabel(null);
      setIsAutoFillingB(false);
      resetMicroHistory('B', contentA);
      showToast("A/B Comparison mode started. Modify Prompt B to test variations.", "success");
  };

  const handlePromoteBToA = () => { 
    if (!isAbComparisonMode) return;
    setContentA(contentB);
    setModelA(modelB);
    setModelConfigA({...modelConfigB});
    setCurrentPresetAId(currentPresetBId);
    setVariablesA([...variablesB]);
    setVariableValuesA({...variableValuesB});
    
    setExecutionResultA(null); 
    setResultALabel(null);
    setIsAutoFillingA(false);
    resetMicroHistory('A', contentB);
    showToast("Prompt B has been promoted to Prompt A. Save changes to make it permanent.", "info");
  };

  const handleVariableChange = (varName: string, value: string, side: 'A' | 'B') => {
    if (side === 'A') {
      setVariableValuesA(prev => ({ ...prev, [varName]: value }));
    } else {
      setVariableValuesB(prev => ({ ...prev, [varName]: value }));
    }
  };

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

  const removeTag = (tagNameToRemove: string) => {
    setSelectedTagNames(selectedTagNames.filter(tag => tag !== tagNameToRemove));
  };

  const handleSave = async () => {
    await updatePrompt(prompt.id, { title, content: contentA, notes, tagNames: selectedTagNames, folderId: selectedFolderId });
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${fieldName} copied!`, 'success');
  };
  
  const resetMicroHistory = (side: 'A' | 'B', initialContent: string) => {
      if (side === 'A') {
          setContentAMicroHistory([initialContent]);
          setCurrentAHistoryIndex(0);
      } else {
          setContentBMicroHistory([initialContent]);
          setCurrentBHistoryIndex(0);
      }
  };
  
  const addContentToMicroHistory = (side: 'A' | 'B', newContent: string) => {
    if (side === 'A') {
        if (contentAMicroHistory[currentAHistoryIndex] === newContent) return; 
        const newHistory = contentAMicroHistory.slice(0, currentAHistoryIndex + 1);
        newHistory.push(newContent);
        if (newHistory.length > MAX_MICRO_HISTORY_LENGTH) {
            newHistory.shift(); 
        }
        setContentAMicroHistory(newHistory);
        setCurrentAHistoryIndex(newHistory.length - 1);
    } else {
        if (contentBMicroHistory[currentBHistoryIndex] === newContent) return;
        const newHistory = contentBMicroHistory.slice(0, currentBHistoryIndex + 1);
        newHistory.push(newContent);
        if (newHistory.length > MAX_MICRO_HISTORY_LENGTH) {
            newHistory.shift();
        }
        setContentBMicroHistory(newHistory);
        setCurrentBHistoryIndex(newHistory.length - 1);
    }
  };

  const handleContentChangeWithHistory = (newContent: string, side: 'A' | 'B') => {
      if (side === 'A') {
          setContentA(newContent);
      } else {
          setContentB(newContent);
      }
  };

  const handleUndo = (side: 'A' | 'B') => {
      if (side === 'A' && currentAHistoryIndex > 0) {
          const newIndex = currentAHistoryIndex - 1;
          setContentA(contentAMicroHistory[newIndex]);
          setCurrentAHistoryIndex(newIndex);
      } else if (side === 'B' && currentBHistoryIndex > 0) {
          const newIndex = currentBHistoryIndex - 1;
          setContentB(contentBMicroHistory[newIndex]);
          setCurrentBHistoryIndex(newIndex);
      }
  };
  
  const handleRedo = (side: 'A' | 'B') => {
      if (side === 'A' && currentAHistoryIndex < contentAMicroHistory.length - 1) {
          const newIndex = currentAHistoryIndex + 1;
          setContentA(contentAMicroHistory[newIndex]);
          setCurrentAHistoryIndex(newIndex);
      } else if (side === 'B' && currentBHistoryIndex < contentBMicroHistory.length - 1) {
          const newIndex = currentBHistoryIndex + 1;
          setContentB(contentBMicroHistory[newIndex]);
          setCurrentBHistoryIndex(newIndex);
      }
  };

  const handleModelConfigChange = (side: 'A' | 'B', field: keyof ModelConfig, value: string | number) => {
    const numericFields: (keyof ModelConfig)[] = ['temperature', 'topP', 'topK'];
    let parsedValue = numericFields.includes(field) ? parseFloat(value as string) : value;

    if (field === 'responseMimeType') {
        parsedValue = value as string;
    }

    if (side === 'A') {
        setModelConfigA(prev => ({...prev, [field]: parsedValue}));
        setCurrentPresetAId(null); 
    } else {
        setModelConfigB(prev => ({...prev, [field]: parsedValue}));
        setCurrentPresetBId(null);
    }
  };

  const handlePresetChange = (side: 'A' | 'B', presetId: string) => {
    const preset = executionPresets.find(p => p.id === presetId);
    if (preset) {
        const { name, id, createdAt, updatedAt, ...configValues } = preset;
        if (side === 'A') {
            setModelConfigA(configValues);
            setCurrentPresetAId(id);
        } else {
            setModelConfigB(configValues);
            setCurrentPresetBId(id);
        }
    } else { 
        if (side === 'A') {
            setModelConfigA({...DEFAULT_MODEL_CONFIG});
            setCurrentPresetAId(null);
        } else {
            setModelConfigB({...DEFAULT_MODEL_CONFIG});
            setCurrentPresetBId(null);
        }
    }
  };

  const executePromptInternal = async (
    promptIdForChainDetection: string,
    promptContentTemplate: string,
    currentPromptVariables: Record<string, string>,
    selectedModel: string,
    currentModelConfig: ModelConfig,
    setIsExecuting: React.Dispatch<React.SetStateAction<boolean>>,
    setExecutionResult: React.Dispatch<React.SetStateAction<string | null>>,
    setExecutionError: React.Dispatch<React.SetStateAction<string | null>>,
    setResultLabelState: React.Dispatch<React.SetStateAction<ResultLabel>>,
    sideLabel: string
  ) => {
    if (!activeApiKeyEntry) {
        showToast("No active API key. Please set one.", 'error');
        return;
    }
    if (!activeApiKeyEntry.encryptedKey) {
        showToast("Active API key value is missing.", 'error');
        return;
    }
    
    addContentToMicroHistory(sideLabel as 'A' | 'B', promptContentTemplate);

    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    setResultLabelState(null);
    showGlobalLoader(`Executing Prompt ${sideLabel}...`);
    try {
        const result = await geminiService.generateText(
            promptContentTemplate,
            currentPromptVariables,
            activeApiKeyEntry.encryptedKey,
            selectedModel,
            currentModelConfig, 
            0,
            promptIdForChainDetection
        );
        setExecutionResult(result);
        showToast(`Prompt ${sideLabel} executed!`, "success");
    } catch (err: any) {
        setExecutionError(err.message || `Failed to execute prompt ${sideLabel}.`);
        showToast(err.message || `Failed to execute prompt ${sideLabel}.`, "error");
    } finally {
        setIsExecuting(false);
        hideGlobalLoader();
    }
  };

  const handleRunPromptA = () => executePromptInternal(prompt.id, contentA, variableValuesA, modelA, modelConfigA, setIsExecutingA, setExecutionResultA, setExecutionErrorA, setResultALabel, "A");
  const handleRunPromptB = () => executePromptInternal(prompt.id, contentB, variableValuesB, modelB, modelConfigB, setIsExecutingB, setExecutionResultB, setExecutionErrorB, setResultBLabel, "B");

  const handleRunBoth = () => {
    handleRunPromptA();
    if(isAbComparisonMode) handleRunPromptB();
  }

  const handleInsertSnippet = (snippetContent: string, side: 'A' | 'B') => {
    const textareaRef = side === 'A' ? contentATextareaRef : contentBTextareaRef;
    const currentContent = side === 'A' ? contentA : contentB;
    const setContentFunc = side === 'A' ? setContentA : setContentB;

    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      const newContent = currentContent.substring(0, selectionStart) + snippetContent + currentContent.substring(selectionEnd);
      setContentFunc(newContent);
      
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(selectionStart + snippetContent.length, selectionStart + snippetContent.length);
      }, 0);
    } else { 
      setContentFunc(prev => prev + snippetContent);
    }
  };
  
  const toggleResultLabel = (side: 'A' | 'B', label: ResultLabel) => {
    if (side === 'A') {
        setResultALabel(prev => prev === label ? null : label);
    } else {
        setResultBLabel(prev => prev === label ? null : label);
    }
  };

  const navigateToLinkedPrompt = async (outputId: string) => {
    const targetPrompt = allPromptsFromContext.find(p => p.id === outputId);
    if (targetPrompt) {
        setSelectedPrompt(targetPrompt);
        showToast(`Navigated to: ${targetPrompt.title}`, 'info');
    } else {
        showToast(`Prompt ID ${outputId} not found.`, 'error');
    }
  };
  
  const handleTogglePinCurrentPrompt = () => { 
    if (isCurrentPromptPinned) {
      unpinPrompt(prompt.id);
      showToast('Unpinned from dashboard', 'info');
    } else {
      pinPrompt(prompt.id);
      showToast('Pinned to dashboard', 'success');
    }
  };

  const handleAutoFillVariables = async (side: 'A' | 'B') => {
    if (!activeApiKeyEntry?.encryptedKey) {
      showToast("No active API key to auto-fill variables.", "error");
      return;
    }
    const currentVars = side === 'A' ? variablesA : variablesB;
    if (currentVars.length === 0) {
      showToast("No variables detected to auto-fill.", "info");
      return;
    }

    const setIsAutoFillingState = side === 'A' ? setIsAutoFillingA : setIsAutoFillingB;
    const setVariableValues = side === 'A' ? setVariableValuesA : setVariableValuesB;

    showGlobalLoader(`AI is auto-filling variables for Prompt ${side}...`);
    const variableListString = currentVars.join(', ');
    const autoFillPrompt = `You are an assistant that helps generate sample data. For the following list of variable names: ${variableListString}, please provide a JSON object where each key is a variable name from the list and its value is a short, plausible, sample string. If a variable name implies a specific type (e.g., 'email', 'date', 'city'), try to provide a value of that type. Otherwise, provide a generic string.

Example for 'name, topic, tone':
\`\`\`json
{
  "name": "Quick Brown Fox",
  "topic": "The Benefits of Jumping",
  "tone": "Informative and Playful"
}
\`\`\`

Now, generate for: ${variableListString}`;

    try {
      const responseText = await geminiService.generateText(
        autoFillPrompt,
        {}, 
        activeApiKeyEntry.encryptedKey,
        GEMINI_MODEL_TEXT, 
        { responseMimeType: "application/json" } 
      );

      let jsonStr = responseText.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedData = JSON.parse(jsonStr);
      
      setVariableValues(prevValues => {
        const newValues = { ...prevValues };
        let updatedCount = 0;
        for (const key in parsedData) {
          if (currentVars.includes(key) && typeof parsedData[key] === 'string') {
            newValues[key] = parsedData[key];
            updatedCount++;
          }
        }
        if (updatedCount > 0) {
            showToast(`Successfully auto-filled ${updatedCount} variable(s)!`, 'success');
        } else {
            showToast('AI could not provide values for the current variables.', 'info');
        }
        return newValues;
      });

    } catch (error: any) {
      console.error("Error auto-filling variables:", error);
      showToast(`Failed to auto-fill variables: ${error.message}`, "error");
    } finally {
      hideGlobalLoader();
    }
  };

  const PromptMetadataSection = () => (
    <>
      <div>
          <label htmlFor="promptTitle" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Title</label>
          <div className="flex items-center gap-2"> 
            <input type="text" id="promptTitle" value={title} onChange={(e) => setTitle(e.target.value)} ref={titleInputRef}
                className={`${INPUT_BASE_CLASSES} px-3 py-2 flex-grow ${INPUT_FOCUS_CLASSES}`} />
            <button
                type="button"
                onClick={handleTogglePinCurrentPrompt}
                className={`p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors ${YELLOW_BUTTON_FOCUS_CLASSES}`}
                title={isCurrentPromptPinned ? "Unpin from Dashboard" : "Pin to Dashboard"}
                aria-pressed={isCurrentPromptPinned}
            >
                {isCurrentPromptPinned ? <StarIconSolid className="w-5 h-5 text-[var(--accent-special)]" /> : <StarIconOutline className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--accent-special)]" />}
            </button>
          </div>
      </div>

      <div>
          <label htmlFor="promptEditorFolderSelect" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Folder</label>
          <FolderSelectComponent
            id="promptEditorFolderSelect"
            value={selectedFolderId}
            onChange={(folderId) => setSelectedFolderId(folderId)}
            folders={folders}
          />
      </div>
       <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="promptNotes" className="block text-sm font-medium text-[var(--text-primary)]">Notes (Optional)</label>
                 {notes && <button type="button" onClick={() => copyToClipboard(notes, "Notes")} className={`text-xs text-[var(--accent1)] hover:underline flex items-center gap-1 rounded ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                    <ClipboardIcon className="w-3 h-3"/> Copy
                 </button>}
            </div>
          <textarea id="promptNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={isAbComparisonMode ? 2 : (isZenMode && !isPromptDetailsVisibleInZen ? 1 : (isZenMode ? 2 : 4))}
            className={`${INPUT_BASE_CLASSES} px-3 py-2 resize-y ${INPUT_FOCUS_CLASSES}`} />
        </div>

        <div>
          <label htmlFor="promptTagsInput" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Tags</label>
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
             <input type="text" id="promptTagsInput" value={currentTagInput} onChange={(e) => setCurrentTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
            placeholder={selectedTagNames.length === 0 ? "Add tags (type and press Enter)" : ""}
            className={`flex-grow p-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)]`} />
          </div>
        </div>
    </>
  );


  return (
    <div className={`p-4 md:p-6 bg-[var(--bg-app)] h-full overflow-y-auto ${isZenMode ? 'flex flex-col' : ''}`}>
      <div className={`flex justify-between items-center mb-6 ${isZenMode ? 'sr-only' : ''}`}> 
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Edit Prompt</h2>
        <div className="flex items-center gap-1 sm:gap-2">
            {executionPresets.length > 0 && !isZenMode && ( 
                <button type="button" onClick={() => onOpenModal('managePresets')} title="Manage Execution Presets"
                    className={`p-1.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                    <Cog6ToothIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
            )}
            {/* Zen Mode toggle button removed from here. Global Zen Mode is controlled from App Header or Zen Action Bar. */}
            <button
                type="button"
                onClick={() => setIsAbComparisonMode(!isAbComparisonMode)}
                className={`p-1.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors ${isAbComparisonMode ? 'bg-[var(--accent1)] bg-opacity-20' : ''} ${COMMON_BUTTON_FOCUS_CLASSES}`}
                title={isAbComparisonMode ? "Exit A/B Comparison" : "Enter A/B Comparison Mode"}
                aria-pressed={isAbComparisonMode}
            >
                <ArrowsRightLeftIcon className={`w-5 h-5 ${isAbComparisonMode ? 'text-[var(--accent1)]' : 'text-[var(--text-secondary)]'}`} />
            </button>
            <button type="button" onClick={() => setSelectedPrompt(null)} aria-label="Close editor" className={`p-1.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className={`space-y-6 ${isZenMode ? 'flex-grow flex flex-col' : ''}`}>
        {isZenMode ? ( 
            <div className="mb-2">
                 <button type="button" onClick={() => setIsPromptDetailsVisibleInZen(!isPromptDetailsVisibleInZen)} 
                    className={`text-xs py-1 px-2 rounded-md flex items-center gap-1 ${isPromptDetailsVisibleInZen ? 'bg-[var(--bg-secondary)]' : 'bg-transparent'} hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] ${COMMON_BUTTON_FOCUS_CLASSES} sr-only`} 
                    aria-hidden="true" tabIndex={-1} 
                 >
                    {isPromptDetailsVisibleInZen ? <ChevronUpIcon className="w-3 h-3"/> : <ChevronDownIcon className="w-3 h-3"/>}
                    {isPromptDetailsVisibleInZen ? "Hide Details" : "Show Details"}
                 </button>
                 {isPromptDetailsVisibleInZen && (
                     <div className="mt-2 p-3 space-y-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                        <PromptMetadataSection />
                     </div>
                 )}
            </div>
        ) : (
            <PromptMetadataSection />
        )}
        
        {!isAbComparisonMode && !isZenMode && ( 
             <button
                type="button"
                onClick={handleStartAbTest}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent-special)] hover:bg-opacity-80 text-black font-semibold rounded-lg shadow-md transition-all text-sm ${YELLOW_BUTTON_FOCUS_CLASSES}`}
            >
                <ArrowsRightLeftIcon className="w-4 h-4"/> Start A/B Test with this Prompt
            </button>
        )}

        <div className={`pt-4 border-t border-[var(--border-color)] ${isAbComparisonMode ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'} ${isZenMode ? 'flex-grow flex flex-col md:flex-row' : ''}`}>
            <ExecutionBlock
                idPrefix="promptA"
                titleLabel="Prompt A"
                promptId={prompt.id}
                contentVal={contentA}
                setContentVal={(v) => handleContentChangeWithHistory(v,'A')}
                textareaRef={contentATextareaRef}
                contentHistory={contentAMicroHistory}
                currentHistoryIndex={currentAHistoryIndex}
                handleUndoContent={() => handleUndo('A')}
                handleRedoContent={() => handleRedo('A')}
                addContentToHist={() => addContentToMicroHistory('A', contentA)}
                detectedVars={variablesA}
                currentVarValues={variableValuesA}
                onVarChange={(varName, val) => handleVariableChange(varName, val, 'A')}
                variableWarnings={variableWarningsA}
                onAutoFillVariables={() => handleAutoFillVariables('A')}
                currentLinkedOutputs={linkedOutputsA}
                navigateToLinkedPrompt={navigateToLinkedPrompt}
                selectedModelVal={modelA}
                setSelectedModelVal={setModelA}
                modelConfigVal={modelConfigA}
                onModelConfigChange={(f,v) => handleModelConfigChange('A',f,v)}
                showConfig={showModelConfigA}
                toggleShowConfig={() => setShowModelConfigA(s=>!s)}
                currentPresetIdVal={currentPresetAId}
                onPresetChange={(id) => handlePresetChange('A',id)}
                executionPresets={executionPresets}
                isExecutingVal={isExecutingA}
                executionResultVal={executionResultA}
                executionErrorVal={executionErrorA}
                handleRun={handleRunPromptA}
                activeApiKey={activeApiKeyExists}
                currentResultLabel={resultALabel}
                onToggleResultLabel={(label) => toggleResultLabel('A', label)}
                showSnippets={showSnippetsA}
                setShowSnippets={setShowSnippetsA}
                snippetsButtonRef={snippetsButtonARef}
                handleInsertSnippet={(snippet) => handleInsertSnippet(snippet, 'A')}
                isAbComparisonMode={isAbComparisonMode}
                isZenMode={isZenMode}
                onOpenModal={onOpenModal}
                copyToClipboard={copyToClipboard}
                showToast={showToast}
            />
            {isAbComparisonMode &&
                <ExecutionBlock
                    idPrefix="promptB"
                    titleLabel="Prompt B"
                    promptId={prompt.id}
                    contentVal={contentB}
                    setContentVal={(v) => handleContentChangeWithHistory(v,'B')}
                    textareaRef={contentBTextareaRef}
                    contentHistory={contentBMicroHistory}
                    currentHistoryIndex={currentBHistoryIndex}
                    handleUndoContent={() => handleUndo('B')}
                    handleRedoContent={() => handleRedo('B')}
                    addContentToHist={() => addContentToMicroHistory('B', contentB)}
                    detectedVars={variablesB}
                    currentVarValues={variableValuesB}
                    onVarChange={(varName, val) => handleVariableChange(varName, val, 'B')}
                    variableWarnings={variableWarningsB}
                    onAutoFillVariables={() => handleAutoFillVariables('B')}
                    currentLinkedOutputs={linkedOutputsB}
                    navigateToLinkedPrompt={navigateToLinkedPrompt}
                    selectedModelVal={modelB}
                    setSelectedModelVal={setModelB}
                    modelConfigVal={modelConfigB}
                    onModelConfigChange={(f,v) => handleModelConfigChange('B',f,v)}
                    showConfig={showModelConfigB}
                    toggleShowConfig={() => setShowModelConfigB(s=>!s)}
                    currentPresetIdVal={currentPresetBId}
                    onPresetChange={(id) => handlePresetChange('B',id)}
                    executionPresets={executionPresets}
                    isExecutingVal={isExecutingB}
                    executionResultVal={executionResultB}
                    executionErrorVal={executionErrorB}
                    handleRun={handleRunPromptB}
                    activeApiKey={activeApiKeyExists}
                    currentResultLabel={resultBLabel}
                    onToggleResultLabel={(label) => toggleResultLabel('B', label)}
                    showSnippets={showSnippetsB}
                    setShowSnippets={setShowSnippetsB}
                    snippetsButtonRef={snippetsButtonBRef}
                    handleInsertSnippet={(snippet) => handleInsertSnippet(snippet, 'B')}
                    isAbComparisonMode={isAbComparisonMode}
                    isZenMode={isZenMode}
                    onOpenModal={onOpenModal}
                    copyToClipboard={copyToClipboard}
                    showToast={showToast}
                />
            }
        </div>
        
        {isAbComparisonMode && executionResultA && executionResultB && !isZenMode && ( 
            <div className="mt-4 pt-4 border-t border-[var(--border-color-strong)]">
                <DiffView text1={executionResultA} text2={executionResultB} type="Comparison of A and B Execution Results" />
                <button
                    type="button"
                    onClick={handlePromoteBToA}
                    className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}
                >
                    <ArrowUpTrayIcon className="w-4 h-4"/> Promote Prompt B to A
                </button>
            </div>
        )}
        
        {!isZenMode && (
          <p className="text-xs text-[var(--text-tertiary)] text-center -mt-2 mb-2">
              Use <code className="text-xs bg-[var(--bg-input-secondary-main)] text-[var(--accent1)] p-0.5 rounded">{'{{variable_name | optional default}}'}</code> for dynamic inputs.
              Use <code className="text-xs bg-[var(--bg-input-secondary-main)] text-[var(--accent1)] p-0.5 rounded">{'{{promptOutput:PROMPT_ID}}'}</code> to chain outputs.
          </p>
        )}

        {!activeApiKeyExists && <p className="text-xs text-yellow-500 text-center -mt-3 mb-1">No active API key. Add one in "Manage API Keys" to run prompts.</p>}
        
        {isAbComparisonMode && !isZenMode && ( 
             <button
                type="button"
                onClick={handleRunBoth}
                disabled={isExecutingA || isExecutingB || !activeApiKeyExists || isAutoFillingA || isAutoFillingB}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent2)] hover:bg-opacity-80 text-black font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
                <PlayIcon className="w-4 h-4"/> Run Both (A & B)
            </button>
        )}
       
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 pt-5 border-t border-[var(--border-color)] ${isZenMode ? 'mt-auto sr-only' : ''}`}> 
          <div className="flex gap-2">
            <button type="submit" className={`px-5 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-md transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>Save Changes</button>
            {!isZenMode && ( 
                <button type="button" onClick={() => onOpenModal('versionHistory', { prompt })} className={`px-4 py-2 flex items-center gap-1.5 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                <HistoryIcon className="w-4 h-4"/> Versions
                </button>
            )}
          </div>
          {!isZenMode && (
            <button type="button" onClick={() => onOpenModal('deletePromptConfirm', { promptId: prompt.id, promptTitle: prompt.title })} className={`px-4 py-2 text-red-500 hover:text-red-400 font-medium rounded-lg hover:bg-red-500 hover:bg-opacity-10 transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                Delete Prompt
            </button>
          )}
        </div>
      </form>
      {isZenMode && activeApiKeyEntry !== null && ( 
            <ZenModeActionBar 
                isAbComparisonMode={isAbComparisonMode}
                onRunA={handleRunPromptA}
                onRunB={handleRunPromptB}
                onRunBoth={handleRunBoth}
                onSave={handleSave}
                onToggleDetails={() => setIsPromptDetailsVisibleInZen(prev => !prev)}
                isDetailsVisible={isPromptDetailsVisibleInZen}
                onExitZenMode={() => setIsZenMode(false)}
                isExecutingA={isExecutingA || isAutoFillingA} 
                isExecutingB={isExecutingB || isAutoFillingB}
                activeApiKey={activeApiKeyExists}
            />
        )}
    </div>
  );
};

export default PromptEditor;
