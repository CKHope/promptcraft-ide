
import { IDBPDatabase, openDB, IDBPTransaction } from 'idb';
import { Prompt, Tag, PromptVersion, SyncQueueItem, PromptTagLink, ExportData, ApiKeyEntry, Folder, ExecutionPreset } from '../types';
import { 
    DB_NAME, DB_VERSION, PROMPTS_STORE, TAGS_STORE, PROMPT_TAGS_STORE, PROMPT_VERSIONS_STORE, 
    SYNC_QUEUE_STORE, API_KEYS_STORE, FOLDERS_STORE, EXECUTION_PRESETS_STORE, generateUUID,
    DEFAULT_API_KEY_VALUE, DEFAULT_API_KEY_NAME
} from '../constants';

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

// AES-GCM Key Management
const CRYPTO_KEY_STORAGE_NAME = 'promptcraft-crypto-key';
let appCryptoKey: CryptoKey | null = null;

async function getAppCryptoKey(): Promise<CryptoKey> {
    if (appCryptoKey) return appCryptoKey;

    const storedKeyMaterial = localStorage.getItem(CRYPTO_KEY_STORAGE_NAME);
    if (storedKeyMaterial) {
        try {
            const jwk = JSON.parse(storedKeyMaterial);
            appCryptoKey = await crypto.subtle.importKey(
                'jwk',
                jwk,
                { name: 'AES-GCM' },
                true, // key is extractable
                ['encrypt', 'decrypt']
            );
            return appCryptoKey;
        } catch (e) {
            console.error("Failed to import stored crypto key, generating new one.", e);
            localStorage.removeItem(CRYPTO_KEY_STORAGE_NAME); // Remove corrupted/invalid key
        }
    }

    appCryptoKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // key is extractable
        ['encrypt', 'decrypt']
    );
    const jwk = await crypto.subtle.exportKey('jwk', appCryptoKey);
    localStorage.setItem(CRYPTO_KEY_STORAGE_NAME, JSON.stringify(jwk));
    console.log("New application crypto key generated and stored.");
    return appCryptoKey;
}

async function secureEncrypt(text: string): Promise<string> {
    if (!text) return ""; // Handle empty input gracefully
    const key = await getAppCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bits is recommended for AES-GCM
    const encodedText = new TextEncoder().encode(text);

    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedText
    );

    // Convert ArrayBuffer to Base64 string
    const ivString = btoa(String.fromCharCode(...iv));
    const ciphertextString = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
    
    return `${ivString}.${ciphertextString}`;
}

async function secureDecrypt(encryptedData: string): Promise<string> {
    if (!encryptedData) return ""; // Handle empty input gracefully

    const key = await getAppCryptoKey();
    const parts = encryptedData.split('.');
    
    if (parts.length !== 2) {
        console.warn("Encrypted data is not in the expected AES-GCM format (iv.ciphertext). Decryption may fail or key needs re-adding.");
        throw new Error("Invalid encrypted data format. The API key might be from an older version or corrupted. Please re-add the key.");
    }

    try {
        const iv = new Uint8Array(atob(parts[0]).split('').map(char => char.charCodeAt(0)));
        const ciphertext = new Uint8Array(atob(parts[1]).split('').map(char => char.charCodeAt(0)));

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );
        return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
        console.error("AES-GCM Decryption failed:", e);
        throw new Error("Failed to decrypt API key. It might be corrupted or from an incompatible version. Please re-add the key.");
    }
}


const getDb = (): Promise<IDBPDatabase<any>> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);
        if (oldVersion < 1) { 
            if (!db.objectStoreNames.contains(PROMPTS_STORE)) {
              const promptsStore = db.createObjectStore(PROMPTS_STORE, { keyPath: 'id' });
              promptsStore.createIndex('title', 'title', { unique: false });
              promptsStore.createIndex('updated_at', 'updated_at', { unique: false });
              promptsStore.createIndex('user_id', 'user_id', { unique: false });
            }
            if (!db.objectStoreNames.contains(TAGS_STORE)) {
              const tagsStore = db.createObjectStore(TAGS_STORE, { keyPath: 'id' });
              tagsStore.createIndex('name', 'name', { unique: true }); 
              tagsStore.createIndex('user_id', 'user_id', { unique: false });
            }
            if (!db.objectStoreNames.contains(PROMPT_TAGS_STORE)) {
                const promptTagsStore = db.createObjectStore(PROMPT_TAGS_STORE, { autoIncrement: true, keyPath: 'id' });
                promptTagsStore.createIndex('prompt_id_tag_id', ['prompt_id', 'tag_id'], { unique: true });
                promptTagsStore.createIndex('prompt_id', 'prompt_id', { unique: false });
                promptTagsStore.createIndex('tag_id', 'tag_id', { unique: false });
            }
            if (!db.objectStoreNames.contains(PROMPT_VERSIONS_STORE)) {
              const versionsStore = db.createObjectStore(PROMPT_VERSIONS_STORE, { autoIncrement: true, keyPath: 'id' });
              versionsStore.createIndex('prompt_id', 'prompt_id', { unique: false });
              versionsStore.createIndex('created_at', 'created_at', { unique: false });
            }
            if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
              db.createObjectStore(SYNC_QUEUE_STORE, { autoIncrement: true, keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(API_KEYS_STORE)) {
              const apiKeysStore = db.createObjectStore(API_KEYS_STORE, { keyPath: 'id' });
              apiKeysStore.createIndex('name', 'name', {unique: true});
              apiKeysStore.createIndex('isActive', 'isActive', {unique: false});
            }
        }
        if (oldVersion < 2) { 
            if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
                const foldersStore = db.createObjectStore(FOLDERS_STORE, { keyPath: 'id' });
                foldersStore.createIndex('name', 'name', { unique: false }); 
                foldersStore.createIndex('parentId', 'parentId', { unique: false });
            }
            const promptsStore = transaction.objectStore(PROMPTS_STORE);
            if (!promptsStore.indexNames.contains('folderId')) {
                promptsStore.createIndex('folderId', 'folderId', { unique: false });
            }
        }
        if (oldVersion < 3) {
            if (!db.objectStoreNames.contains(EXECUTION_PRESETS_STORE)) {
                const presetsStore = db.createObjectStore(EXECUTION_PRESETS_STORE, { keyPath: 'id' });
                presetsStore.createIndex('name', 'name', { unique: true });
                presetsStore.createIndex('updated_at', 'updated_at', { unique: false });
            }
             // Note: The new `firstSuccessfulResultText` field in PROMPTS_STORE is optional
             // and doesn't require an index, so no explicit schema migration needed for it
             // for DB_VERSION 3, assuming it's added as part of the application logic using this DB version.
        }
      },
    });
  }
  return dbPromise;
};


// Prompt CRUD
export const addPrompt = async (promptData: Omit<Prompt, 'created_at' | 'updated_at' | 'versions'> & { id?: string }): Promise<Prompt> => {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = promptData.id || generateUUID(); // Use provided ID or generate new
  
  // Ensure we don't accidentally pass the 'id' property from promptData if it was undefined initially
  const { id:_discardId, ...baseData } = promptData;

  const newPromptBase: Omit<Prompt, 'tags' | 'id'> = { 
    ...baseData, 
    folderId: promptData.folderId === undefined ? null : promptData.folderId,
    created_at: now, 
    updated_at: now,
    versions: [],
    firstSuccessfulResultText: null, // Initialize new field
  };
  const newPrompt: Prompt = { ...newPromptBase, id, tags: promptData.tags || [] };

  const initialVersion: Omit<PromptVersion, 'id'> = {
    prompt_id: id,
    content: newPrompt.content,
    notes: newPrompt.notes,
    created_at: now,
  };
  
  const tx = db.transaction([PROMPTS_STORE, PROMPT_VERSIONS_STORE, PROMPT_TAGS_STORE], 'readwrite');
  
  // Check if prompt with this ID already exists, if so, we might be updating it (e.g. re-importing a curated prompt)
  const existingPrompt = await tx.objectStore(PROMPTS_STORE).get(id);
  if (existingPrompt) {
    // Overwrite existing prompt if ID matches (useful for curated prompt imports)
    // Ensure firstSuccessfulResultText is preserved or reset based on import logic.
    // For a direct add, if it exists, its firstSuccessfulResultText should be kept.
    // However, addPrompt is typically for new prompts. If an ID collision happens with a curated import,
    // the import logic should ideally handle merging or explicit overwriting of such fields.
    // For this basic addPrompt, we assume we want to update the full record.
    // Let's ensure 'firstSuccessfulResultText' from incoming promptData (if any) is used, or null if not specified.
    newPrompt.firstSuccessfulResultText = promptData.firstSuccessfulResultText === undefined ? existingPrompt.firstSuccessfulResultText : promptData.firstSuccessfulResultText;
    await tx.objectStore(PROMPTS_STORE).put(newPrompt);
  } else {
    await tx.objectStore(PROMPTS_STORE).add(newPrompt);
  }
  
  await tx.objectStore(PROMPT_VERSIONS_STORE).add(initialVersion);


  // Clear existing tag links for this prompt before adding new ones, especially if updating
  const existingLinks = await tx.objectStore(PROMPT_TAGS_STORE).index('prompt_id').getAll(id);
  for (const link of existingLinks) {
    if(link.id) await tx.objectStore(PROMPT_TAGS_STORE).delete(link.id);
  }
  // Add new tag links
  if (newPrompt.tags) {
    for (const tagId of newPrompt.tags) {
      await tx.objectStore(PROMPT_TAGS_STORE).add({ prompt_id: id, tag_id: tagId });
    }
  }
  await tx.done;
  return newPrompt;
};

export const getAllPrompts = async (folderId?: string | null): Promise<Prompt[]> => {
  const db = await getDb();
  let prompts: Prompt[];

  if (folderId === undefined) { 
    prompts = await db.getAll(PROMPTS_STORE);
  } else if (folderId === null) { 
    const allPrompts = await db.getAll(PROMPTS_STORE); 
    prompts = allPrompts.filter(p => p.folderId === null || p.folderId === undefined); 
  } else { 
    prompts = await db.getAllFromIndex(PROMPTS_STORE, 'folderId', folderId);
  }
  
  return prompts.sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
};

export const getPrompt = async (id: string): Promise<Prompt | undefined> => {
  const db = await getDb();
  const prompt = await db.get(PROMPTS_STORE, id);
  return prompt;
};

export const updatePrompt = async (id: string, promptUpdateData: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at' | 'versions'>> & { content?: string; notes?: string; tags?: string[]; folderId?: string | null; firstSuccessfulResultText?: string | null }): Promise<Prompt> => {
  const db = await getDb();
  const tx = db.transaction([PROMPTS_STORE, PROMPT_VERSIONS_STORE, PROMPT_TAGS_STORE], 'readwrite');
  const store = tx.objectStore(PROMPTS_STORE);
  const existingPrompt = await store.get(id);

  if (!existingPrompt) {
    throw new Error('Prompt not found');
  }

  const now = new Date().toISOString();
  const { tags: newTagIdsInput, ...restOfUpdateData } = promptUpdateData;
  
  const updatedPromptFields: Partial<Prompt> = { ...restOfUpdateData };
  if ('folderId' in promptUpdateData) {
      updatedPromptFields.folderId = promptUpdateData.folderId === undefined ? null : promptUpdateData.folderId;
  }
   // If newTagIdsInput is provided, use it; otherwise, keep existingPrompt.tags
  const finalNewTagIds = newTagIdsInput !== undefined ? newTagIdsInput : existingPrompt.tags;
  updatedPromptFields.tags = finalNewTagIds;

  // Handle firstSuccessfulResultText update
  if ('firstSuccessfulResultText' in promptUpdateData) {
      updatedPromptFields.firstSuccessfulResultText = promptUpdateData.firstSuccessfulResultText;
  }


  const updatedPrompt = { ...existingPrompt, ...updatedPromptFields, updated_at: now };
  
  const contentChanged = promptUpdateData.content !== undefined && promptUpdateData.content !== existingPrompt.content;
  const notesChanged = promptUpdateData.notes !== undefined && promptUpdateData.notes !== existingPrompt.notes;

  if (contentChanged || notesChanged) {
    const newVersion: Omit<PromptVersion, 'id'> = {
      prompt_id: id,
      content: promptUpdateData.content !== undefined ? promptUpdateData.content : existingPrompt.content,
      notes: promptUpdateData.notes !== undefined ? promptUpdateData.notes : existingPrompt.notes,
      created_at: now,
    };
    await tx.objectStore(PROMPT_VERSIONS_STORE).add(newVersion);
  }

  // Update PROMPT_TAGS_STORE based on finalNewTagIds
  // Clear existing links for this prompt first
  const existingLinks = await tx.objectStore(PROMPT_TAGS_STORE).index('prompt_id').getAll(id);
  for (const link of existingLinks) {
    if(link.id) await tx.objectStore(PROMPT_TAGS_STORE).delete(link.id);
  }
  // Add new links
  if (finalNewTagIds) {
    for (const tagId of finalNewTagIds) {
      await tx.objectStore(PROMPT_TAGS_STORE).add({ prompt_id: id, tag_id: tagId });
    }
  }


  await store.put(updatedPrompt);
  await tx.done;
  return updatedPrompt;
};

export const deletePrompt = async (id: string): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction([PROMPTS_STORE, PROMPT_VERSIONS_STORE, PROMPT_TAGS_STORE], 'readwrite');
  await tx.objectStore(PROMPTS_STORE).delete(id);
  
  const versionsStore = tx.objectStore(PROMPT_VERSIONS_STORE);
  const versionsIndex = versionsStore.index('prompt_id');
  let cursor = await versionsIndex.openCursor(id);
  while(cursor) {
    await versionsStore.delete(cursor.primaryKey);
    cursor = await cursor.continue();
  }

  const promptTagsStore = tx.objectStore(PROMPT_TAGS_STORE);
  const promptTagsIndex = promptTagsStore.index('prompt_id');
  let linkCursor = await promptTagsIndex.openCursor(id);
  while(linkCursor) {
    if(linkCursor.value.id) await promptTagsStore.delete(linkCursor.value.id);
    linkCursor = await linkCursor.continue();
  }
  await tx.done;
};


// Tag CRUD
export const addTag = async (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> => {
  const db = await getDb();
  const existingTag = await db.getFromIndex(TAGS_STORE, 'name', tagData.name);
  if (existingTag) {
    return existingTag;
  }

  const now = new Date().toISOString();
  const id = generateUUID();
  const newTag: Tag = { ...tagData, id, created_at: now, updated_at: now };
  try {
    await db.add(TAGS_STORE, newTag);
  } catch (error: any) {
    if (error.name === 'ConstraintError') {
      console.warn(`Tag with name "${tagData.name}" already exists.`);
      const existing = await db.getFromIndex(TAGS_STORE, 'name', tagData.name);
      if (existing) return existing;
    }
    throw error;
  }
  return newTag;
};

export const getAllTags = async (): Promise<Tag[]> => {
  const db = await getDb();
  return db.getAll(TAGS_STORE);
};

export const getTag = async (id: string): Promise<Tag | undefined> => {
  const db = await getDb();
  return db.get(TAGS_STORE, id);
};

export const deleteTag = async (id: string): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction([TAGS_STORE, PROMPT_TAGS_STORE, PROMPTS_STORE], 'readwrite');
  
  // Remove tag ID from all prompts that use it
  const promptsStore = tx.objectStore(PROMPTS_STORE);
  const allPrompts = await promptsStore.getAll();
  for (const prompt of allPrompts) {
    if (prompt.tags && prompt.tags.includes(id)) {
      const updatedTags = prompt.tags.filter(tagId => tagId !== id);
      await promptsStore.put({ ...prompt, tags: updatedTags, updated_at: new Date().toISOString() });
    }
  }

  // Delete links from PROMPT_TAGS_STORE
  const promptTagsStore = tx.objectStore(PROMPT_TAGS_STORE);
  const tagIndex = promptTagsStore.index('tag_id');
  let cursor = await tagIndex.openCursor(id);
  while(cursor) {
    if(cursor.value.id) await promptTagsStore.delete(cursor.value.id);
    cursor = await cursor.continue();
  }

  // Delete the tag itself
  await tx.objectStore(TAGS_STORE).delete(id);
  
  await tx.done;
};

// Versioning
export const getPromptVersions = async (promptId: string): Promise<PromptVersion[]> => {
  const db = await getDb();
  const versions = await db.getAllFromIndex(PROMPT_VERSIONS_STORE, 'prompt_id', promptId);
  return versions.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const restorePromptVersion = async (versionId: number): Promise<Prompt> => {
  const db = await getDb();
  const versionToRestore = await db.get(PROMPT_VERSIONS_STORE, versionId);
  if (!versionToRestore) {
    throw new Error('Version not found');
  }
  const prompt = await getPrompt(versionToRestore.prompt_id);
  if (!prompt) {
    throw new Error('Associated prompt not found');
  }
  // When restoring, we don't change the firstSuccessfulResultText
  return updatePrompt(prompt.id, {
    content: versionToRestore.content,
    notes: versionToRestore.notes,
    tags: prompt.tags, 
    folderId: prompt.folderId,
    // firstSuccessfulResultText will retain its existing value from `prompt`
  });
};

export const namePromptVersion = async (versionId: number, commitMessage: string): Promise<PromptVersion | undefined> => {
    const db = await getDb();
    const version = await db.get(PROMPT_VERSIONS_STORE, versionId);
    if (!version) {
        throw new Error("Version not found");
    }
    const updatedVersion = { ...version, commitMessage: commitMessage.trim() };
    await db.put(PROMPT_VERSIONS_STORE, updatedVersion);
    return updatedVersion;
};

// Folder CRUD (AFR-4.1)
export const addFolder = async (folderData: Omit<Folder, 'id' | 'created_at' | 'updated_at'>): Promise<Folder> => {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = generateUUID();
  const newFolder: Folder = { ...folderData, id, parentId: folderData.parentId || null, created_at: now, updated_at: now };
  await db.add(FOLDERS_STORE, newFolder);
  return newFolder;
};

export const getAllFolders = async (): Promise<Folder[]> => {
  const db = await getDb();
  return db.getAll(FOLDERS_STORE);
};

export const getFolder = async (id: string): Promise<Folder | undefined> => {
  const db = await getDb();
  return db.get(FOLDERS_STORE, id);
};

export const updateFolder = async (id: string, folderUpdateData: Partial<Omit<Folder, 'id' | 'created_at' | 'updated_at'>>): Promise<Folder> => {
  const db = await getDb();
  const store = db.transaction(FOLDERS_STORE, 'readwrite').objectStore(FOLDERS_STORE);
  const existingFolder = await store.get(id);
  if (!existingFolder) throw new Error('Folder not found');
  
  if (folderUpdateData.parentId === id) {
      throw new Error("Cannot make a folder a child of itself.");
  }

  const updatedFolder = { ...existingFolder, ...folderUpdateData, updated_at: new Date().toISOString() };
  await store.put(updatedFolder);
  return updatedFolder;
};

export const deleteFolderRecursive = async (folderId: string, tx: IDBPTransaction<any, (typeof FOLDERS_STORE | typeof PROMPTS_STORE)[], "readwrite">): Promise<void> => {
    const promptsStore = tx.objectStore(PROMPTS_STORE);
    const promptsIndex = promptsStore.index('folderId');
    let promptCursor = await promptsIndex.openCursor(folderId);
    while (promptCursor) {
        const prompt = promptCursor.value;
        await promptsStore.put({ ...prompt, folderId: null, updated_at: new Date().toISOString() });
        promptCursor = await promptCursor.continue();
    }

    const foldersStore = tx.objectStore(FOLDERS_STORE);
    const parentIdIndex = foldersStore.index('parentId');
    let childFolderCursor = await parentIdIndex.openCursor(folderId);
    while(childFolderCursor){
        await deleteFolderRecursive(childFolderCursor.value.id, tx); 
        childFolderCursor = await childFolderCursor.continue();
    }
    
    await foldersStore.delete(folderId);
};


export const deleteFolder = async (id: string): Promise<void> => {
  const db = await getDb();
  const storeNames = [FOLDERS_STORE, PROMPTS_STORE] as const;
  const tx = db.transaction(storeNames, 'readwrite');
  await deleteFolderRecursive(id, tx);
  await tx.done;
};


// Execution Preset CRUD (Recommendation 2)
export const addExecutionPreset = async (presetData: Omit<ExecutionPreset, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExecutionPreset> => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = generateUUID();
    const newPreset: ExecutionPreset = { ...presetData, id, createdAt: now, updatedAt: now };
    
    const tx = db.transaction(EXECUTION_PRESETS_STORE, 'readwrite');
    const store = tx.objectStore(EXECUTION_PRESETS_STORE);
    const existingPresetByName = await store.index('name').get(presetData.name);
    if(existingPresetByName) {
        throw new Error(`A preset with the name "${presetData.name}" already exists.`);
    }
    await store.add(newPreset);
    await tx.done;
    return newPreset;
};

export const getAllExecutionPresets = async (): Promise<ExecutionPreset[]> => {
    const db = await getDb();
    const presets = await db.getAll(EXECUTION_PRESETS_STORE);
    return presets.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const updateExecutionPreset = async (id: string, presetUpdateData: Partial<Omit<ExecutionPreset, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ExecutionPreset> => {
    const db = await getDb();
    const tx = db.transaction(EXECUTION_PRESETS_STORE, 'readwrite');
    const store = tx.objectStore(EXECUTION_PRESETS_STORE);
    const existingPreset = await store.get(id);
    if (!existingPreset) {
        throw new Error('Execution preset not found');
    }
    if (presetUpdateData.name && presetUpdateData.name !== existingPreset.name) {
        const existingPresetByName = await store.index('name').get(presetUpdateData.name);
        if(existingPresetByName && existingPresetByName.id !== id) {
             throw new Error(`Another preset with the name "${presetUpdateData.name}" already exists.`);
        }
    }
    const updatedPreset = { ...existingPreset, ...presetUpdateData, updatedAt: new Date().toISOString() };
    await store.put(updatedPreset);
    await tx.done;
    return updatedPreset;
};

export const deleteExecutionPreset = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.delete(EXECUTION_PRESETS_STORE, id);
};


// Sync Queue
export const addSyncQueueItem = async (item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<SyncQueueItem> => {
  const db = await getDb();
  const newItem = { ...item, timestamp: new Date().toISOString() };
  const id = await db.add(SYNC_QUEUE_STORE, newItem);
  return { ...newItem, id };
};
export const getSyncQueueItems = async (): Promise<SyncQueueItem[]> => await getDb().then(db => db.getAll(SYNC_QUEUE_STORE));
export const deleteSyncQueueItem = async (id: number): Promise<void> => await getDb().then(db => db.delete(SYNC_QUEUE_STORE, id));


// API Key Management
export const addApiKey = async (name: string, key: string, makeActive: boolean = false): Promise<ApiKeyEntry> => {
  const db = await getDb();

  const id = generateUUID();
  let encryptedKeyAttempt = "";
  try {
      encryptedKeyAttempt = await secureEncrypt(key); 
  } catch (e) {
      console.error("Encryption failed during addApiKey:", e);
      throw new Error("Failed to secure API key for storage.");
  }
  const finalEncryptedKey = encryptedKeyAttempt; 
  const createdAt = new Date().toISOString();
  
  const tx = db.transaction(API_KEYS_STORE, 'readwrite');
  const store = tx.objectStore(API_KEYS_STORE);
  
  const existingKeyWithName = await store.index('name').get(name);
  if (existingKeyWithName) {
      throw new Error(`An API key with the name "${name}" already exists.`);
  }

  let isActive = makeActive;
  const allCurrentKeysInDB = await store.getAll(); 
  
  if (!isActive) { 
    isActive = allCurrentKeysInDB.length === 0 || !allCurrentKeysInDB.some(k => k.isActive); 
  }

  const newApiKey: ApiKeyEntry = { id, name, encryptedKey: finalEncryptedKey, createdAt, isActive };
  
  if (isActive) {
    for (const k of allCurrentKeysInDB) { 
        if (k.isActive && k.id !== id) { 
            await store.put({ ...k, isActive: false });
        }
    }
  }
  await store.add(newApiKey);
  await tx.done;
  return newApiKey;
};

export const getApiKeys = async (): Promise<ApiKeyEntry[]> => {
  const db = await getDb();
  return db.getAll(API_KEYS_STORE);
};

export const getApiKey = async (id: string): Promise<ApiKeyEntry | undefined> => {
  const db = await getDb();
  const apiKeyEntry = await db.get(API_KEYS_STORE, id);
  return apiKeyEntry; 
};

export const getActiveApiKey = async (): Promise<ApiKeyEntry | undefined> => {
  const db = await getDb();
  const allKeys = await db.getAll(API_KEYS_STORE);
  let activeKeyEntry = allKeys.find(k => k.isActive);

  if (activeKeyEntry) {
    try {
      const decryptedKeyValue = await secureDecrypt(activeKeyEntry.encryptedKey);
      return { ...activeKeyEntry, encryptedKey: decryptedKeyValue };
    } catch (e) {
        console.error("Failed to decrypt active API key:", e, "Key ID:", activeKeyEntry.id);
        throw new Error(`Failed to decrypt active API key "${activeKeyEntry.name}". Please re-add it or set another key as active.`);
    }
  }
  
  if (allKeys.length === 0 && DEFAULT_API_KEY_VALUE && DEFAULT_API_KEY_NAME) {
    console.log("No API keys found, adding default preconfigured key.");
    try {
      const defaultKeyEntryFromDb = await addApiKey(DEFAULT_API_KEY_NAME, DEFAULT_API_KEY_VALUE, true);
      const decryptedDefaultKeyValue = await secureDecrypt(defaultKeyEntryFromDb.encryptedKey);
      return { ...defaultKeyEntryFromDb, encryptedKey: decryptedDefaultKeyValue };
    } catch (e: any) {
        if (e.message && e.message.includes("already exists")) {
            console.warn("Default key with that name already exists, attempting to fetch and use it.");
            const existingDefault = await db.getFromIndex(API_KEYS_STORE, 'name', DEFAULT_API_KEY_NAME);
            if (existingDefault) {
                if (!existingDefault.isActive) {
                    await setActiveApiKey(existingDefault.id); 
                    existingDefault.isActive = true;
                }
                const decrypted = await secureDecrypt(existingDefault.encryptedKey);
                return { ...existingDefault, encryptedKey: decrypted };
            }
        }
        console.error("Failed to add or decrypt default API key:", e);
        return undefined;
    }
  } else if (allKeys.length > 0 && !activeKeyEntry) { 
    const firstKey = allKeys[0];
    await setActiveApiKey(firstKey.id); 
    try {
        const updatedFirstKey = await db.get(API_KEYS_STORE, firstKey.id);
        if(!updatedFirstKey) throw new Error("Failed to retrieve key after setting active.");
        const decryptedKeyValue = await secureDecrypt(updatedFirstKey.encryptedKey);
        return { ...updatedFirstKey, encryptedKey: decryptedKeyValue, isActive: true};
    } catch (e) {
         console.error("Failed to decrypt newly activated API key:", e, "Key ID:", firstKey.id);
         throw new Error(`Failed to decrypt API key "${firstKey.name}" after making it active. Please re-add it.`);
    }
  }
  return undefined;
};

export const deleteApiKey = async (id: string): Promise<void> => {
  const db = await getDb();
  const keyToDelete = await db.get(API_KEYS_STORE, id);
  await db.delete(API_KEYS_STORE, id);
  if (keyToDelete && keyToDelete.isActive) {
      const remainingKeys = await db.getAll(API_KEYS_STORE);
      if (remainingKeys.length > 0) {
          await setActiveApiKey(remainingKeys[0].id);
      }
  }
};

export const setActiveApiKey = async (id: string): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction(API_KEYS_STORE, 'readwrite');
  const store = tx.objectStore(API_KEYS_STORE);
  const allKeys = await store.getAll();
  for (const key of allKeys) {
    await store.put({ ...key, isActive: key.id === id });
  }
  await tx.done;
};


// Data Portability
export const exportData = async (): Promise<ExportData> => {
  const db = await getDb();
  const prompts = await db.getAll(PROMPTS_STORE);
  const tags = await db.getAll(TAGS_STORE);
  const prompt_versions = await db.getAll(PROMPT_VERSIONS_STORE);
  const folders = await db.getAll(FOLDERS_STORE); 
  const execution_presets = await db.getAll(EXECUTION_PRESETS_STORE);

  return { 
    schema_version: '1.2', // Incremented schema version for firstSuccessfulResultText
    export_date: new Date().toISOString(), 
    prompts, 
    tags, 
    prompt_versions,
    folders,
    execution_presets 
  };
};

export const importData = async (data: ExportData, mode: 'merge' | 'overwrite'): Promise<void> => {
  const db = await getDb();
  const storesToClear: (typeof PROMPTS_STORE | typeof TAGS_STORE | typeof PROMPT_VERSIONS_STORE | typeof PROMPT_TAGS_STORE | typeof FOLDERS_STORE | typeof EXECUTION_PRESETS_STORE)[] = 
    [PROMPTS_STORE, TAGS_STORE, PROMPT_VERSIONS_STORE, PROMPT_TAGS_STORE, FOLDERS_STORE, EXECUTION_PRESETS_STORE];
  
  const tx = db.transaction(storesToClear, 'readwrite');
  const idMap: Record<string, string> = {}; // For merge mode tag ID resolution

  if (mode === 'overwrite') {
    for (const storeName of storesToClear) {
        await tx.objectStore(storeName).clear();
    }
  }

  // Process Tags
  for (const importedTag of data.tags) {
    if (mode === 'merge') {
      const existingTagByName = await tx.objectStore(TAGS_STORE).index('name').get(importedTag.name);
      if (existingTagByName) {
        if (existingTagByName.id !== importedTag.id) {
          idMap[importedTag.id] = existingTagByName.id; 
        } else {
          await tx.objectStore(TAGS_STORE).put(importedTag); 
        }
      } else {
        await tx.objectStore(TAGS_STORE).put(importedTag); 
      }
    } else { 
      await tx.objectStore(TAGS_STORE).put(importedTag);
    }
  }
  
  // Process Folders (if any)
  if (data.folders) { 
    for (const folder of data.folders) {
      await tx.objectStore(FOLDERS_STORE).put(folder); 
    }
  }

  // Process Execution Presets (if any)
  if (data.execution_presets) {
    for (const preset of data.execution_presets) {
      if (mode === 'merge') {
        const existingByName = await tx.objectStore(EXECUTION_PRESETS_STORE).index('name').get(preset.name);
        if (existingByName) {
            // If name exists, skip or update based on preference. Here, we skip to prevent accidental overwrite by name
            // but if ID matched, an update could be considered. For simplicity, new names or matching IDs are put.
            if(existingByName.id === preset.id) {
                 await tx.objectStore(EXECUTION_PRESETS_STORE).put(preset);
            } else {
                console.warn(`Preset with name "${preset.name}" already exists with a different ID. Skipping import of this preset to avoid conflict.`);
            }
        } else {
             await tx.objectStore(EXECUTION_PRESETS_STORE).put(preset);
        }
      } else { // Overwrite
         await tx.objectStore(EXECUTION_PRESETS_STORE).put(preset);
      }
    }
  }

  // Process Prompts
  for (const importedPrompt of data.prompts) {
    let resolvedTagIds: string[] = [];
    if (importedPrompt.tags) {
      resolvedTagIds = importedPrompt.tags.map(importedId => idMap[importedId] || importedId);
    }

    const promptToStore: Prompt = {
      ...importedPrompt,
      tags: resolvedTagIds,
      folderId: importedPrompt.folderId === undefined ? null : importedPrompt.folderId,
      firstSuccessfulResultText: importedPrompt.firstSuccessfulResultText || null, // Ensure new field is handled
    };
    await tx.objectStore(PROMPTS_STORE).put(promptToStore);

    // Update PROMPT_TAGS_STORE
    if (mode === 'merge') {
      const existingLinks = await tx.objectStore(PROMPT_TAGS_STORE).index('prompt_id').getAll(importedPrompt.id);
      for (const link of existingLinks) {
        if (link.id) await tx.objectStore(PROMPT_TAGS_STORE).delete(link.id);
      }
    }
    
    for (const tagId of resolvedTagIds) {
      const tagExists = await tx.objectStore(TAGS_STORE).get(tagId);
      if (tagExists) {
        await tx.objectStore(PROMPT_TAGS_STORE).put({ prompt_id: importedPrompt.id, tag_id: tagId });
      } else {
        console.warn(`During import (Prompt ${importedPrompt.title}): Tag with resolved ID ${tagId} not found. Skipping link creation.`);
      }
    }
  }

  // Process Prompt Versions
  for (const version of data.prompt_versions) {
    await tx.objectStore(PROMPT_VERSIONS_STORE).put(version);
  }
  await tx.done;
};

getDb().then(async () => {
    console.log("Database initialized");
    try {
        await getAppCryptoKey(); 
        console.log("Application crypto key initialized.");
    } catch (e) {
        console.error("Failed to initialize application crypto key on startup:", e);
    }
}).catch(err => console.error("Database initialization failed:", err));