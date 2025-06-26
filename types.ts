
export interface Tag {
  id: string; // UUID
  name: string;
  user_id?: string; // For potential future backend integration
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
}

export interface PromptVersion {
  id?: number; // Auto-incrementing in IndexedDB
  prompt_id: string; // UUID, Foreign key to Prompt
  content: string;
  notes?: string;
  commitMessage?: string; // For AFR-2.2 Named Versions
  created_at: string; // ISO Date string, timestamp of this version
}

export interface Folder {
  id: string; // UUID
  name: string;
  parentId: string | null; // For hierarchy
  created_at: string;
  updated_at: string;
  // user_id?: string; // For potential future backend integration
}

export interface Prompt {
  id: string; // UUID
  user_id?: string; // For potential future backend integration
  title: string;
  content: string;
  notes?: string;
  tags: string[]; // Array of Tag IDs
  folderId?: string | null; // For AFR-4.1 Folders
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  versions?: PromptVersion[]; // Embedded for simplicity or fetched separately
  _initialEditorMode?: 'abTest' | 'chainBlueprint'; // Rec 2: Transient flag for Smart Start
}

export interface PromptTagLink {
  id?: number; // Auto-incrementing in IndexedDB
  prompt_id: string;
  tag_id: string;
}

export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncCollection {
  PROMPTS = 'prompts',
  TAGS = 'tags',
  PROMPT_TAGS = 'prompt_tags',
  PROMPT_VERSIONS = 'prompt_versions',
  FOLDERS = 'folders', // Added for AFR-4.1
  EXECUTION_PRESETS = 'execution_presets',
}

export interface SyncQueueItem {
  id?: number; // Auto-incrementing in IndexedDB
  operation: SyncOperation;
  collection: SyncCollection;
  payload: any; // The actual data for the operation
  timestamp: string; // ISO Date string
  attempted?: boolean; // Flag if sync was attempted
}


export interface AppSettings {
  // apiKey?: string; // For Gemini API, etc. - Moved to ApiKeyEntry
  theme: 'light' | 'dark' | 'system';
}

export interface ApiKeyEntry {
  id: string; // UUID
  name: string;
  encryptedKey: string; // The API key, encrypted
  createdAt: string; // ISO Date string
  isActive: boolean; // Only one key should be active at a time
}

// For JSON export/import structure
export interface ExportData {
  schema_version: string;
  export_date: string;
  prompts: Prompt[];
  tags: Tag[];
  prompt_versions: PromptVersion[]; // All versions for all prompts
  folders?: Folder[]; // Added for AFR-4.1
  execution_presets?: ExecutionPreset[]; // For Recommendation 2
  // Note: prompt_tags links are derived from prompt.tags, so not explicitly exported unless needed for specific structure.
  // For this implementation, prompt.tags (array of tag IDs) is simpler.
}

// For AFR-4.2 Curated Prompt Libraries
export interface CuratedPrompt {
  curated_id: string; // Unique ID for the curated prompt itself
  title: string;
  content: string;
  notes?: string;
  category?: string;
  suggestedTags?: string[]; // Tag names
}

// For Recommendation 2: Advanced Prompt Parameter Control
export interface ModelConfig {
  systemInstruction?: string;
  temperature?: number; // Range typically 0.0 to 1.0 (or higher, Gemini specific)
  topP?: number;      // Range 0.0 to 1.0
  topK?: number;      // Integer
  responseMimeType?: "application/json" | "text/plain"; // Added for JSON response
}

export interface ExecutionPreset extends ModelConfig {
  id: string; // UUID
  name: string;
  // modelId?: string; // Optional: To tie preset to a specific model. For now, general.
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// For Recommendation 1 (Contextual Prompting Assistant - Snippets)
export interface Snippet {
  id: string;
  title: string;
  content: string;
  category: 'Common Phrase' | 'Template' | 'Instruction';
}

export type ModalType = 
  | 'newPrompt' 
  | 'newFolder' 
  | 'renameFolder' 
  | 'versionHistory' 
  | 'deletePromptConfirm' 
  | 'deleteFolderConfirm' 
  | 'import' 
  | 'export' 
  | 'apiKeyManager' 
  | 'curatedLibrary'
  | 'visualChainBuilder'
  | 'savePreset'
  | 'managePresets'
  | 'smartStartChoice'
  | 'promptGraph'; // Added for Prompt Relationship Graph

// Types specific to PromptEditor functionality, moved here for ExecutionBlock
export interface LinkedOutput {
    id: string;
    title: string;
    fullPlaceholder: string;
}

export type ResultLabel = 'good' | 'bad' | 'star' | null;
