
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo, useRef } from 'react';
import * as db from '../services/db';
import * as supabaseSync from '../services/supabaseSync';
import { Prompt, Tag, PromptVersion, ApiKeyEntry, Folder, ExportData, ModalType, ModelConfig, ExecutionPreset, CuratedPrompt } from '../types';
import { PINNED_PROMPTS_LOCAL_STORAGE_KEY, DEFAULT_API_KEY_NAME, DEFAULT_API_KEY_VALUE, PROMPT_VERSIONS_STORE } from '../constants';
import * as geminiService from '../services/geminiService'; 
import { debounce } from '../utils/debounce';

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
import AuthModal from '../components/modals/AuthModal'; 

import { SupabaseClient } from '@supabase/supabase-js';
import { Session, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';


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

  supabase: SupabaseClient; 
  supabaseSession: Session | null;

  addPrompt: (promptData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'versions' | 'tags' | 'user_id' | 'supabase_synced_at'> & { tagNames?: string[], folderId?: string | null, _initialEditorMode?: 'abTest' | 'chainBlueprint', id?: string }) => Promise<Prompt | null>;
  updatePrompt: (id: string, promptData: Partial<Omit<Prompt, 'id' | 'created_at' | 'versions' | 'supabase_synced_at'>> & { tagNames?: string[] }) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>; 
  getPromptById: (id: string) => Promise<Prompt | undefined>;
  
  addTag: (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'supabase_synced_at'>) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<void>; 
  addTagToCurrentPrompt: (promptId: string, tagName: string) => Promise<void>; 

  addFolder: (name: string, parentId?: string | null) => Promise<Folder | null>;
  updateFolder: (id: string, name: string, parentId?: string | null) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>; 

  setCurrentFolderId: (folderId?: string | null) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  
  getPromptVersions: (promptId: string) => Promise<PromptVersion[]>;
  restorePromptVersion: (versionId: string) => Promise<void>; 
  namePromptVersion: (versionId: string, commitMessage: string) => Promise<void>; 
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
  aiGeneratePromptIdeaAndOpenModal: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

const SYNC_DEBOUNCE_DELAY = 2500; // 2.5 seconds

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [promptVersions, setPromptVersions] = useState<Record<string, PromptVersion[]>>({});
  const [currentFolderId, _setCurrentFolderId] = useState<string | null | undefined>(undefined); 
  const [selectedPrompt, _setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [activeApiKey, setActiveApiKey] = useState<ApiKeyEntry | null>(null);
  const [executionPresets, setExecutionPresets] = useState<ExecutionPreset[]>([]); 
  const [isZenMode, setIsZenMode] = useState(true); 
  const [selectedTagIdForFiltering, _setSelectedTagIdForFiltering] = useState<string | null>(null);
  const [isPowerPaletteOpen, setIsPowerPaletteOpen] = useState(false);
  const [modalState, setModalState] = useState<{ type: ModalType | null; props?: any }>({ type: null });
  const [pinnedPromptIds, setPinnedPromptIds] = useState<string[]>(() => { 
    const stored = localStorage.getItem(PINNED_PROMPTS_LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null);

  const supabaseSession = useSession();
  const supabaseClientHook = useSupabaseClient<any>(); 


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
      openModalHandler('apiKeyManager'); 
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
        creationMode: 'blank', 
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
  }, []);

  const setCurrentFolderId = useCallback((folderId?: string | null) => {
      _setCurrentFolderId(folderId);
      setSelectedPrompt(null); 
  }, [setSelectedPrompt]);

  const setSelectedTagIdForFiltering = useCallback((tagId: string | null) => {
    _setSelectedTagIdForFiltering(tagId);
    setSelectedPrompt(null);
  }, [setSelectedPrompt]);

  const loadData = useCallback(async (folderIdToFilterBy?: string | null) => {
    setIsLoading(true);
    setError(null);
    const currentUserId = supabaseSession?.user?.id;

    try {
        let loadedPrompts: Prompt[] = [];
        let loadedTags: Tag[] = [];
        let loadedFolders: Folder[] = [];
        
        if (currentUserId) {
            showGlobalLoader("Syncing with cloud..."); 
            const [sbPrompts, sbTags, sbFolders, sbVersions] = await Promise.all([
                supabaseSync.fetchPromptsFromSupabase(supabaseClientHook, currentUserId),
                supabaseSync.fetchTagsFromSupabase(supabaseClientHook, currentUserId),
                supabaseSync.fetchFoldersFromSupabase(supabaseClientHook, currentUserId),
                supabaseSync.fetchAllPromptVersionsForUserFromSupabase(supabaseClientHook, currentUserId)
            ]);

            for (const sbPrompt of sbPrompts) {
                const localPrompt = await db.getPrompt(sbPrompt.id);
                if (!localPrompt || new Date(sbPrompt.updated_at) > new Date(localPrompt.updated_at)) {
                    await db.addPrompt({ ...sbPrompt, supabase_synced_at: sbPrompt.updated_at });
                }
            }
            for (const sbTag of sbTags) {
                const localTag = await db.getTag(sbTag.id);
                 if (!localTag || new Date(sbTag.updated_at) > new Date(localTag.updated_at)) {
                    await db.addTag({ ...sbTag, supabase_synced_at: sbTag.updated_at });
                }
            }
            for (const sbFolder of sbFolders) {
                const localFolder = await db.getFolder(sbFolder.id);
                 if (!localFolder || new Date(sbFolder.updated_at) > new Date(localFolder.updated_at)) {
                    await db.addFolder({ ...sbFolder, supabase_synced_at: sbFolder.updated_at });
                }
            }
            for (const sbVersion of sbVersions) { 
                const localVersion = await db.getLocalItemById<PromptVersion>(PROMPT_VERSIONS_STORE, sbVersion.id);
                if (!localVersion || new Date(sbVersion.created_at) > new Date(localVersion.created_at)) {
                     await db.addPromptVersion(sbVersion); 
                }
            }
            hideGlobalLoader();
        }

        loadedPrompts = await db.getAllPrompts(currentUserId, folderIdToFilterBy);
        loadedTags = await db.getAllTags(currentUserId);
        loadedFolders = await db.getAllFolders(currentUserId);
        
        const versionsMap: Record<string, PromptVersion[]> = {};
        for (const p of loadedPrompts) {
            versionsMap[p.id] = await db.getPromptVersions(p.id, currentUserId);
        }
        setPromptVersions(versionsMap);

        setPrompts(loadedPrompts);
        setTags(loadedTags);
        setFolders(loadedFolders);

        const loadedKeys = await db.getApiKeys();
        setApiKeys(loadedKeys);
        const currentActiveGeminiKey = await db.getActiveApiKey();
        setActiveApiKey(currentActiveGeminiKey || null);
        const loadedPresets = await db.getAllExecutionPresets();
        setExecutionPresets(loadedPresets);

    } catch (e: any) {
        console.error("Failed to load data:", e);
        setError(e.message || 'Failed to load data.');
        showToast(e.message || 'Failed to load data.', 'error');
        hideGlobalLoader();
    } finally {
        setIsLoading(false);
    }
  }, [supabaseSession, supabaseClientHook, showToast, showGlobalLoader, hideGlobalLoader]);


  useEffect(() => {
    loadData(currentFolderId);
  }, [currentFolderId, loadData, supabaseSession]); 

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

  // --- Debounced Sync Functions ---
  const debouncedSyncPrompt = useCallback(
    debounce(async (promptId: string, userId: string) => {
      // showGlobalLoader(`Syncing prompt...`); // Removed global loader
      try {
        const promptToSync = await db.getPrompt(promptId);
        if (promptToSync && promptToSync.user_id === userId) {
          const syncedOnlinePrompt = await supabaseSync.syncPromptToSupabase(supabaseClientHook, promptToSync);
          if (syncedOnlinePrompt) {
            const versions = await db.getPromptVersions(promptId, userId);
            if (versions.length > 0) { 
              await supabaseSync.syncPromptVersionToSupabase(supabaseClientHook, versions[0]);
            }
            const { updatedPrompt: finalLocalPrompt } = await db.updatePrompt(syncedOnlinePrompt.id, { supabase_synced_at: new Date().toISOString(), user_id: userId });
            setPrompts(prev => prev.map(p => p.id === finalLocalPrompt.id ? finalLocalPrompt : p));
            showToast(`Prompt "${finalLocalPrompt.title}" synced to cloud.`, 'success');
          } else {
            showToast(`Failed to sync prompt "${promptToSync.title}" to cloud.`, 'error');
          }
        }
      } catch (e: any) {
        showToast(`Error syncing prompt: ${e.message}`, 'error');
      } finally {
        // hideGlobalLoader(); // Removed global loader
      }
    }, SYNC_DEBOUNCE_DELAY),
    [supabaseClientHook, showToast, setPrompts] // Removed showGlobalLoader, hideGlobalLoader
  );

  const debouncedSyncTag = useCallback(
    debounce(async (tagId: string, userId: string) => {
      // showGlobalLoader(`Syncing tag...`); // Removed global loader
      try {
        const tagToSync = await db.getTag(tagId);
        if (tagToSync && tagToSync.user_id === userId) {
          const syncedTag = await supabaseSync.syncTagToSupabase(supabaseClientHook, tagToSync);
          if (syncedTag) {
            const updatedLocalTag = await db.updateTag(syncedTag.id, { supabase_synced_at: new Date().toISOString(), user_id: userId });
            setTags(prev => prev.map(t => t.id === updatedLocalTag.id ? updatedLocalTag : t).sort((a,b) => a.name.localeCompare(b.name)));
            showToast(`Tag "${updatedLocalTag.name}" synced to cloud.`, 'success');
          } else {
            showToast(`Failed to sync tag "${tagToSync.name}" to cloud.`, 'error');
          }
        }
      } catch (e: any) {
        showToast(`Error syncing tag: ${e.message}`, 'error');
      } finally {
        // hideGlobalLoader(); // Removed global loader
      }
    }, SYNC_DEBOUNCE_DELAY),
    [supabaseClientHook, showToast, setTags] // Removed showGlobalLoader, hideGlobalLoader
  );

  const debouncedSyncFolder = useCallback(
    debounce(async (folderId: string, userId: string) => {
      // showGlobalLoader(`Syncing folder...`); // Removed global loader
      try {
        const folderToSync = await db.getFolder(folderId);
        if (folderToSync && folderToSync.user_id === userId) {
          const syncedFolder = await supabaseSync.syncFolderToSupabase(supabaseClientHook, folderToSync);
          if (syncedFolder) {
            const updatedLocalFolder = await db.updateFolder(syncedFolder.id, { supabase_synced_at: new Date().toISOString(), user_id: userId });
            setFolders(prev => prev.map(f => f.id === updatedLocalFolder.id ? updatedLocalFolder : f).sort((a,b) => a.name.localeCompare(b.name)));
            showToast(`Folder "${updatedLocalFolder.name}" synced to cloud.`, 'success');
          } else {
            showToast(`Failed to sync folder "${folderToSync.name}" to cloud.`, 'error');
          }
        }
      } catch (e: any) {
        showToast(`Error syncing folder: ${e.message}`, 'error');
      } finally {
        // hideGlobalLoader(); // Removed global loader
      }
    }, SYNC_DEBOUNCE_DELAY),
    [supabaseClientHook, showToast, setFolders] // Removed showGlobalLoader, hideGlobalLoader
  );
  
  const debouncedSyncPromptVersion = useCallback(
    debounce(async (versionId: string, userId: string) => {
      // showGlobalLoader(`Syncing version...`); // Removed global loader
      try {
        const versionToSync = await db.getLocalItemById<PromptVersion>(PROMPT_VERSIONS_STORE, versionId);
        if (versionToSync && versionToSync.user_id === userId) {
          const syncedVersion = await supabaseSync.syncPromptVersionToSupabase(supabaseClientHook, versionToSync);
          if (syncedVersion) {
            await db.addPromptVersion({ ...versionToSync, supabase_synced_at: new Date().toISOString()});
            showToast(`Version synced to cloud.`, 'success');
          } else {
            showToast(`Failed to sync version to cloud.`, 'error');
          }
        }
      } catch (e: any) {
        showToast(`Error syncing version: ${e.message}`, 'error');
      } finally {
        // hideGlobalLoader(); // Removed global loader
      }
    }, SYNC_DEBOUNCE_DELAY),
    [supabaseClientHook, showToast] // Removed showGlobalLoader, hideGlobalLoader
  );

  // --- CRUD Handlers using Debounced Sync ---
  const handleAddTag = useCallback(async (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'supabase_synced_at'>) => {
    const currentUserId = supabaseSession?.user?.id;
    if (!currentUserId) {
        showToast('You must be logged in to add tags.', 'error');
        return null;
    }
    try {
      const localTag = await db.addTag({ ...tagData, user_id: currentUserId });
      setTags(prev => {
        const existing = prev.find(t => t.id === localTag.id);
        if (existing) return prev.map(t => t.id === localTag.id ? localTag : t).sort((a,b) => a.name.localeCompare(b.name));
        return [...prev, localTag].sort((a,b) => a.name.localeCompare(b.name));
      });
      showToast('Tag added locally. Syncing to cloud...', 'info');
      debouncedSyncTag(localTag.id, currentUserId);
      return localTag;
    } catch (e: any) {
      setError(e.message || 'Failed to add tag.');
      showToast(e.message || 'Failed to add tag.', 'error');
      return null;
    }
  }, [supabaseSession, showToast, debouncedSyncTag, setTags]);


  const handleAddPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'versions' | 'tags' | 'user_id' | 'supabase_synced_at'> & { tagNames?: string[], folderId?: string | null, _initialEditorMode?: 'abTest' | 'chainBlueprint', id?: string }) => { 
    const currentUserId = supabaseSession?.user?.id;
    if (!currentUserId) {
        showToast('You must be logged in to create prompts.', 'error');
        return null;
    }
    try {
      let tagIds: string[] = [];
      if (promptData.tagNames && promptData.tagNames.length > 0) {
        const newOrExistingTagsPromises = promptData.tagNames.map(name => handleAddTag({ name }));
        const newOrExistingTagsResults = await Promise.all(newOrExistingTagsPromises);
        tagIds = newOrExistingTagsResults.filter((t): t is Tag => t !== null).map(t => t.id);
      }
      
      const localPromptData = { ...promptData, tags: tagIds, user_id: currentUserId, id: promptData.id || undefined };
      const newPromptFromDb = await db.addPrompt(localPromptData);
      
      setPrompts(prev => [newPromptFromDb, ...prev.filter(p => p.id !== newPromptFromDb.id)].sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      const newVersion = (await db.getPromptVersions(newPromptFromDb.id, currentUserId))[0];
      if (newVersion) {
          setPromptVersions(prev => ({...prev, [newPromptFromDb.id]: [newVersion]}));
      }
      
      setSelectedPrompt({ ...newPromptFromDb, _initialEditorMode: promptData._initialEditorMode });
      showToast('Prompt created locally. Syncing to cloud...', 'info');
      debouncedSyncPrompt(newPromptFromDb.id, currentUserId);
      return newPromptFromDb;
    } catch (e: any) {
      setError(e.message || 'Failed to add prompt.');
      showToast(e.message || 'Failed to add prompt.', 'error');
      return null;
    }
  }, [supabaseSession, showToast, setSelectedPrompt, debouncedSyncPrompt, handleAddTag]); 


  const handleUpdatePrompt = useCallback(async (id: string, promptData: Partial<Omit<Prompt, 'id' | 'created_at' | 'versions' | 'supabase_synced_at'>> & { tagNames?: string[] }) => {
    const currentUserId = supabaseSession?.user?.id;
    if (!currentUserId) {
        showToast('You must be logged in to update prompts.', 'error');
        return;
    }
    try {
      let tagIdsToUpdate: string[] | undefined = undefined;
      if (promptData.tagNames) {
          tagIdsToUpdate = [];
          if (promptData.tagNames.length > 0) {
            const newOrExistingTagsPromises = promptData.tagNames.map(name => handleAddTag({ name }));
            const newOrExistingTagsResults = await Promise.all(newOrExistingTagsPromises);
            tagIdsToUpdate = newOrExistingTagsResults.filter((t): t is Tag => t !== null).map(t => t.id);
          }
      }

      const finalPromptData = { ...promptData, tags: tagIdsToUpdate, user_id: currentUserId, updated_at: new Date().toISOString() };
      if (tagIdsToUpdate === undefined) delete (finalPromptData as any).tags; 

      const {updatedPrompt: localUpdatedPrompt, newVersion: localNewVersion} = await db.updatePrompt(id, finalPromptData);
      
      setPrompts(prev => prev.map(p => p.id === id ? localUpdatedPrompt : p).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
      if (localNewVersion) {
          setPromptVersions(prev => ({...prev, [id]: [localNewVersion, ...(prev[id] || [])].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) }));
      }
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(localUpdatedPrompt);
      }
      showToast('Prompt updated locally. Syncing to cloud...', 'info');
      debouncedSyncPrompt(id, currentUserId);
    } catch (e: any) {
      setError(e.message || 'Failed to update prompt.');
      showToast(e.message || 'Failed to update prompt.', 'error');
    }
  }, [supabaseSession, selectedPrompt, showToast, setSelectedPrompt, debouncedSyncPrompt, handleAddTag]);

  const handleDeletePrompt = useCallback(async (id: string) => { // Deletes are immediate
    showGlobalLoader("Deleting prompt from cloud...");
    try {
      await db.deletePrompt(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
      setPromptVersions(prev => { const {[id]:_ , ...rest} = prev; return rest; });
      if (selectedPrompt?.id === id) {
        setSelectedPrompt(null);
      }
      handleUnpinPrompt(id);

      if (supabaseSession?.user?.id) {
          const { error } = await supabaseClientHook.from('prompts').delete().match({ id: id, user_id: supabaseSession.user.id });
          if (error) throw error;
           await supabaseClientHook.from('prompt_versions').delete().match({ prompt_id: id, user_id: supabaseSession.user.id });
      }
      showToast('Prompt deleted from cloud.', 'success');
    } catch (e: any) {
      setError(e.message || 'Failed to delete prompt.');
      showToast(e.message || 'Failed to delete prompt.', 'error');
    } finally {
        hideGlobalLoader();
    }
  }, [selectedPrompt, showToast, handleUnpinPrompt, setSelectedPrompt, supabaseSession, supabaseClientHook, hideGlobalLoader, showGlobalLoader]);
  
  const handleGetPromptById = useCallback(async (id: string): Promise<Prompt | undefined> => {
    try {
      return await db.getPrompt(id);
    } catch (e:any) {
      showToast(e.message || 'Failed to fetch prompt.', 'error');
      return undefined;
    }
  }, [showToast]);


  const handleDeleteTag = useCallback(async (id: string) => { // Deletes are immediate
    showGlobalLoader("Deleting tag from cloud...");
    try {
      const tagToDelete = tags.find(t => t.id === id);
      await db.deleteTag(id); 
      const affectedPrompts = prompts.filter(p => p.tags.includes(id));
      setTags(prev => prev.filter(t => t.id !== id));
      
      if (supabaseSession?.user?.id) {
          const { error } = await supabaseClientHook.from('tags').delete().match({ id: id, user_id: supabaseSession.user.id });
          if (error) throw error;
          for (const p of affectedPrompts) {
            const updatedPromptData = await db.getPrompt(p.id); 
            if (updatedPromptData) await supabaseSync.syncPromptToSupabase(supabaseClientHook, updatedPromptData);
          }
      }
      await loadData(currentFolderId); 
      showToast(`Tag "${tagToDelete?.name || 'Tag'}" deleted from cloud.`, 'success');
    } catch (e: any) {
      setError(e.message || 'Failed to delete tag.');
      showToast(e.message || 'Failed to delete tag.', 'error');
    } finally {
        hideGlobalLoader();
    }
  }, [currentFolderId, loadData, showToast, supabaseSession, supabaseClientHook, prompts, tags, hideGlobalLoader, showGlobalLoader]);

  const handleAddTagToCurrentPrompt = useCallback(async (promptId: string, tagName: string) => {
    const prompt = await db.getPrompt(promptId);
    if (!prompt) {
        showToast("Prompt not found to add tag.", 'error');
        return;
    }
    const currentTagNames = (await Promise.all(prompt.tags.map(tagId => db.getTag(tagId))))
                            .filter((t): t is Tag => t !== undefined).map(t => t.name);

    if (!currentTagNames.includes(tagName)) {
        const updatedTagNames = [...currentTagNames, tagName];
        await handleUpdatePrompt(promptId, { tagNames: updatedTagNames }); 
        showToast(`Tag "${tagName}" added to prompt. Syncing to cloud...`, 'success');
    } else {
        showToast(`Tag "${tagName}" already on prompt.`, 'info');
    }
  }, [handleUpdatePrompt, showToast]);


  const handleAddFolder = useCallback(async (name: string, parentId?: string | null) => {
    const currentUserId = supabaseSession?.user?.id;
    if (!currentUserId) {
        showToast('You must be logged in to create folders.', 'error');
        return null;
    }
    try {
        const localFolder = await db.addFolder({ name, parentId: parentId || null, user_id: currentUserId });
        setFolders(prev => [...prev, localFolder].sort((a,b) => a.name.localeCompare(b.name)));
        showToast('Folder created locally. Syncing to cloud...', 'info');
        debouncedSyncFolder(localFolder.id, currentUserId);
        return localFolder;
    } catch (e: any) {
        setError(e.message || 'Failed to create folder.');
        showToast(e.message || 'Failed to create folder.', 'error');
        return null;
    }
  }, [showToast, supabaseSession, debouncedSyncFolder]);

  const handleUpdateFolder = useCallback(async (id: string, name: string, parentId?: string | null) => {
    const currentUserId = supabaseSession?.user?.id;
    if (!currentUserId) {
        showToast('You must be logged in to update folders.', 'error');
        return;
    }
    try {
        const localUpdatedFolder = await db.updateFolder(id, { name, parentId: parentId === undefined ? null : parentId, user_id: currentUserId });
        setFolders(prev => prev.map(f => f.id === id ? localUpdatedFolder : f).sort((a,b) => a.name.localeCompare(b.name)));
        showToast('Folder updated locally. Syncing to cloud...', 'info');
        debouncedSyncFolder(id, currentUserId);
    } catch (e: any) {
        setError(e.message || 'Failed to update folder.');
        showToast(e.message || 'Failed to update folder.', 'error');
    }
  }, [showToast, supabaseSession, debouncedSyncFolder]);
  
  const handleDeleteFolder = useCallback(async (id: string) => { // Deletes are immediate
    showGlobalLoader("Deleting folder from cloud...");
    try {
        const folderToDelete = folders.find(f => f.id === id);
        await db.deleteFolder(id); 
        const affectedPrompts = prompts.filter(p => p.folderId === id);
        
        if(supabaseSession?.user?.id){
            const { error } = await supabaseClientHook.from('folders').delete().match({ id: id, user_id: supabaseSession.user.id });
            if (error) throw error;
            for (const p of affectedPrompts) { 
                const updatedPrompt = await db.getPrompt(p.id);
                if (updatedPrompt) await supabaseSync.syncPromptToSupabase(supabaseClientHook, updatedPrompt);
            }
        }
        await loadData(currentFolderId); 
        if(currentFolderId === id) setCurrentFolderId(undefined); 
        showToast(`Folder "${folderToDelete?.name || 'Folder'}" deleted from cloud.`, 'success');
    } catch (e: any) {
        setError(e.message || 'Failed to delete folder.');
        showToast(e.message || 'Failed to delete folder.', 'error');
    } finally {
        hideGlobalLoader();
    }
  }, [currentFolderId, loadData, showToast, supabaseSession, supabaseClientHook, prompts, folders, hideGlobalLoader, showGlobalLoader, setCurrentFolderId]);

  const handleGetPromptVersions = useCallback(async (promptId: string) => {
      try {
          const localVersions = promptVersions[promptId];
          if (localVersions) return localVersions;
          const versionsFromDb = await db.getPromptVersions(promptId, supabaseSession?.user?.id);
          setPromptVersions(prev => ({...prev, [promptId]: versionsFromDb}));
          return versionsFromDb;
      } catch (e: any) {
          showToast(e.message || 'Failed to fetch versions.', 'error');
          return [];
      }
  }, [showToast, promptVersions, supabaseSession]);
  
  const handleRestorePromptVersion = useCallback(async (versionId: string) => { 
      showGlobalLoader("Restoring version..."); 
      try {
          const updatedPrompt = await db.restorePromptVersion(versionId); 
          setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
          if (selectedPrompt?.id === updatedPrompt.id) {
              setSelectedPrompt(updatedPrompt);
          }
          if (supabaseSession?.user?.id) {
            debouncedSyncPrompt(updatedPrompt.id, supabaseSession.user.id);
          }
          showToast('Prompt version restored. Syncing changes to cloud...', 'success');
      } catch (e: any) {
          showToast(e.message || 'Failed to restore version.', 'error');
      } finally {
          hideGlobalLoader();
      }
  }, [selectedPrompt, showToast, setSelectedPrompt, supabaseSession, debouncedSyncPrompt, hideGlobalLoader, showGlobalLoader]);

  const handleNamePromptVersion = useCallback(async (versionId: string, commitMessage: string) => { 
      const currentUserId = supabaseSession?.user?.id;
      try {
          const updatedVersion = await db.namePromptVersion(versionId, commitMessage, currentUserId);
          if (updatedVersion) {
              setPromptVersions(prev => ({
                  ...prev,
                  [updatedVersion.prompt_id]: (prev[updatedVersion.prompt_id] || []).map(v => v.id === versionId ? updatedVersion : v)
              }));
              if (currentUserId) { 
                  debouncedSyncPromptVersion(versionId, currentUserId);
              }
          }
          showToast('Version named locally. Syncing to cloud...', 'success');
      } catch(e: any) {
          showToast(e.message || 'Failed to name version.', 'error');
      }
  }, [showToast, supabaseSession, debouncedSyncPromptVersion]);

  const handleAddNoteToCurrentPrompt = useCallback(async (promptId: string, noteContent: string) => {
    const prompt = await db.getPrompt(promptId);
    if (!prompt) {
        showToast("Prompt not found to add note.", 'error');
        return;
    }
    const newNotes = prompt.notes ? `${prompt.notes}\n\n${noteContent}` : noteContent;
    await handleUpdatePrompt(promptId, { notes: newNotes }); 
    showToast(`Note added to prompt. Syncing to cloud...`, 'success');
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
      showGlobalLoader("Importing data...");
      try {
          await db.importData(data, mode, supabaseSession?.user?.id); 
          await loadData(undefined); 
          setCurrentFolderId(undefined); 
          setSelectedTagIdForFiltering(null); 
          showToast('Data imported successfully! Syncing changes to cloud...', 'success');
      } catch (e:any) {
          showToast(e.message || 'Failed to import data.', 'error');
      } finally {
          hideGlobalLoader();
      }
  }, [loadData, showToast, setCurrentFolderId, setSelectedTagIdForFiltering, supabaseSession, hideGlobalLoader, showGlobalLoader]);

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
    activeApiKey, 
    apiKeys, 
    executionPresets, isZenMode, selectedTagIdForFiltering, isPowerPaletteOpen, pinnedPromptIds, isGlobalLoading, globalLoadingMessage,
    supabase: supabaseClientHook, 
    supabaseSession: supabaseSession,

    addPrompt: handleAddPrompt, updatePrompt: handleUpdatePrompt, deletePrompt: handleDeletePrompt, getPromptById: handleGetPromptById,
    addTag: handleAddTag, deleteTag: handleDeleteTag, addTagToCurrentPrompt: handleAddTagToCurrentPrompt,
    addFolder: handleAddFolder, updateFolder: handleUpdateFolder, deleteFolder: handleDeleteFolder,
    setCurrentFolderId, setSelectedPrompt,
    getPromptVersions: handleGetPromptVersions, restorePromptVersion: handleRestorePromptVersion, namePromptVersion: handleNamePromptVersion, addNoteToCurrentPrompt: handleAddNoteToCurrentPrompt,
    exportData: handleExportData, importData: handleImportData,
    addApiKey: handleAddApiKey, getApiKeys: handleGetApiKeys, deleteApiKey: handleDeleteApiKey, setActiveApiKey: handleSetActiveApiKey, 
    saveExecutionPreset: handleSaveExecutionPreset, updateExecutionPreset: handleUpdateExecutionPreset, removeExecutionPreset: handleRemoveExecutionPreset,
    showToast, setIsZenMode, setSelectedTagIdForFiltering, setIsPowerPaletteOpen,
    pinPrompt: handlePinPrompt, unpinPrompt: handleUnpinPrompt, 
    showGlobalLoader, hideGlobalLoader,
    onOpenModal: openModalHandler, onCloseModal: closeModalHandler, loadData: loadData,
    aiGeneratePromptIdeaAndOpenModal: aiGeneratePromptIdeaAndOpenModal,
  }), [
    prompts, tags, folders, currentFolderId, selectedPrompt, isLoading, error, activeApiKey, apiKeys, executionPresets, isZenMode, selectedTagIdForFiltering, isPowerPaletteOpen, pinnedPromptIds, isGlobalLoading, globalLoadingMessage, 
    supabaseClientHook, supabaseSession, 
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
