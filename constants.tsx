import React from 'react';
import { CuratedPrompt, ModelConfig, Snippet } from './types'; 

export const APP_NAME = "PromptCraft IDE";
export const DB_NAME = "prompt_ide_db";
export const DB_VERSION = 4; // Incremented due to PromptVersion.id change and user_id additions

export const PROMPTS_STORE = "prompts";
export const TAGS_STORE = "tags";
export const PROMPT_TAGS_STORE = "prompt_tags"; 
export const PROMPT_VERSIONS_STORE = "prompt_versions";
export const SYNC_QUEUE_STORE = "sync_queue";
export const API_KEYS_STORE = "api_keys";
export const FOLDERS_STORE = "folders"; 
export const EXECUTION_PRESETS_STORE = "execution_presets"; 

// LocalStorage Keys
export const PINNED_PROMPTS_LOCAL_STORAGE_KEY = "promptcraft_pinned_ids";


// Default API Key Configuration
export const DEFAULT_API_KEY_VALUE = "AIzaSyB4UJ9nA4c3mhFXmfx-45XZil-67OHLBo4";
export const DEFAULT_API_KEY_NAME = "Default Preconfigured Key";


// Simple UUID v4 generator
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// AFR-1.2 Prompt Chaining
export const PROMPT_OUTPUT_REGEX = /{{\s*promptOutput:\s*([a-zA-Z0-9-]+)\s*}}/g;
export const MAX_CHAIN_DEPTH = 5;

// UI Style Constants - Updated for new theme
export const INPUT_BASE_CLASSES = "block w-full text-sm rounded-md shadow-sm bg-[var(--bg-input-main)] border-[var(--border-color)] placeholder-[var(--text-tertiary)] text-[var(--text-primary)]";
export const INPUT_FOCUS_CLASSES = "focus:border-[var(--interactive-focus-ring)] focus:ring-1 focus:ring-[var(--interactive-focus-ring)] focus:outline-none focus:shadow-[var(--glow-accent-cyan)]";
export const COMMON_BUTTON_FOCUS_CLASSES = "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg-app)] focus:ring-[var(--interactive-focus-ring)] focus:shadow-[var(--glow-accent-cyan)]";
export const YELLOW_BUTTON_FOCUS_CLASSES = "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg-app)] focus:ring-[var(--accent-special)] focus:shadow-[var(--glow-accent-yellow)]";


// Icons - classes updated for new theme
export const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75L14.25 12l1.5-1.75L17 8.5l1.25 1.75L19.75 12l-1.5 1.75z" />
  </svg>
);

export const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const TagIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

export const FolderIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);

export const FolderOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 015.25 7.5h13.5A2.25 2.25 0 0120.25 9.75m-16.5 0v1.5A2.25 2.25 0 005.25 13.5h13.5A2.25 2.25 0 0020.25 11.25v-1.5m-16.5 0V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0120.25 6.75v3M3.75 13.5h16.5m-16.5 0a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5h1.5m13.5 0h1.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H3.75m16.5 0A2.25 2.25 0 0018.75 12h-13.5A2.25 2.25 0 003.75 13.5m16.5 0v4.875c0 .621-.504 1.125-1.125 1.125H5.625c-.621 0-1.125-.504-1.125-1.125V13.5m16.5 0h-16.5" />
  </svg>
);

export const FolderPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m3.75-9.75H10.5a2.25 2.25 0 00-2.25 2.25v4.5a2.25 2.25 0 002.25 2.25h6.75a2.25 2.25 0 002.25-2.25v-4.5a2.25 2.25 0 00-2.25-2.25H15M9 12l-2.25 2.25m0-2.25L5.25 12M15 12l2.25 2.25m0-2.25L18.75 12M9 12l-2.25-2.25m0 2.25L5.25 12m15 0l2.25-2.25m0 2.25L18.75 12M9 12h6m-6 0a2.25 2.25 0 00-2.25 2.25v.75M15 12a2.25 2.25 0 012.25 2.25v.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);


export const SunIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent-special)]"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

export const MoonIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

export const Cog6ToothIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.116-1.003h2.58c.556 0 1.026.461 1.116 1.003L15 6.362a4.002 4.002 0 013.116 1.956l1.9-1.9a1.06 1.06 0 011.5 1.5l-1.9 1.9a4.002 4.002 0 010 3.116l1.9 1.9a1.06 1.06 0 01-1.5 1.5l-1.9-1.9a4.002 4.002 0 01-3.116 1.956L14.406 20.06c-.09.542-.56 1.003-1.116-1.003h-2.58c-.556 0-1.026.461-1.116-1.003L9 17.638a4.002 4.002 0 01-3.116-1.956l-1.9 1.9a1.06 1.06 0 01-1.5-1.5l1.9-1.9a4.002 4.002 0 010-3.116l-1.9-1.9a1.06 1.06 0 011.5-1.5l1.9 1.9A4.002 4.002 0 019 6.362l.594-2.422zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
);

export const ArrowDownTrayIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const ArrowUpTrayIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

export const ClipboardIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a8.966 8.966 0 01-7.834 0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

export const HistoryIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PlayIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);

export const KeyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237 1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
);

export const XMarkIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const MagnifyingGlassIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

export const ArrowsRightLeftIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18m-7.5-14L21 6.5m0 0L16.5 12M21 6.5H3" />
    </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-red-500"}> {/* Direct color for strong visual cue */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096q.376.029.746.065m3.22-.096c-.606-.056-1.22-.099-1.858-.13a48.067 48.067 0 00-1.858-.13m-2.28 0H5.021m13.935 0A48.073 48.073 0 0015.65 5.385" />
  </svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

export const LinkIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export const AdjustmentsHorizontalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);

export const BookmarkSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25L7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
  </svg>
);

export const ArrowUturnLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

export const ArrowUturnRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
  </svg>
);

export const InformationCircleIcon: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-tertiary)] opacity-70"}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export const CodeBracketSquareIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

export const ViewfinderCircleIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M7.5 20.25H6A2.25 2.25 0 013.75 18v-1.5M16.5 3.75h1.5A2.25 2.25 0 0120.25 6v1.5M16.5 20.25h1.5A2.25 2.25 0 0020.25 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)]"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

export const BoltIcon: React.FC<{className?: string}> = ({ className }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--accent1)]"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);
export const StarIconSolid: React.FC<{ className?: string }> = ({ className }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6 text-[var(--accent-special)]"}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.502 2.825c-.997.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

export const StarIconOutline: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-[var(--text-secondary)] hover:text-[var(--accent-special)]"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.613.049.843.896.402 1.314l-4.123 3.562a.563.563 0 00-.162.506l1.033 5.319c.118.61-.743 1.077-1.279.728L12 17.616a.563.563 0 00-.53 0l-4.834 2.852c-.536.35-.1391-.118-.279-.728l1.033-5.319a.563.563 0 00-.162.506l-4.123-3.562c-.44-.418-.21-.1265.402-1.314l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);


export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.044.588.05H11.25m-3.445 0H9.75m5.25 0H14.25m5.25 0h.105c.244 0 .485.02.72.055m0 0a2.25 2.25 0 100-2.186m0 2.186c-.195-.025-.39-.044-.588-.05H12.75m3.445 0H14.25M5.25 12a2.25 2.25 0 002.25 2.25h1.06c.368 0 .716-.144.976-.404L11.25 12l-1.714-1.846a1.5 1.5 0 00-.976-.404H7.5A2.25 2.25 0 005.25 12zm9 0a2.25 2.25 0 002.25 2.25h1.06c.368 0 .716-.144.976-.404L20.25 12l-1.714-1.846a1.5 1.5 0 00-.976-.404H16.5a2.25 2.25 0 00-2.25 2.25z" />
  </svg>
);

export const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);


// Icons for Result Labeling (Rec 3 of previous set, not this one)
// StarIconOutline & StarIconSolid are also used for Pinning (Rec 1 of current set)
export const HandThumbUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.424 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M6.633 10.5l-1.07-1.07a4.501 4.501 0 00-3.182-3.182S1.85 5.25 1.85 4.5a2.25 2.25 0 012.25-2.25S5.25 1.5 6.633 1.5v9z" />
    </svg>
);
export const HandThumbDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.424 2.031 1.08a9.041 9.041 0 002.861 2.4c.723-.384 1.35.956 1.653 1.715a4.498 4.498 0 01.322 1.672V21a.75.75 0 00.75.75A2.25 2.25 0 0016.5 19.5c0-1.152-.26-2.243-.723-3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 00-2.649-7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 01-1.423-.23H5.904M6.633 10.5l-1.07 1.07a4.5 4.5 0 01-3.182 3.182S1.85 18.75 1.85 19.5A2.25 2.25 0 004.1 21.75s1.14.75 2.533.75v-9z" />
    </svg>
);

export const Bars3Icon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const UserCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ArrowLeftOnRectangleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);


export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17'; 
export const GEMINI_MODEL_IMAGE = 'imagen-3.0-generate-002'; 

export const AVAILABLE_MODELS = [
    { id: 'gemini-2.5-flash-preview-04-17', name: "Gemini 2.5 Flash (04-17)" },
];

export const CURATED_PROMPT_CATEGORIES = [
    "General", "Creative Writing", "Development", "Marketing", "Education", "Business", "Utility",
    "Chains", "Chains-Input", "Chains-Step" 
] as const;

export const SAMPLE_CURATED_PROMPTS: CuratedPrompt[] = [
  {
    curated_id: "curated_dev_std_code_gen_0",
    title: "Standard Code Generation Template",
    content: "You are an expert {{programming_language}} developer. Write a function that {{describe_the_task}}.\nEnsure the function is:\n- Well-documented: Add clear comments explaining each step\n- Optimized for performance: Use efficient data structures and algorithms where applicable\n- Robust: Handle edge cases such as empty inputs, incorrect data types, and large datasets\n- Modular: Keep the function reusable and avoid hardcoded values",
    notes: "The most effective coding prompts follow a structured approach that provides clear context and requirements. Here's the proven framework.",
    category: "Development",
    suggestedTags: ["coding", "template", "generation", "best-practice"]
  },
  {
    curated_id: "curated_dev_adv_code_review_1",
    title: "Advanced Code Review Prompt",
    content: "Please review the following code:\n```{{language}}\n{{paste_your_code_here}}\n```\nConsider:\n1. Code quality and adherence to best practices\n2. Potential bugs or edge cases\n3. Performance optimizations\n4. Readability and maintainability\n5. Any security concerns\nSuggest improvements and explain your reasoning for each suggestion.",
    notes: "For comprehensive code analysis, use this structured approach.",
    category: "Development",
    suggestedTags: ["code review", "quality assurance", "optimization", "security"]
  },
  {
    curated_id: "curated_util_n8n_workflow_gen_9",
    title: "Comprehensive n8n Workflow Generation",
    content: "Create a workflow in the n8n automation tool based on the text instructions provided below. \nUser's Goal: {{user_automation_goal_description}}\nSteps:\n1. Parse the user's text input to understand the automation goal and components.\n2. Identify the necessary n8n nodes (triggers, actions, conditions) required to achieve this goal.\n3. Determine the connections and data flows between these nodes.\n4. Generate a valid n8n workflow JSON that can be imported directly into n8n.\n\nOutput Format: Return only the well-formatted JSON suitable for direct import into n8n. Do not include any other explanatory text outside the JSON block.",
    notes: "For generating complete n8n workflows from text descriptions of the desired automation.",
    category: "Utility",
    suggestedTags: ["n8n", "workflow automation", "json generation", "automation"]
  },
];

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    systemInstruction: "",
    responseMimeType: "text/plain" 
};

export const MAX_MICRO_HISTORY_LENGTH = 10;

export const PARAMETER_TOOLTIPS: Record<keyof ModelConfig, string> = {
  systemInstruction: "Guides the model's behavior and persona throughout the conversation. E.g., 'You are a helpful assistant that provides concise answers.'",
  temperature: "Controls randomness. Lower values (e.g., 0.2) make the output more deterministic and focused. Higher values (e.g., 0.8-1.0) make it more creative and surprising. Default: 0.7",
  topP: "Nucleus sampling. Controls diversity. The model considers tokens with probabilities summing up to topP. Lower values (e.g., 0.5) mean less common tokens are less likely. Default: 0.95",
  topK: "Filters vocabulary to the K most likely next tokens. Lower values make output more predictable. Default: 40",
  responseMimeType: "Specifies the format of the response. Use 'application/json' for structured JSON output, or 'text/plain' for regular text. Default: text/plain"
};

export const SAMPLE_SNIPPETS: Snippet[] = [
  { id: 'snip_act_as', title: 'Act as a [ROLE]', content: 'Act as a {{ROLE}}.', category: 'Common Phrase' },
  { id: 'snip_format_json', title: 'Format as JSON', content: 'Format your output as a JSON object with the following fields: {{FIELD_1}}, {{FIELD_2}}, {{FIELD_3}}.', category: 'Instruction' },
  { id: 'snip_explain_simple', title: 'Explain to a 5-year-old', content: 'Explain the concept of {{CONCEPT}} to a 5-year-old.', category: 'Common Phrase' },
  { id: 'snip_summarize', title: 'Summarize Text', content: 'Summarize the following text in {{NUMBER_OF_SENTENCES_OR_BULLET_POINTS}}:\n\n{{TEXT_TO_SUMMARIZE}}', category: 'Template' },
  { id: 'snip_list_pros_cons', title: 'List Pros and Cons', content: 'Provide a list of pros and cons for {{TOPIC_OR_DECISION}}.', category: 'Template' },
  { id: 'snip_step_by_step', title: 'Step-by-step Instructions', content: 'Provide step-by-step instructions on how to {{TASK}}.', category: 'Instruction'},
  { id: 'snip_brainstorm_ideas', title: 'Brainstorm Ideas', content: 'Brainstorm 5 ideas for {{SUBJECT}} related to {{SPECIFIC_AREA}}.', category: 'Template'},
];

export const GENERATE_PROMPT_IDEA_METAPROMPT = `You are an expert Prompt Engineer tasked with generating a novel and practical AI prompt.
The prompt should be suitable for general use or a common task category like 'creative writing', 'coding assistance', 'data analysis', 'summarization', or 'problem-solving'.
Your output MUST be a valid JSON object with the following structure and adhere to the constraints:
{
  "title": "A concise and descriptive title for the prompt (max 15 words).",
  "content": "The full prompt content. Make it actionable and clear. It can include placeholders like {{variable_name}} if appropriate for customizability. Keep it concise yet effective.",
  "notes": "Optional: Brief notes explaining the purpose or usage of this prompt (max 30 words). Leave empty string if no notes.",
  "suggestedTags": ["array", "of", "1_to_3", "relevant", "lowercase", "tags"]
}
Ensure the generated prompt is unique, useful, and not overly niche.
Do not include any explanatory text or markdown formatting outside the JSON object itself.`;