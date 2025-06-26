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
                true, 
                ['encrypt', 'decrypt']
            );
            return appCryptoKey;
        } catch (e) {
            console.error("Failed to import stored crypto key, generating new one.", e);
            localStorage.removeItem(CRYPTO_KEY_STORAGE_NAME); 
        }
    }

    appCryptoKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, 
        ['encrypt', 'decrypt']
    );
    const jwk = await crypto.subtle.exportKey('jwk', appCryptoKey);
    localStorage.setItem(CRYPTO_KEY_STORAGE_NAME, JSON.stringify(jwk));
    console.log("New application crypto key generated and stored.");
    return appCryptoKey;
}

async function secureEncrypt(text: string): Promise<string> {
    if (!text) return ""; 
    const key = await getAppCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); 
    const encodedText = new TextEncoder().encode(text);

    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedText
    );

    const ivString = btoa(String.fromCharCode(...iv));
    const ciphertextString = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
    
    return `${ivString}.${ciphertextString}`;
}

async function secureDecrypt(encryptedData: string): Promise<string> {
    if (!encryptedData) return ""; 

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
              tagsStore.createIndex('name_user_id', ['name', 'user_id'], { unique: true }); // Ensure uniqueness per user
              tagsStore.createIndex('user_id', 'user_id', { unique: false });
            }
            if (!db.objectStoreNames.contains(PROMPT_TAGS_STORE)) {
                const promptTagsStore = db.createObjectStore(PROMPT_TAGS_STORE, { autoIncrement: true, keyPath: 'id' });
                promptTagsStore.createIndex('prompt_id_tag_id', ['prompt_id', 'tag_id'], { unique: true });
                promptTagsStore.createIndex('prompt_id', 'prompt_id', { unique: false });
                promptTagsStore.createIndex('tag_id', 'tag_id', { unique: false });
            }
            if (!db.objectStoreNames.contains(PROMPT_VERSIONS_STORE)) {
              // Key path changed to 'id' (string UUID)
              const versionsStore = db.createObjectStore(PROMPT_VERSIONS_STORE, { keyPath: 'id' });
              versionsStore.createIndex('prompt_id', 'prompt_id', { unique: false });
              versionsStore.createIndex('created_at', 'created_at', { unique: false });
              versionsStore.createIndex('user_id', 'user_id', { unique: false }); // Add user_id index
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
                foldersStore.createIndex('user_id', 'user_id', { unique: false }); 
            }
            const promptsStore = transaction.objectStore(PROMPTS_STORE);
            if (!promptsStore.indexNames.contains('folderId')) {
                promptsStore.createIndex('folderId', 'folderId', { unique: false });
            }
             if (!promptsStore.indexNames.contains('user_id')) { 
                promptsStore.createIndex('user_id', 'user_id', { unique: false });
            }
            const tagsStore = transaction.objectStore(TAGS_STORE);
            if (!tagsStore.indexNames.contains('user_id')) { 
                tagsStore.createIndex('user_id', 'user_id', { unique: false });
            }
            // If PromptVersion store used autoIncrement before, it needs migration if switching to UUIDs.
            // For this scope, assuming new setup or manual migration if structure changed drastically.
            if (db.objectStoreNames.contains(PROMPT_VERSIONS_STORE)) {
                const versionsStore = transaction.objectStore(PROMPT_VERSIONS_STORE);
                if (versionsStore.autoIncrement) { // Check if it was autoIncrementing
                    console.warn("PROMPT_VERSIONS_STORE was auto-incrementing. If changing to UUID keyPath, manual data migration might be needed.");
                    // To change keyPath, store must be deleted and recreated.
                    // This example does not automatically delete/recreate stores to prevent data loss.
                }
                if (!versionsStore.indexNames.contains('user_id')) {
                    versionsStore.createIndex('user_id', 'user_id', { unique: false });
                }
            }
        }
        if (oldVersion < 3) {
            if (!db.objectStoreNames.contains(EXECUTION_PRESETS_STORE)) {
                const presetsStore = db.createObjectStore(EXECUTION_PRESETS_STORE, { keyPath: 'id' });
                presetsStore.createIndex('name', 'name', { unique: true }); // Presets are globally unique by name locally for now
                presetsStore.createIndex('updated_at', 'updated_at', { unique: false });
            }
        }
      },
    });
  }
  return dbPromise;
};


// Prompt CRUD
export const addPrompt = async (promptData: Omit<Prompt, 'created_at' | 'updated_at' | 'versions'> & { id?: string; user_id?: string }): Promise<Prompt> => {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = promptData.id || generateUUID();
  
  const { id:_discardId, user_id, ...baseData } = promptData;

  const newPromptBase: Omit<Prompt, 'tags' | 'id' | 'user_id'> = { 
    ...baseData, 
    folderId: promptData.folderId === undefined ? null : promptData.folderId,
    created_at: now, 
    updated_at: now,
    versions: [], // Versions are handled separately in PROMPT_VERSIONS_STORE
    firstSuccessfulResultText: null,
    supabase_synced_at: undefined, // Initialize as undefined
  };
  const newPrompt: Prompt = { ...newPromptBase, id, tags: promptData.tags || [], user_id }; 

  const initialVersionId = generateUUID(); // Generate UUID for version
  const initialVersion: PromptVersion = {
    id: initialVersionId,
    prompt_id: id,
    user_id: user_id, // Store user_id with version
    content: newPrompt.content,
    notes: newPrompt.notes,
    created_at: now,
    supabase_synced_at: undefined,
  };
  
  const tx = db.transaction([PROMPTS_STORE, PROMPT_VERSIONS_STORE, PROMPT_TAGS_STORE], 'readwrite');
  
  await tx.objectStore(PROMPTS_STORE).put(newPrompt); // Use put for add or update
  await tx.objectStore(PROMPT_VERSIONS_STORE).add(initialVersion);

  // Manage prompt_tags links locally
  const existingLinks = await tx.objectStore(PROMPT_TAGS_STORE).index('prompt_id').getAll(id);
  for (const link of existingLinks) {
    if(link.id) await tx.objectStore(PROMPT_TAGS_STORE).delete(link.id);
  }
  if (newPrompt.tags) {
    for (const tagId of newPrompt.tags) {
      await tx.objectStore(PROMPT_TAGS_STORE).add({ prompt_id: id, tag_id: tagId });
    }
  }
  await tx.done;
  return newPrompt;
};

export const getAllPrompts = async (userId?: string, folderId?: string | null): Promise<Prompt[]> => {
  const db = await getDb();
  let prompts: Prompt[];

  if (userId) {
      prompts = await db.getAllFromIndex(PROMPTS_STORE, 'user_id', userId);
      if (folderId !== undefined) { // Further filter by folderId if provided for a specific user
          prompts = prompts.filter(p => p.folderId === folderId);
      }
  } else { // Fallback for when no user is logged in (local-only view)
      if (folderId === undefined) { 
          prompts = await db.getAll(PROMPTS_STORE);
      } else if (folderId === null) { 
          const allPrompts = await db.getAll(PROMPTS_STORE); 
          prompts = allPrompts.filter(p => p.folderId === null || p.folderId === undefined); 
      } else { 
          prompts = await db.getAllFromIndex(PROMPTS_STORE, 'folderId', folderId);
      }
      // Filter out prompts that have a user_id if we are in a "no user" context.
      // This behavior might need refinement based on exact requirements for "logged out" state.
      prompts = prompts.filter(p => !p.user_id);
  }
  
  return prompts.sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
};

export const getPrompt = async (id: string): Promise<Prompt | undefined> => {
  const db = await getDb();
  return db.get(PROMPTS_STORE, id);
};

export const updatePrompt = async (
    id: string, 
    promptUpdateData: Partial<Omit<Prompt, 'id' | 'created_at' | 'versions'>> & { content?: string; notes?: string; tags?: string[]; folderId?: string | null; firstSuccessfulResultText?: string | null; user_id?: string }
): Promise<{ updatedPrompt: Prompt, newVersion?: PromptVersion }> => {
  const db = await getDb();
  const tx = db.transaction([PROMPTS_STORE, PROMPT_VERSIONS_STORE, PROMPT_TAGS_STORE], 'readwrite');
  const store = tx.objectStore(PROMPTS_STORE);
  const existingPrompt = await store.get(id);

  if (!existingPrompt) {
    throw new Error('Prompt not found');
  }

  const now = new Date().toISOString();
  const { tags: newTagIdsInput, user_id: newUserId, ...restOfUpdateData } = promptUpdateData;
  
  const updatedPromptFields: Partial<Prompt> = { 
      ...restOfUpdateData, 
      updated_at: now,
      // If supabase_synced_at is passed, update it, otherwise it's managed by sync logic
      supabase_synced_at: promptUpdateData.supabase_synced_at || existingPrompt.supabase_synced_at 
  };

  if (newUserId !== undefined) {
    updatedPromptFields.user_id = newUserId;
  } else if (existingPrompt.user_id) {
    updatedPromptFields.user_id = existingPrompt.user_id;
  }


  if ('folderId' in promptUpdateData) {
      updatedPromptFields.folderId = promptUpdateData.folderId === undefined ? null : promptUpdateData.folderId;
  }
  const finalNewTagIds = newTagIdsInput !== undefined ? newTagIdsInput : existingPrompt.tags;
  updatedPromptFields.tags = finalNewTagIds;

  if ('firstSuccessfulResultText' in promptUpdateData) {
      updatedPromptFields.firstSuccessfulResultText = promptUpdateData.firstSuccessfulResultText;
  }

  const updatedPrompt = { ...existingPrompt, ...updatedPromptFields };
  
  let newVersionRecord: PromptVersion | undefined = undefined;
  const contentChanged = promptUpdateData.content !== undefined && promptUpdateData.content !== existingPrompt.content;
  const notesChanged = promptUpdateData.notes !== undefined && promptUpdateData.notes !== existingPrompt.notes;

  if (contentChanged || notesChanged) {
    const versionId = generateUUID();
    newVersionRecord = {
      id: versionId,
      prompt_id: id,
      user_id: updatedPrompt.user_id, // Assign current prompt's user_id
      content: updatedPrompt.content, // Use content from updatedPrompt
      notes: updatedPrompt.notes,     // Use notes from updatedPrompt
      created_at: now,
      supabase_synced_at: undefined,
    };
    await tx.objectStore(PROMPT_VERSIONS_STORE).add(newVersionRecord);
  }

  // Manage prompt_tags links locally
  const existingLinks = await tx.objectStore(PROMPT_TAGS_STORE).index('prompt_id').getAll(id);
  for (const link of existingLinks) {
    if(link.id) await tx.objectStore(PROMPT_TAGS_STORE).delete(link.id);
  }
  if (finalNewTagIds) {
    for (const tagId of finalNewTagIds) {
      await tx.objectStore(PROMPT_TAGS_STORE).add({ prompt_id: id, tag_id: tagId });
    }
  }

  await store.put(updatedPrompt);
  await tx.done;
  return { updatedPrompt, newVersion: newVersionRecord };
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
export const addTag = async (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at'> & { user_id?: string }): Promise<Tag> => {
  const db = await getDb();
  const { name, user_id } = tagData;

  // Check for existing tag by name AND user_id
  let existingTag: Tag | undefined;
  if (user_id) {
    const allUserTags = await db.getAllFromIndex(TAGS_STORE, 'user_id', user_id);
    existingTag = allUserTags.find(t => t.name === name);
  } else {
    // For tags without user_id, assume global uniqueness by name (legacy or app-global tags)
    // This part of logic might need to be stricter if all tags must have a user_id eventually
    const allTags = await db.getAll(TAGS_STORE);
    existingTag = allTags.find(t => t.name === name && !t.user_id);
  }
  
  if (existingTag) {
    // If found, update its updated_at and potentially supabase_synced_at if passed in tagData
    const updatedExistingTag: Tag = { 
        ...existingTag, 
        updated_at: new Date().toISOString(),
        supabase_synced_at: (tagData as Tag).supabase_synced_at || existingTag.supabase_synced_at
    };
    await db.put(TAGS_STORE, updatedExistingTag);
    return updatedExistingTag;
  }

  const now = new Date().toISOString();
  const id = generateUUID();
  const newTag: Tag = { 
      ...tagData, 
      id, 
      created_at: now, 
      updated_at: now, 
      supabase_synced_at: (tagData as Tag).supabase_synced_at // If coming from Supabase
  };
  await db.add(TAGS_STORE, newTag);
  return newTag;
};

export const getAllTags = async (userId?: string): Promise<Tag[]> => {
  const db = await getDb();
  if (userId) {
    return db.getAllFromIndex(TAGS_STORE, 'user_id', userId);
  }
  // Fallback for no user: return tags that don't have a user_id or handle as per app's "logged out" state logic
  const allTags = await db.getAll(TAGS_STORE);
  return allTags.filter(t => !t.user_id); 
};

export const getTag = async (id: string): Promise<Tag | undefined> => {
  const db = await getDb();
  return db.get(TAGS_STORE, id);
};

export const updateTag = async (id: string, tagUpdateData: Partial<Omit<Tag, 'id' | 'created_at'>> & { user_id?: string }): Promise<Tag> => {
    const db = await getDb();
    const existingTag = await db.get(TAGS_STORE, id);
    if (!existingTag) {
        throw new Error('Tag not found');
    }
    const now = new Date().toISOString();
    const updatedTag: Tag = {
        ...existingTag,
        ...tagUpdateData,
        updated_at: now,
        // Ensure user_id is preserved or updated
        user_id: tagUpdateData.user_id !== undefined ? tagUpdateData.user_id : existingTag.user_id,
        supabase_synced_at: tagUpdateData.supabase_synced_at || existingTag.supabase_synced_at,
    };
    await db.put(TAGS_STORE, updatedTag);
    return updatedTag;
};

export const deleteTag = async (id: string): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction([TAGS_STORE, PROMPT_TAGS_STORE, PROMPTS_STORE], 'readwrite');
  
  // Remove tag from all prompts that use it
  const promptsStore = tx.objectStore(PROMPTS_STORE);
  const allPrompts = await promptsStore.getAll();
  for (const prompt of allPrompts) {
    if (prompt.tags && prompt.tags.includes(id)) {
      const updatedTags = prompt.tags.filter(tagId => tagId !== id);
      await promptsStore.put({ ...prompt, tags: updatedTags, updated_at: new Date().toISOString() });
    }
  }

  // Remove links from prompt_tags store
  const promptTagsStore = tx.objectStore(PROMPT_TAGS_STORE);
  const tagIndex = promptTagsStore.index('tag_id');
  let cursor = await tagIndex.openCursor(id);
  while(cursor) {
    if(cursor.value.id) await promptTagsStore.delete(cursor.value.id);
    cursor = await cursor.continue();
  }

  await tx.objectStore(TAGS_STORE).delete(id);
  await tx.done;
};

// Versioning
export const getPromptVersions = async (promptId: string, userId?: string): Promise<PromptVersion[]> => {
  const db = await getDb();
  let versions = await db.getAllFromIndex(PROMPT_VERSIONS_STORE, 'prompt_id', promptId);
  if (userId) {
      versions = versions.filter(v => v.user_id === userId);
  } else {
      versions = versions.filter(v => !v.user_id); // Only show versions without user_id if no user context
  }
  return versions.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const addPromptVersion = async (versionData: Omit<PromptVersion, 'id'> & {id?: string; user_id?: string}): Promise<PromptVersion> => {
    const db = await getDb();
    const id = versionData.id || generateUUID(); // Allow passing ID for Supabase sync
    
    // Explicitly construct to ensure all PromptVersion fields are included and supabase_synced_at is handled correctly.
    const newVersion: PromptVersion = {
        id: id,
        prompt_id: versionData.prompt_id,
        user_id: versionData.user_id,
        content: versionData.content,
        notes: versionData.notes,
        commitMessage: versionData.commitMessage,
        created_at: versionData.created_at,
        supabase_synced_at: versionData.supabase_synced_at, // This will be undefined if not in versionData
    };
    await db.put(PROMPT_VERSIONS_STORE, newVersion); // Use put to handle add or update from Supabase
    return newVersion;
};


export const restorePromptVersion = async (versionId: string): Promise<Prompt> => {
  const db = await getDb();
  const versionToRestore = await db.get(PROMPT_VERSIONS_STORE, versionId);
  if (!versionToRestore) {
    throw new Error('Version not found');
  }
  const prompt = await getPrompt(versionToRestore.prompt_id);
  if (!prompt) {
    throw new Error('Associated prompt not found');
  }
  const { updatedPrompt } = await updatePrompt(prompt.id, { // Destructure to get updatedPrompt
    content: versionToRestore.content,
    notes: versionToRestore.notes,
    tags: prompt.tags, 
    folderId: prompt.folderId,
    user_id: prompt.user_id, 
  });
  return updatedPrompt;
};

export const namePromptVersion = async (versionId: string, commitMessage: string, userId?: string): Promise<PromptVersion | undefined> => {
    const db = await getDb();
    const version = await db.get(PROMPT_VERSIONS_STORE, versionId);
    if (!version) {
        throw new Error("Version not found");
    }
    // Ensure operation is on a version belonging to the user or a non-user version if no userId provided
    if (userId && version.user_id !== userId) {
        throw new Error("Permission denied to name this version.");
    }
    if (!userId && version.user_id) {
        throw new Error("Permission denied: This version belongs to a user.");
    }

    const updatedVersion = { ...version, commitMessage: commitMessage.trim() };
    await db.put(PROMPT_VERSIONS_STORE, updatedVersion);
    return updatedVersion;
};

// Folder CRUD
export const addFolder = async (folderData: Omit<Folder, 'id' | 'created_at' | 'updated_at'> & { user_id?: string }): Promise<Folder> => {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = generateUUID();
  const newFolder: Folder = { 
      ...folderData, 
      id, 
      parentId: folderData.parentId || null, 
      created_at: now, 
      updated_at: now,
      supabase_synced_at: (folderData as Folder).supabase_synced_at,
  };
  await db.put(FOLDERS_STORE, newFolder); // Use put for add or update
  return newFolder;
};

export const getAllFolders = async (userId?: string): Promise<Folder[]> => {
  const db = await getDb();
  if (userId) {
    return db.getAllFromIndex(FOLDERS_STORE, 'user_id', userId);
  }
  const allFolders = await db.getAll(FOLDERS_STORE);
  return allFolders.filter(f => !f.user_id);
};

export const getFolder = async (id: string): Promise<Folder | undefined> => {
  const db = await getDb();
  return db.get(FOLDERS_STORE, id);
};

export const updateFolder = async (id: string, folderUpdateData: Partial<Omit<Folder, 'id' | 'created_at'>> & { user_id?: string }): Promise<Folder> => {
  const db = await getDb();
  const store = db.transaction(FOLDERS_STORE, 'readwrite').objectStore(FOLDERS_STORE);
  const existingFolder = await store.get(id);
  if (!existingFolder) throw new Error('Folder not found');
  
  if (folderUpdateData.parentId === id) {
      throw new Error("Cannot make a folder a child of itself.");
  }

  const finalUserId = folderUpdateData.user_id !== undefined ? folderUpdateData.user_id : existingFolder.user_id;

  const updatedFolder: Folder = { 
      ...existingFolder, 
      ...folderUpdateData, 
      user_id: finalUserId,
      updated_at: new Date().toISOString(),
      supabase_synced_at: folderUpdateData.supabase_synced_at || existingFolder.supabase_synced_at,
  };
  await store.put(updatedFolder);
  return updatedFolder;
};

export const deleteFolderRecursive = async (folderId: string, tx: IDBPTransaction<any, (typeof FOLDERS_STORE | typeof PROMPTS_STORE)[], "readwrite">): Promise<void> => {
    const promptsStore = tx.objectStore(PROMPTS_STORE);
    const promptsIndex = promptsStore.index('folderId');
    let promptCursor = await promptsIndex.openCursor(folderId);
    while (promptCursor) {
        const prompt = promptCursor.value;
        // Assign user_id if prompt has one, otherwise it's a global prompt being un-foldered
        await promptsStore.put({ ...prompt, folderId: null, updated_at: new Date().toISOString(), user_id: prompt.user_id });
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

// Execution Preset CRUD (No user_id, treated as local/global for now, not synced)
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

// Sync Queue (currently unused, for future full offline sync)
export const addSyncQueueItem = async (item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<SyncQueueItem> => {
  const db = await getDb();
  const newItem = { ...item, timestamp: new Date().toISOString() };
  const id = await db.add(SYNC_QUEUE_STORE, newItem);
  return { ...newItem, id };
};
export const getSyncQueueItems = async (): Promise<SyncQueueItem[]> => await getDb().then(db => db.getAll(SYNC_QUEUE_STORE));
export const deleteSyncQueueItem = async (id: number): Promise<void> => await getDb().then(db => db.delete(SYNC_QUEUE_STORE, id));

// API Key Management (local only, not synced)
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

export const getApiKeyEntry = async (id: string): Promise<ApiKeyEntry | undefined> => {
  const db = await getDb();
  return db.get(API_KEYS_STORE, id);
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
  // Fetch all data, regardless of user_id for a full local backup
  const prompts = await db.getAll(PROMPTS_STORE);
  const tags = await db.getAll(TAGS_STORE);
  const prompt_versions = await db.getAll(PROMPT_VERSIONS_STORE);
  const folders = await db.getAll(FOLDERS_STORE); 
  const execution_presets = await db.getAll(EXECUTION_PRESETS_STORE);

  return { 
    schema_version: '1.2', // Update if schema changes significantly
    export_date: new Date().toISOString(), 
    prompts, 
    tags, 
    prompt_versions,
    folders,
    execution_presets 
  };
};

// Import function needs to be aware of user_id if data is user-specific.
// For now, it imports globally, potentially overwriting/merging based on IDs.
// If importing data for a specific user, filtering/assignment of user_id would be needed.
export const importData = async (data: ExportData, mode: 'merge' | 'overwrite', userIdToAssign?: string): Promise<void> => {
  const db = await getDb();
  const storesToClear: (typeof PROMPTS_STORE | typeof TAGS_STORE | typeof PROMPT_VERSIONS_STORE | typeof PROMPT_TAGS_STORE | typeof FOLDERS_STORE | typeof EXECUTION_PRESETS_STORE)[] = 
    [PROMPTS_STORE, TAGS_STORE, PROMPT_VERSIONS_STORE, PROMPT_TAGS_STORE, FOLDERS_STORE, EXECUTION_PRESETS_STORE];
  
  const tx = db.transaction(storesToClear, 'readwrite');
  const idMap: Record<string, string> = {}; // For remapping tag IDs if merging causes conflicts (less common with UUIDs)

  if (mode === 'overwrite') {
    for (const storeName of storesToClear) {
        await tx.objectStore(storeName).clear(); // Be careful with this; consider user-specific data clearing
    }
  }

  for (const importedTag of data.tags) {
    const tagToStore: Tag = { ...importedTag, user_id: userIdToAssign || importedTag.user_id };
    // In merge mode, check if tag with same name and user_id already exists.
    if (mode === 'merge' && tagToStore.user_id) {
        const userTags = await tx.objectStore(TAGS_STORE).index('user_id').getAll(tagToStore.user_id);
        const existing = userTags.find(t => t.name === tagToStore.name);
        if (existing) {
            idMap[importedTag.id] = existing.id; // Map old ID to existing ID
            await tx.objectStore(TAGS_STORE).put({...existing, ...tagToStore, id: existing.id, updated_at: new Date().toISOString() }); // Update existing
            continue;
        }
    }
    await tx.objectStore(TAGS_STORE).put(tagToStore);
  }
  
  if (data.folders) { 
    for (const folder of data.folders) {
      await tx.objectStore(FOLDERS_STORE).put({ ...folder, user_id: userIdToAssign || folder.user_id }); 
    }
  }

  if (data.execution_presets) { // Execution presets are not user-specific for now
    for (const preset of data.execution_presets) {
      // Merge logic for presets (by name)
       await tx.objectStore(EXECUTION_PRESETS_STORE).put(preset);
    }
  }

  for (const importedPrompt of data.prompts) {
    const resolvedTagIds = importedPrompt.tags.map(importedId => idMap[importedId] || importedId);
    const promptToStore: Prompt = {
      ...importedPrompt,
      tags: resolvedTagIds,
      folderId: importedPrompt.folderId === undefined ? null : importedPrompt.folderId,
      firstSuccessfulResultText: importedPrompt.firstSuccessfulResultText || null,
      user_id: userIdToAssign || importedPrompt.user_id,
    };
    await tx.objectStore(PROMPTS_STORE).put(promptToStore);
    
    // Recreate prompt_tags links
    const existingLinks = await tx.objectStore(PROMPT_TAGS_STORE).index('prompt_id').getAll(promptToStore.id);
    for (const link of existingLinks) {
        if (link.id) await tx.objectStore(PROMPT_TAGS_STORE).delete(link.id);
    }
    for (const tagId of resolvedTagIds) {
      const tagExists = await tx.objectStore(TAGS_STORE).get(tagId);
      if (tagExists && tagExists.user_id === promptToStore.user_id) { // Ensure tag also belongs to same user or is global
        await tx.objectStore(PROMPT_TAGS_STORE).put({ prompt_id: promptToStore.id, tag_id: tagId });
      }
    }
  }

  for (const version of data.prompt_versions) {
    // Ensure version is associated with the correct user if importing user-specific data
    await tx.objectStore(PROMPT_VERSIONS_STORE).put({ ...version, user_id: userIdToAssign || version.user_id });
  }
  await tx.done;
};

// Call getDb on service load to initialize schema if needed.
getDb().then(async () => {
    console.log("Database initialized");
    try {
        await getAppCryptoKey(); 
        console.log("Application crypto key initialized.");
    } catch (e) {
        console.error("Failed to initialize application crypto key on startup:", e);
    }
}).catch(err => console.error("Database initialization failed:", err));


// Utility to update an item in IndexedDB (generic)
export async function updateLocalItem<T extends { id: string | number }>(storeName: string, item: T): Promise<void> {
    const db = await getDb();
    await db.put(storeName, item);
}

// Utility to add an item to IndexedDB (generic)
export async function addLocalItem<T extends { id: string | number }>(storeName: string, item: T): Promise<void> {
    const db = await getDb();
    await db.add(storeName, item);
}

// Get all items for a specific user from a specific store
export async function getAllLocalItemsForUser<T>(storeName: string, userId: string): Promise<T[]> {
    const db = await getDb();
    if (!db.objectStoreNames.contains(storeName)) return [];
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    if (!store.indexNames.contains('user_id')) return []; // Ensure user_id index exists
    return store.index('user_id').getAll(userId);
}

export async function getLocalItemById<T>(storeName: string, id: string | number): Promise<T | undefined> {
    const db = await getDb();
    if (!db.objectStoreNames.contains(storeName)) return undefined;
    return db.get(storeName, id);
}

// Get all local items (careful with large datasets)
export async function getAllLocalItems<T>(storeName: string): Promise<T[]> {
    const db = await getDb();
    if (!db.objectStoreNames.contains(storeName)) return [];
    return db.getAll(storeName);
}