export interface Tag {
  id: string; // UUID
  name: string;
  user_id?: string; 
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  supabase_synced_at?: string; // ISO Date string, tracks last successful sync
}

export interface PromptVersion {
  id: string; // UUID - Changed from number to string for consistency with Supabase PK
  prompt_id: string; // UUID, Foreign key to Prompt
  user_id?: string; // Added for Supabase sync
  content: string;
  notes?: string;
  commitMessage?: string; 
  created_at: string; // ISO Date string, timestamp of this version
  supabase_synced_at?: string;
}

export interface Folder {
  id: string; // UUID
  name: string;
  parentId: string | null; 
  user_id?: string; 
  created_at: string;
  updated_at: string;
  supabase_synced_at?: string;
}

export interface Prompt {
  id: string; // UUID
  user_id?: string; 
  title: string;
  content: string;
  notes?: string;
  tags: string[]; // Array of Tag IDs
  folderId?: string | null; 
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  versions?: PromptVersion[]; // Embedded for simplicity or fetched separately - For local use primarily
  _initialEditorMode?: 'abTest' | 'chainBlueprint'; 
  firstSuccessfulResultText?: string | null; 
  supabase_synced_at?: string;
}

// For Supabase, prompt_versions will be a separate table.
// Local `Prompt` might still embed the latest version for quick access,
// but full history is managed via `PromptVersion[]`.

export interface PromptTagLink {
  id?: number; // Auto-incrementing in IndexedDB (local only, Supabase will derive from prompt.tags)
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
  // PROMPT_TAGS will be handled by updating the prompts.tags array
  PROMPT_VERSIONS = 'prompt_versions',
  FOLDERS = 'folders', 
  EXECUTION_PRESETS = 'execution_presets', // Not synced in this phase
}

export interface SyncQueueItem {
  id?: number; 
  operation: SyncOperation;
  collection: SyncCollection;
  payload: any; 
  timestamp: string; 
  attempted?: boolean; 
}


export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
}

export interface ApiKeyEntry {
  id: string; 
  name: string;
  encryptedKey: string; 
  createdAt: string; 
  isActive: boolean; 
}

export interface ExportData {
  schema_version: string; 
  export_date: string;
  prompts: Prompt[];
  tags: Tag[];
  prompt_versions: PromptVersion[]; 
  folders?: Folder[]; 
  execution_presets?: ExecutionPreset[]; 
}

export interface CuratedPrompt {
  curated_id: string; 
  title: string;
  content: string;
  notes?: string;
  category?: string;
  suggestedTags?: string[]; 
}

export interface ModelConfig {
  systemInstruction?: string;
  temperature?: number; 
  topP?: number;      
  topK?: number;      
  responseMimeType?: "application/json" | "text/plain"; 
}

export interface ExecutionPreset extends ModelConfig {
  id: string; 
  name: string;
  createdAt: string; 
  updatedAt: string; 
}

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
  | 'promptGraph' 
  | 'auth'
  | 'smartStartChoice'; // Added smartStartChoice

export interface LinkedOutput {
    id: string;
    title: string;
    fullPlaceholder: string;
}

export type ResultLabel = 'good' | 'bad' | 'star' | null;