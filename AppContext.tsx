
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import * as db from '../services/db';
import { Prompt, Tag, PromptVersion, ApiKeyEntry, Folder, ExportData, ModalType, ModelConfig, ExecutionPreset, CuratedPrompt } from '../types';
import { PINNED_PROMPTS_LOCAL_STORAGE_KEY, DEFAULT_API_KEY_NAME, DEFAULT_API_KEY_VALUE } from '../constants';
import * as geminiService from '../services/geminiService'; // Added for AI prompt generation

// Import Modals - paths will need to be correct based on final modal file locations
import Modal from '../components/Modal';
import SmartStartChoiceModal from '../components/modals/SmartStartChoiceModal';
import NewPromptModal from '../components/modals/NewPromptModal';
import FolderModal from '../components/modals/FolderModal';
import VersionHistoryModal from '../components/modals/VersionHistoryModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import DataPortabilityModal from '../components/modals/DataPortabilityModal';
import ApiKeyManagerModal from '../components/modals/ApiKeyManagerModal';
import CuratedLibraryModal from '../components/modals/CuratedLibraryModal';
import VisualChainBuilderModal from '../components/VisualChainBuilderModal';
import SavePresetModal from '../components/modals/SavePresetModal';
import ManagePresetsModal from '../components/modals/ManagePresetsModal';
import PromptGraphModal from '../components/PromptGraphModal';
import PowerPaletteModal from '../components/modals/PowerPaletteModal';
import GlobalLoader from '../components/GlobalLoader';


export interface AppContextType {
  prompts: Prompt[];
  tags: Tag[];
  folders: Folder[];
  currentFolderId?: string | null; 
  selectedPrompt: Prompt | null;
  isLoading: boolean;
  error: string | null;
  activeApiKey: ApiKeyEntry | null;
  apiKeys: ApiKeyEntry[];
  executionPresets: ExecutionPreset[]; 
  isZenMode: boolean; 
  selectedTagIdForFiltering: string | null; 
  isPowerPaletteOpen: boolean;
  pinnedPromptIds: string[]; 
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;

  addPrompt: (promptData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'versions' | 'tags'> & { tagNames?: string[], folderId?: string | null, _initialEditorMode?: 'abTest' | 'chainBlueprint', id?: string }) => Promise<Prompt | null>;
  updatePrompt: (id: string, promptData: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'versions'>> & { tagNames?: string[] }) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  getPromptById: (id: string) => Promise<Prompt | undefined>;
  
  addTag: (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at'>) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<void>;
  addTagToCurrentPrompt: (promptId: string, tagName: string) => Promise<void>; 

  addFolder: (name: string, parentId?: string | null) => Promise<Folder | null>;
  updateFolder: (id: string, name: string, parentId?: string | null) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;

  setCurrentFolderId: (folderId?: string | null) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  
  getPromptVersions: (promptId: string) => Promise<PromptVersion[]>;
  restorePromptVersion: (versionId: number) => Promise<void>;
  namePromptVersion: (versionId: number, commitMessage: string) => Promise<void>;
  addNoteToCurrentPrompt: (promptId: string, noteContent: string) => Promise<void>; 

  exportData: () => Promise<ExportData>;
  importData: (data: ExportData, mode: 'merge' | 'overwrite') => Promise<void>;

  addApiKey: (name: string, key: string) => Promise<ApiKeyEntry | null>;
  getApiKeys: () => Promise<ApiKeyEntry[]>;
  deleteApiKey: (id: string) => Promise<void>;
  setActiveApiKey: (id: string) => Promise<void>;
  
  saveExecutionPreset: (presetData: Omit<ExecutionPreset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ExecutionPreset | null>; 
  updateExecutionPreset: (id: string, presetData: Partial<Omit<ExecutionPreset, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<ExecutionPreset | null>; 
  removeExecutionPreset: (id: string) => Promise<void>; 

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setIsZenMode: React.Dispatch<React.SetStateAction<boolean>>; 
  setSelectedTagIdForFiltering: (tagId: string | null) => void;
  setIsPowerPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pinPrompt: (promptId: string) => void; 
  unpinPrompt: (promptId: string) => void; 
  showGlobalLoader: (message?: string) => void;
  hideGlobalLoader: () => void;
  
  onOpenModal: (type: ModalType, props?: any) => void;
  onCloseModal: () => void;
  loadData: (selectedFolderIdToLoad?: string | null) => Promise<void>;
  aiGeneratePromptIdeaAndOpenModal: () => Promise<void>; // Added for AI prompt generation
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, _setCurrentFolderId] = useState<string | null | undefined>(undefined); 
  const [selectedPrompt, _setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [activeApiKey, setActiveApiKey] = useState<ApiKeyEntry | null>(null);
  const [executionPresets, setExecutionPresets] = useState<ExecutionPreset[]>([]); 
  const [isZenMode, setIsZenMode] = useState(true); // Default to Zen Mode
  const [selectedTagIdForFiltering, _setSelectedTagIdForFiltering] = useState<string | null>(null);
  const [isPowerPaletteOpen, setIsPowerPaletteOpen] = useState(false);
  const [modalState, setModalState] = useState<{ type: ModalType | null; props?: any }>({ type: null });
  const [pinnedPromptIds, setPinnedPromptIds] = useState<string[]>(() => { 
    const stored = localStorage.getItem(PINNED_PROMPTS_LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const showGlobalLoader = useCallback((message?: string) => {
    setGlobalLoadingMessage(message || "Processing...");
    setIsGlobalLoading(true);
  }, []);

  const hideGlobalLoader = useCallback(() => {
    setIsGlobalLoading(false);
    setGlobalLoadingMessage(null);
  }, []);
  
  const openModalHandler = useCallback((type: ModalType, props: any = {}) => {
    setModalState({ type, props });
  }, []); 

  const closeModalHandler = useCallback(() => {
    setModalState({ type: null, props: {} });
  }, []); 

  const aiGeneratePromptIdeaAndOpenModal = useCallback(async () => {
    if (!activeApiKey || !activeApiKey.encryptedKey) {
      showToast("No active API key. Please set one in Manage API Keys.", "error");
      openModalHandler('apiKeyManager'); // Optionally open manager if no key
      return;
    }
    showGlobalLoader("AI is crafting a new prompt idea...");
    try {
      const idea = await geminiService.generatePromptIdea(activeApiKey.encryptedKey);
      showToast("AI prompt idea generated!", "success");
      openModalHandler('newPrompt', {
        initialTitle: idea.title,
        initialContent: idea.content,
        initialNotes: idea.notes,
        initialTagNames: idea.suggestedTags,
        creationMode: 'blank', // Default creation mode for AI generated
      });
    } catch (error: any) {
      console.error("AI Generate Prompt error:", error);
      showToast(`Failed to generate prompt idea: ${error.message}`, "error");
    } finally {
      hideGlobalLoader();
    }
  }, [activeApiKey, showGlobalLoader, hideGlobalLoader, showToast, openModalHandler]);


  const setSelectedPrompt = useCallback((prompt: Prompt | null) => {
    _setSelectedPrompt(prompt);
    // Logic for automatically entering/exiting zen mode on prompt selection/deselection:
    // If a prompt is selected, and we are not already in zen mode, enter zen mode.
    // If a prompt is deselected (selectedPrompt is null), and we are in zen mode, stay in zen mode (shows zen empty state).
    // User can manually exit zen mode using designated buttons.
    if (prompt !== null && !isZenMode) {
      // Intentionally not changing Zen mode here based on previous user feedback.
      // Zen mode is a user-initiated global state.
    }
  }, [isZenMode]);

  const setCurrentFolderId = useCallback((folderId?: string | null) => {
      _setCurrentFolderId(folderId);
      setSelectedPrompt(null); 
  }, [setSelectedPrompt]);

  const setSelectedTagIdForFiltering = useCallback((tagId: string | null) => {
    _setSelectedTagIdForFiltering(tagId);
    setSelectedPrompt(null);
  }, [setSelectedPrompt]);


  const loadData = useCallback(async (selectedFolderIdToLoad?: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedPrompts, loadedTags, loadedFolders, loadedKeys, loadedPresets] = await Promise.all([
        db.getAllPrompts(selectedFolderIdToLoad),
        db.getAllTags(),
        db.getAllFolders(),
        db.getApiKeys(),
        db.getAllExecutionPresets() 
      ]);
      setPrompts(loadedPrompts);
      setTags(loadedTags);
      setFolders(loadedFolders);
      setApiKeys(loadedKeys);
      setExecutionPresets(loadedPresets); 
      
      const currentActiveKey = await db.getActiveApiKey();
      setActiveApiKey(currentActiveKey || null);

    } catch (e: any) {
      console.error("Failed to load data:", e);
      setError(e.message || 'Failed to load data from database.');
      showToast(e.message || 'Failed to load data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]); 

  useEffect(() => {
    loadData(currentFolderId);
  }, [currentFolderId, loadData]);

  const handlePinPrompt = useCallback((promptId: string) => {
    setPinnedPromptIds(prev => {
      const newPinned = Array.from(new Set([...prev, promptId]));
      localStorage.setItem(PINNED_PROMPTS_LOCAL_STORAGE_KEY, JSON.stringify(newPinned));
      return newPinned;
    });
  }, []);

  const handleUnpinPrompt = useCallback((promptId: string) => {
    setPinnedPromptIds(prev => {
      const newPinned = prev.filter(id => id !== promptId);
      localStorage.setItem(PINNED_PROMPTS_LOCAL_STORAGE_KEY, JSON.stringify(newPinned));
      return newPinned;
    });
  }, []);


  const handleAddPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'versions' | 'tags'> & { tagNames?: string[], folderId?: string | null, _initialEditorMode?: 'abTest' | 'chainBlueprint', id?: string }) => { 
    try {
      let tagIds: string[] = [];
      if (promptData.tagNames && promptData.tagNames.length > 0) {
        const newOrExistingTags = await Promise.all(
          promptData.tagNames.map(name => db.addTag({ name }))
        );
        tagIds = newOrExistingTags.filter(Boolean).map(t => t!.id);
      }
      
      const newPromptFromDb = await db.addPrompt({ ...promptData, tags: tagIds, folderId: promptData.folderId, id: promptData.id });
      
      const promptToSelect: Prompt = { ...newPromptFromDb, _initialEditorMode: promptData._initialEditorMode };
      
      setPrompts(prev => {
          const filteredPrev = prev.filter(p => p.id !== newPromptFromDb.id); 
          return [newPromptFromDb, ...filteredPrev].sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      });
      
      setSelectedPrompt(promptToSelect); // Always select the new prompt
      if (!isZenMode && (promptData._initialEditorMode || promptData.id)) {
        // If coming from a specific creation mode (like AI gen or curated) and not in Zen, enter Zen.
        // Or if importing an existing prompt by ID.
        // setIsZenMode(true); 
        // Based on user wanting Zen mode as default, this auto-entry might be less needed.
        // Let user manually control Zen state for now after initial default.
      }
      
      const allTagsFromDb = await db.getAllTags(); 
      setTags(allTagsFromDb);
      
      showToast('Prompt created successfully!', 'success');
      return promptToSelect;
    } catch (e: any) {
      setError(e.message || 'Failed to add prompt.');
      showToast(e.message || 'Failed to add prompt.', 'error');
      return null;
    }
  }, [showToast, setSelectedPrompt, isZenMode, setIsZenMode]); 


  const handleUpdatePrompt = useCallback(async (id: string, promptData: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'versions'>> & { tagNames?: string[] }) => {
    try {
      let tagIdsToUpdate: string[] | undefined = undefined;
      if (promptData.tagNames) {
          tagIdsToUpdate = [];
          if (promptData.tagNames.length > 0) {
            const newOrExistingTags = await Promise.all(
              promptData.tagNames.map(name => db.addTag({ name }))
            );
            tagIdsToUpdate = newOrExistingTags.filter(Boolean).map(t => t!.id);
          }
      }

      const finalPromptData = { ...promptData, tags: tagIdsToUpdate };
      if (tagIdsToUpdate === undefined) delete finalPromptData.tags; 

      const updatedPrompt = await db.updatePrompt(id, finalPromptData);
      
      setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(updatedPrompt);
      }
      const allTagsFromDb = await db.getAllTags();
      setTags(allTagsFromDb);
      showToast('Prompt updated successfully!', 'success');
    } catch (e: any) {
      setError(e.message || 'Failed to update prompt.');
      showToast(e.message || 'Failed to update prompt.', 'error');
    }
  }, [selectedPrompt, showToast, setSelectedPrompt]);

  const handleDeletePrompt = useCallback(async (id: string) => {
    try {
      await db.deletePrompt(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
      handleUnpinPrompt(id); 
      showToast('Prompt deleted!', 'success');
    } catch (e: any) {
      setError(e.message || 'Failed to delete prompt.');
      showToast(e.message || 'Failed to delete prompt.', 'error');
    }
  }, [selectedPrompt, showToast, handleUnpinPrompt, setSelectedPrompt]);
  
  const handleGetPromptById = useCallback(async (id: string): Promise<Prompt | undefined> => {
    try {
      return await db.getPrompt(id);
    } catch (e:any) {
      showToast(e.message || 'Failed to fetch prompt.', 'error');
      return undefined;
    }
  }, [showToast]);

  const handleAddTag = useCallback(async (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTag = await db.addTag(tagData);
      if (newTag && !tags.find(t => t.id === newTag.id)) { 
          setTags(prev => [...prev, newTag].sort((a,b) => a.name.localeCompare(b.name)));
      }
      showToast('Tag added!', 'success');
      return newTag;
    } catch (e: any) {
      setError(e.message || 'Failed to add tag.');
      showToast(e.message || 'Failed to add tag.', 'error');
      return null;
    }
  }, [tags, showToast]);

  const handleDeleteTag = useCallback(async (id: string) => {
    try {
      await db.deleteTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
      await loadData(currentFolderId);
      showToast('Tag deleted!', 'success');
    } catch (e: any) {
      setError(e.message || 'Failed to delete tag.');
      showToast(e.message || 'Failed to delete tag.', 'error');
    }
  }, [currentFolderId, loadData, showToast]);

  const handleAddTagToCurrentPrompt = useCallback(async (promptId: string, tagName: string) => {
    const prompt = await db.getPrompt(promptId);
    if (!prompt) {
        showToast("Prompt not found to add tag.", 'error');
        return;
    }
    const currentTagNames = (await Promise.all(prompt.tags.map(tagId => db.getTag(tagId))))
                            .filter(Boolean).map(t => t!.name);

    if (!currentTagNames.includes(tagName)) {
        const updatedTagNames = [...currentTagNames, tagName];
        await handleUpdatePrompt(promptId, { tagNames: updatedTagNames });
        showToast(`Tag "${tagName}" added to prompt.`, 'success');
    } else {
        showToast(`Tag "${tagName}" already on prompt.`, 'info');
    }
  }, [handleUpdatePrompt, showToast]);


  const handleAddFolder = useCallback(async (name: string, parentId?: string | null) => {
      try {
          const newFolder = await db.addFolder({ name, parentId: parentId || null });
          setFolders(prev => [...prev, newFolder].sort((a,b) => a.name.localeCompare(b.name)));
          showToast('Folder created!', 'success');
          return newFolder;
      } catch (e: any) {
          setError(e.message || 'Failed to create folder.');
          showToast(e.message || 'Failed to create folder.', 'error');
          return null;
      }
  }, [showToast]);

  const handleUpdateFolder = useCallback(async (id: string, name: string, parentId?: string | null) => {
      try {
          const updatedFolder = await db.updateFolder(id, { name, parentId: parentId === undefined ? null : parentId });
          setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f).sort((a,b) => a.name.localeCompare(b.name)));
          showToast('Folder updated!', 'success');
      } catch (e: any) {
          setError(e.message || 'Failed to update folder.');
          showToast(e.message || 'Failed to update folder.', 'error');
      }
  }, [showToast]);
  
  const handleDeleteFolder = useCallback(async (id: string) => {
      try {
          await db.deleteFolder(id);
          await loadData(currentFolderId); 
          if(currentFolderId === id) setCurrentFolderId(undefined); 
          showToast('Folder deleted!', 'success');
      } catch (e: any) {
          setError(e.message || 'Failed to delete folder.');
          showToast(e.message || 'Failed to delete folder.', 'error');
      }
  }, [currentFolderId, loadData, showToast, setCurrentFolderId]);

  const handleGetPromptVersions = useCallback(async (promptId: string) => {
      try {
          return await db.getPromptVersions(promptId);
      } catch (e: any) {
          showToast(e.message || 'Failed to fetch versions.', 'error');
          return [];
      }
  }, [showToast]);
  
  const handleRestorePromptVersion = useCallback(async (versionId: number) => {
      try {
          const updatedPrompt = await db.restorePromptVersion(versionId);
          setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
          if (selectedPrompt?.id === updatedPrompt.id) {
              setSelectedPrompt(updatedPrompt);
          }
          showToast('Prompt version restored!', 'success');
      } catch (e: any) {
          showToast(e.message || 'Failed to restore version.', 'error');
      }
  }, [selectedPrompt, showToast, setSelectedPrompt]);

  const handleNamePromptVersion = useCallback(async (versionId: number, commitMessage: string) => {
      try {
          await db.namePromptVersion(versionId, commitMessage);
          showToast('Version named successfully!', 'success');
      } catch(e: any) {
          showToast(e.message || 'Failed to name version.', 'error');
      }
  }, [showToast]);

  const handleAddNoteToCurrentPrompt = useCallback(async (promptId: string, noteContent: string) => {
    const prompt = await db.getPrompt(promptId);
    if (!prompt) {
        showToast("Prompt not found to add note.", 'error');
        return;
    }
    const newNotes = prompt.notes ? `${prompt.notes}\n\n${noteContent}` : noteContent;
    await handleUpdatePrompt(promptId, { notes: newNotes });
    showToast(`Note added to prompt.`, 'success');
  }, [handleUpdatePrompt, showToast]);


  const handleExportData = useCallback(async (): Promise<ExportData> => {
      try {
          const data = await db.exportData();
          showToast('Data exported successfully!', 'success');
          return data;
      } catch (e:any) {
          showToast(e.message || 'Failed to export data.', 'error');
          throw e; 
      }
  }, [showToast]);

  const handleImportData = useCallback(async (data: ExportData, mode: 'merge' | 'overwrite') => {
      try {
          await db.importData(data, mode);
          await loadData(undefined); 
          setCurrentFolderId(undefined); 
          setSelectedTagIdForFiltering(null); 
          showToast('Data imported successfully!', 'success');
      } catch (e:any) {
          showToast(e.message || 'Failed to import data.', 'error');
      }
  }, [loadData, showToast, setCurrentFolderId, setSelectedTagIdForFiltering]);

  // Gemini API Key Handlers
  const handleAddApiKey = useCallback(async (name: string, key: string): Promise<ApiKeyEntry | null> => {
      try {
          const newKey = await db.addApiKey(name, key);
          setApiKeys(prev => [...prev, newKey].sort((a,b) => a.name.localeCompare(b.name)));
          if (newKey.isActive || apiKeys.length === 0) { 
             const active = await db.getActiveApiKey(); 
             setActiveApiKey(active || null);
          }
          showToast('Gemini API Key added!', 'success');
          return newKey;
      } catch (e:any) {
          showToast(e.message || 'Failed to add Gemini API key.', 'error');
          return null;
      }
  }, [apiKeys, showToast]);
  
  const handleGetApiKeys = useCallback(async (): Promise<ApiKeyEntry[]> => {
      try {
          const keys = await db.getApiKeys();
          setApiKeys(keys.sort((a,b) => a.name.localeCompare(b.name)));
          return keys;
      } catch (e:any) {
          showToast(e.message || 'Failed to fetch Gemini API keys.', 'error');
          return [];
      }
  }, [showToast]);

  const handleDeleteApiKey = useCallback(async (id: string) => {
      try {
          const keyToDelete = apiKeys.find(k => k.id === id);
          await db.deleteApiKey(id);
          const remainingKeys = apiKeys.filter(k => k.id !== id);
          setApiKeys(remainingKeys.sort((a,b) => a.name.localeCompare(b.name)));
          if (keyToDelete?.id === activeApiKey?.id) { 
              const newActive = await db.getActiveApiKey(); 
              setActiveApiKey(newActive || null);
          }
          showToast('Gemini API Key deleted!', 'success');
      } catch (e:any) {
          showToast(e.message || 'Failed to delete Gemini API key.', 'error');
      }
  }, [apiKeys, activeApiKey, showToast]);
  
  const handleSetActiveApiKey = useCallback(async (id: string) => {
      try {
          await db.setActiveApiKey(id);
          const newActiveKey = await db.getActiveApiKey(); 
          setActiveApiKey(newActiveKey || null); 
          setApiKeys(prevKeys => prevKeys.map(k => ({...k, isActive: k.id === id})).sort((a,b) => a.name.localeCompare(b.name)));
          showToast('Gemini API Key set as active!', 'success');
      } catch (e:any) {
          showToast(e.message || 'Failed to set active Gemini API key.', 'error');
      }
  }, [showToast]);

  const handleSaveExecutionPreset = useCallback(async (presetData: Omit<ExecutionPreset, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExecutionPreset | null> => {
    try {
      const newPreset = await db.addExecutionPreset(presetData);
      setExecutionPresets(prev => [...prev, newPreset].sort((a,b) => a.name.localeCompare(b.name)));
      showToast(`Preset "${newPreset.name}" saved!`, 'success');
      return newPreset;
    } catch (e:any) {
      showToast(e.message || 'Failed to save preset.', 'error');
      return null;
    }
  }, [showToast]);

  const handleUpdateExecutionPreset = useCallback(async (id: string, presetData: Partial<Omit<ExecutionPreset, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ExecutionPreset | null> => {
      try {
          const updatedPreset = await db.updateExecutionPreset(id, presetData);
          setExecutionPresets(prev => prev.map(p => p.id === id ? updatedPreset : p).sort((a,b) => a.name.localeCompare(b.name)));
          showToast(`Preset "${updatedPreset.name}" updated!`, 'success');
          return updatedPreset;
      } catch (e:any) {
          showToast(e.message || 'Failed to update preset.', 'error');
          return null;
      }
  }, [showToast]);
  
  const handleRemoveExecutionPreset = useCallback(async (id: string) => {
      try {
          await db.deleteExecutionPreset(id);
          setExecutionPresets(prev => prev.filter(p => p.id !== id));
          showToast('Preset removed!', 'success');
      } catch (e:any) {
          showToast(e.message || 'Failed to remove preset.', 'error');
      }
  }, [showToast]);


  const handleSavePresetFromModalCallback = useCallback(async (name: string) => {
    if (modalState.props?.editingPreset) { 
        await handleUpdateExecutionPreset(modalState.props.editingPreset.id, { name });
    } else if (modalState.props?.modelConfigToSave) { 
        const config = modalState.props.modelConfigToSave as ModelConfig;
        await handleSaveExecutionPreset({
            name: name,
            systemInstruction: config.systemInstruction,
            temperature: config.temperature,
            topP: config.topP,
            topK: config.topK,
            responseMimeType: config.responseMimeType,
        });
    }
    closeModalHandler(); 
  }, [modalState.props, handleUpdateExecutionPreset, handleSaveExecutionPreset, closeModalHandler]);


  const contextValue = useMemo(() => ({
    prompts, tags, folders, currentFolderId, selectedPrompt, isLoading, error, 
    activeApiKey, // For Gemini
    apiKeys, // For Gemini
    executionPresets, isZenMode, selectedTagIdForFiltering, isPowerPaletteOpen, pinnedPromptIds, isGlobalLoading, globalLoadingMessage,
    supabase: supabaseClientHook, 
    supabaseSession,

    addPrompt: handleAddPrompt, updatePrompt: handleUpdatePrompt, deletePrompt: handleDeletePrompt, getPromptById: handleGetPromptById,
    addTag: handleAddTag, deleteTag: handleDeleteTag, addTagToCurrentPrompt: handleAddTagToCurrentPrompt,
    addFolder: handleAddFolder, updateFolder: handleUpdateFolder, deleteFolder: handleDeleteFolder,
    setCurrentFolderId, setSelectedPrompt,
    getPromptVersions: handleGetPromptVersions, restorePromptVersion: handleRestorePromptVersion, namePromptVersion: handleNamePromptVersion, addNoteToCurrentPrompt: handleAddNoteToCurrentPrompt,
    exportData: handleExportData, importData: handleImportData,
    addApiKey: handleAddApiKey, getApiKeys: handleGetApiKeys, deleteApiKey: handleDeleteApiKey, setActiveApiKey: handleSetActiveApiKey, // For Gemini
    saveExecutionPreset: handleSaveExecutionPreset, updateExecutionPreset: handleUpdateExecutionPreset, removeExecutionPreset: handleRemoveExecutionPreset,
    showToast, setIsZenMode, setSelectedTagIdForFiltering, setIsPowerPaletteOpen,
    pinPrompt: handlePinPrompt, unpinPrompt: handleUnpinPrompt, 
    showGlobalLoader, hideGlobalLoader,
    onOpenModal: openModalHandler, onCloseModal: closeModalHandler, loadData: loadData,
    aiGeneratePromptIdeaAndOpenModal: aiGeneratePromptIdeaAndOpenModal,
  }), [
    prompts, tags, folders, currentFolderId, selectedPrompt, isLoading, error, activeApiKey, apiKeys, executionPresets, isZenMode, selectedTagIdForFiltering, isPowerPaletteOpen, pinnedPromptIds, isGlobalLoading, globalLoadingMessage, supabaseClientHook, supabaseSession,
    handleAddPrompt, handleUpdatePrompt, handleDeletePrompt, handleGetPromptById,
    handleAddTag, handleDeleteTag, handleAddTagToCurrentPrompt,
    handleAddFolder, handleUpdateFolder, handleDeleteFolder,
    setCurrentFolderId, setSelectedPrompt,
    handleGetPromptVersions, handleRestorePromptVersion, handleNamePromptVersion, handleAddNoteToCurrentPrompt,
    handleExportData, handleImportData,
    handleAddApiKey, handleGetApiKeys, handleDeleteApiKey, handleSetActiveApiKey,
    handleSaveExecutionPreset, handleUpdateExecutionPreset, handleRemoveExecutionPreset,
    showToast, setIsZenMode, setSelectedTagIdForFiltering, setIsPowerPaletteOpen,
    handlePinPrompt, handleUnpinPrompt, 
    showGlobalLoader, hideGlobalLoader,
    openModalHandler, closeModalHandler, loadData, aiGeneratePromptIdeaAndOpenModal
  ]);

  const getToastStyle = () => {
    if (!toast) return {};
    switch (toast.type) {
      case 'success': return { backgroundColor: 'var(--toast-success-bg)', color: 'var(--toast-success-text)' };
      case 'error': return { backgroundColor: 'var(--toast-error-bg)', color: 'var(--toast-error-text)' };
      case 'info': return { backgroundColor: 'var(--toast-info-bg)', color: 'var(--toast-info-text)' };
      default: return { backgroundColor: 'var(--toast-info-bg)', color: 'var(--toast-info-text)' };
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {isGlobalLoading && <GlobalLoader message={globalLoadingMessage} />}
      {toast && (
        <div 
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-[100] px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-toastIn"
          style={getToastStyle()}
        >
          {toast.message}
        </div>
      )}
      {isPowerPaletteOpen && <PowerPaletteModal />}
      {modalState.type === 'smartStartChoice' && <SmartStartChoiceModal isOpen={true} onClose={closeModalHandler} onOpenModal={openModalHandler} />}
      {modalState.type === 'newPrompt' && (
        <NewPromptModal
          isOpen={true}
          onClose={closeModalHandler}
          initialCreationMode={modalState.props?.creationMode || 'blank'}
          initialContent={modalState.props?.initialContent || modalState.props?.initialContentFromBuilder}
          initialTitle={modalState.props?.initialTitle}
          initialNotes={modalState.props?.initialNotes}
          initialTagNames={modalState.props?.initialTagNames}
        />
      )}
      {modalState.type === 'newFolder' && <FolderModal isOpen={true} onClose={closeModalHandler} mode="newFolder" parentId={modalState.props?.parentId} />}
      {modalState.type === 'renameFolder' && <FolderModal isOpen={true} onClose={closeModalHandler} mode="renameFolder" folderToRename={modalState.props?.folderToRename} />}
      {modalState.type === 'versionHistory' && modalState.props?.prompt && <VersionHistoryModal isOpen={true} onClose={closeModalHandler} prompt={modalState.props.prompt} />}
      {modalState.type === 'deletePromptConfirm' && modalState.props?.promptId && (
        <ConfirmationModal
            isOpen={true}
            onClose={closeModalHandler}
            onConfirm={async () => {
                await handleDeletePrompt(modalState.props.promptId);
            }}
            title="Delete Prompt"
            message={<>Are you sure you want to delete the prompt "<strong>{modalState.props.promptTitle}</strong>"? This action cannot be undone.</>}
        />
      )}
      {modalState.type === 'deleteFolderConfirm' && modalState.props?.folderId && (
        <ConfirmationModal
            isOpen={true}
            onClose={closeModalHandler}
            onConfirm={() => handleDeleteFolder(modalState.props.folderId)}
            title="Delete Folder"
            message={<>Are you sure you want to delete the folder "<strong>{modalState.props.folderName}</strong>"? All prompts within will be moved to "(No Folder)". Subfolders will also be deleted. This action cannot be undone.</>}
        />
      )}
       {modalState.type === 'import' && <DataPortabilityModal isOpen={true} onClose={closeModalHandler} mode="import" />}
       {modalState.type === 'export' && <DataPortabilityModal isOpen={true} onClose={closeModalHandler} mode="export" />}
       {modalState.type === 'apiKeyManager' && <ApiKeyManagerModal isOpen={true} onClose={closeModalHandler} />}
       {modalState.type === 'curatedLibrary' && <CuratedLibraryModal isOpen={true} onClose={closeModalHandler} />}
       {modalState.type === 'visualChainBuilder' && modalState.props && (
            <VisualChainBuilderModal
                isOpen={true}
                onClose={closeModalHandler}
                initialContent={modalState.props.currentContent}
                onApplyContent={modalState.props.applyContentCallback}
                promptIdToExclude={modalState.props.promptIdToExclude}
                isNewChainSetup={modalState.props.isNewChainSetup}
            />
        )}
        {modalState.type === 'savePreset' && (
            <SavePresetModal
                isOpen={true}
                onClose={closeModalHandler}
                onSave={handleSavePresetFromModalCallback}
                initialName={modalState.props?.editingPreset?.name} 
                existingPresetNames={executionPresets.filter(p => p.id !== modalState.props?.editingPreset?.id).map(p=>p.name)}
            />
        )}
        {modalState.type === 'managePresets' && (
             <ManagePresetsModal isOpen={true} onClose={closeModalHandler} />
        )}
        {modalState.type === 'promptGraph' && ( 
            <PromptGraphModal isOpen={true} onClose={closeModalHandler} />
        )}
        {modalState.type === 'auth' && (
            <AuthModal 
                isOpen={true} 
                onClose={closeModalHandler} 
                initialMode={modalState.props?.initialMode || 'signIn'}
            />
        )}
    </AppContext.Provider>
  );
};
