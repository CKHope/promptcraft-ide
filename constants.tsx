
import React from 'react';
import { CuratedPrompt, ModelConfig, Snippet } from './types'; 

export const APP_NAME = "PromptCraft IDE";
export const DB_NAME = "prompt_ide_db";
export const DB_VERSION = 3; 

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.116-1.003h2.58c.556 0 1.026.461 1.116 1.003L15 6.362a4.002 4.002 0 013.116 1.956l1.9-1.9a1.06 1.06 0 011.5 1.5l-1.9 1.9a4.002 4.002 0 010 3.116l1.9 1.9a1.06 1.06 0 01-1.5 1.5l-1.9-1.9a4.002 4.002 0 01-3.116 1.956L14.406 20.06c-.09.542-.56 1.003-1.116 1.003h-2.58c-.556 0-1.026.461-1.116-1.003L9 17.638a4.002 4.002 0 01-3.116-1.956l-1.9 1.9a1.06 1.06 0 01-1.5-1.5l1.9-1.9a4.002 4.002 0 010-3.116l-1.9-1.9a1.06 1.06 0 011.5-1.5l1.9 1.9A4.002 4.002 0 019 6.362l.594-2.422zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
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


export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-lite-preview-06-17'; 
export const GEMINI_MODEL_IMAGE = 'imagen-3.0-generate-002'; 

export const AVAILABLE_MODELS = [
    { id: 'gemini-2.5-flash-lite-preview-06-17', name: "Gemini 2.5 Flash Lite (06-17)" },
    { id: 'gemini-2.5-flash-preview-04-17', name: "Gemini 2.5 Flash (04-17)" },
];

export const CURATED_PROMPT_CATEGORIES = [
    "General", "Creative Writing", "Development", "Marketing", "Education", "Business", "Utility",
    "Chains", "Chains-Input", "Chains-Step" // Keep chain categories in case users create them, or for future use
] as const;

export const SAMPLE_CURATED_PROMPTS: CuratedPrompt[] = [
  // Section 1: Coding Prompts
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
    curated_id: "curated_dev_debug_scan_2",
    title: "Debug: Scan Code for Problems",
    content: "Scan the following {{language}} code for potential problems, bugs, or anti-patterns. Provide a list of issues found and suggest fixes if possible.\n\n```{{language}}\n{{code_to_scan}}\n```",
    notes: "A simple yet effective prompt for identifying issues in code.",
    category: "Development",
    suggestedTags: ["debugging", "troubleshooting", "code-scan"]
  },
  {
    curated_id: "curated_dev_debug_perf_eval_3",
    title: "Debug: Evaluate Code for Performance",
    content: "Evaluate the following {{language}} code for performance issues. Identify any bottlenecks or areas for optimization and explain your reasoning.\n\n```{{language}}\n{{code_to_evaluate}}\n```",
    notes: "Use this prompt to focus on performance aspects of your code.",
    category: "Development",
    suggestedTags: ["debugging", "performance", "optimization"]
  },
  {
    curated_id: "curated_dev_debug_syntax_help_4",
    title: "Debug: Correct Syntax Query",
    content: "What is the correct syntax to {{specific_task_or_operation}} in {{programming_language}}? Provide a concise example.",
    notes: "Quickly get help with syntax for a specific operation in a language.",
    category: "Development",
    suggestedTags: ["debugging", "syntax", "query"]
  },
  // Section 2: Image Generation Prompts
  {
    curated_id: "curated_cw_additive_img_prompt_5",
    title: "Additive Image Prompting Framework",
    content: "{{Subject Description}} | {{Style/Medium}} | {{Color Palette}} | {{Background/Environment}} | {{Technical Details}}",
    notes: "The most consistent approach uses five structured categories. This technique involves breaking prompts into specific sections. Example: 'A single mechanic woman with blue hair | GTA portrait flat illustration | synthwave palette | garage in the background'",
    category: "Creative Writing",
    suggestedTags: ["image generation", "framework", "additive prompting", "stable diffusion", "midjourney"]
  },
  {
    curated_id: "curated_cw_essential_elements_img_6",
    title: "Essential Elements Structure for Image Prompts",
    content: "Generate an image of type '{{image_type}}'. The primary subject is '{{subject}}'. The background setting is '{{background_setting}}'. The artistic style should be '{{style}}'.",
    notes: "For optimal results, include these four key components: image type, subject, background, and style.",
    category: "Creative Writing",
    suggestedTags: ["image generation", "structure", "template"]
  },
  // Section 3: Prompt Helper Generation
  {
    curated_id: "curated_util_meta_prompt_gen_7",
    title: "Meta-Prompt for Prompt Generation/Optimization",
    content: "Role: {{Senior_Prompt_Engineer}}\nTask: {{Optimize_the_following_prompt_for_better_AI_responses | Generate_a_new_prompt_for_achieving_XYZ_goal}}\nContext: {{Specify_the_AI_model_and_intended_use_case}}\nCurrent Prompt (if optimizing): {{Insert_your_original_prompt_here}}\nInstructions:\n1. Analyze the prompt's clarity and specificity (or goal if generating new).\n2. Identify missing context or constraints.\n3. Suggest improvements or construct a high-quality prompt.\n4. Provide 3 optimized variations or new prompt options.",
    notes: "Use this recursive approach to improve any prompt or generate new ones for a specific task.",
    category: "Utility",
    suggestedTags: ["prompt engineering", "meta-prompt", "optimization", "generation"]
  },
  {
    curated_id: "curated_util_cot_prompt_improve_8",
    title: "Chain of Thought for Prompt Improvement",
    content: "To improve this prompt: '{{prompt_to_improve}}', analyze it step by step:\n1. Identify the core objective of the original prompt.\n2. Assess the clarity of its instructions and language.\n3. Check if all necessary context is provided for the AI to perform well.\n4. Evaluate if the output format specifications (if any) are clear.\n5. Based on the above, suggest specific improvements to the prompt or rewrite it for better results with {{AI_Model_Name_Optional}}.",
    notes: "Apply systematic reasoning to enhance prompt quality using a Chain of Thought approach.",
    category: "Utility",
    suggestedTags: ["prompt engineering", "chain of thought", "improvement", "analysis"]
  },
  // Section 4: Automated n8n Workflow Generation
  {
    curated_id: "curated_util_n8n_workflow_gen_9",
    title: "Comprehensive n8n Workflow Generation",
    content: "Create a workflow in the n8n automation tool based on the text instructions provided below. \nUser's Goal: {{user_automation_goal_description}}\nSteps:\n1. Parse the user's text input to understand the automation goal and components.\n2. Identify the necessary n8n nodes (triggers, actions, conditions) required to achieve this goal.\n3. Determine the connections and data flows between these nodes.\n4. Generate a valid n8n workflow JSON that can be imported directly into n8n.\n\nOutput Format: Return only the well-formatted JSON suitable for direct import into n8n. Do not include any other explanatory text outside the JSON block.",
    notes: "For generating complete n8n workflows from text descriptions of the desired automation.",
    category: "Utility",
    suggestedTags: ["n8n", "workflow automation", "json generation", "automation"]
  },
  {
    curated_id: "curated_util_n8n_agent_design_10",
    title: "Design AI-Driven n8n Prompt Engineering Agent",
    content: "Design an n8n workflow that functions as an intelligent agent for prompt engineering. This agent should:\n1. Receive user intent for a task (e.g., 'summarize this text', 'write a marketing email').\n2. Analyze the user intent and select an appropriate Large Language Model (e.g., OpenAI, Anthropic, Google).\n3. Generate an optimized prompt tailored for the selected model and the user's task.\n4. Optionally, execute the generated prompt against the chosen LLM and return the result.\nDescribe the key n8n nodes, their configurations, and the data flow for this intelligent agent.",
    notes: "Advanced: Use this to conceptualize an n8n workflow that itself generates optimized prompts.",
    category: "Utility",
    suggestedTags: ["n8n", "ai agent", "prompt engineering", "workflow design", "meta"]
  },
  {
    curated_id: "curated_util_n8n_multi_agent_risen_11",
    title: "Design Multi-Agent n8n Workflow (RISEN Framework)",
    content: "Design an n8n workflow using the RISEN framework (Router, Input, Specialized AI Agents, Executor, Notification) for the following complex automation task: {{complex_automation_task_description}}.\nSpecifically describe:\n- How user input will be received (e.g., Webhook).\n- The role of the Router agent.\n- At least 2-3 Specialized AI Agents required and their specific tasks.\n- How the Executor agent will aggregate outputs from specialized agents.\n- The final synthesized result and how it will be delivered (e.g., email, database update).",
    notes: "For complex automations, consider using the RISEN framework with multiple specialized AI agents. This prompt helps design such a workflow.",
    category: "Utility",
    suggestedTags: ["n8n", "multi-agent", "risen framework", "workflow design", "advanced automation"]
  },
  // Section 5: Content Creation and Writing
  {
    curated_id: "curated_cw_voice_matching_12",
    title: "Voice-Matching Writing Prompt",
    content: "I want you to write using my style and paragraph spacing. \nStep 1: I'll share my content so you can learn my style. Please acknowledge when you are ready for this.\nStep 2: After you've analyzed my style, I'll share an excerpt of new text. I want you to rewrite that excerpt in my writing style, providing 5 distinct variations.\n\nAre you ready for me to share my content for Step 1?",
    notes: "Train AI to write in your specific style. This is a multi-turn prompt.",
    category: "Creative Writing",
    suggestedTags: ["writing style", "voice matching", "content creation", "personalization"]
  },
  {
    curated_id: "curated_mkt_seo_content_gen_13",
    title: "SEO-Optimized Content Generation",
    content: "You are a top-tier SEO specialist and copywriter. Write a long-form, highly informative article on the topic of '{{topic}}' that aims to rank on Google's first page. The target audience is {{target_audience}}. \nFocus on:\n1. Superior content depth and structure (use headings, subheadings, lists, etc.).\n2. Strategic keyword optimization for the primary keyword '{{primary_keyword}}' and related secondary keywords like '{{secondary_keyword_1}}', '{{secondary_keyword_2}}'.\n3. Comprehensive coverage of the topic, addressing common questions and providing unique insights.\n4. A professional yet engaging tone.\n\nDeliver the article in Markdown format.",
    notes: "For generating search engine optimized content.",
    category: "Marketing",
    suggestedTags: ["seo", "content creation", "copywriting", "article writing", "blogging"]
  },
  // Section 6: Data Analysis and Research
  {
    curated_id: "curated_biz_data_analysis_framework_14",
    title: "Comprehensive Data Analysis Framework",
    content: "Goal: {{Define_your_desired_outcome_from_data_analysis}}\nContext: The provided dataset is {{describe_dataset_source_and_type}}. {{Provide_any_relevant_background_information}}.\nPersona: Act as a {{data_scientist | data_analyst}} with {{X_years_of}} experience in {{relevant_domain}}.\nAnalysis Required:\n1. {{Specific_analysis_type_e_g_trend_analysis_correlation_clustering}}\n2. Key metrics to examine: {{list_key_metrics}}\n3. Expected insights: {{what_questions_are_you_trying_to_answer}}\nFormat: {{Specify_output_format_e_g_summary_report_bullet_points_visualizations_description}}",
    notes: "Structure your data analysis requests systematically with this framework.",
    category: "Business",
    suggestedTags: ["data analysis", "research", "framework", "data science"]
  },
  {
    curated_id: "curated_biz_eda_prompt_15",
    title: "Exploratory Data Analysis (EDA) Prompt",
    content: "Please perform an exploratory data analysis (EDA) on the following dataset: \n```\n{{paste_sample_or_describe_dataset_structure_here}}\n```\nSummarize the key characteristics of this dataset, including:\n- Data types and overall structure (rows, columns).\n- Identification of missing values and potential data quality issues.\n- Basic statistics (mean, median, mode, standard deviation for numerical; counts for categorical) and distributions for key variables.\n- Any significant patterns, correlations, or outliers observed.\n- Recommendations for further analysis or data cleaning steps.",
    notes: "For initial data exploration and understanding.",
    category: "Business",
    suggestedTags: ["eda", "data exploration", "statistics", "data quality"]
  },
  // Section 7: Business Process Automation
  {
    curated_id: "curated_biz_strategic_analysis_16",
    title: "Strategic Business Analysis & Automation Plan",
    content: "Analyze the current state of {{business_area_or_company}} based on the following information: {{provide_market_research_financials_or_competitor_data}}.\nThen, develop a strategic plan covering these areas:\n1.  **Strategize**: Create actionable plans for growth and efficiency in {{business_area_or_company}}.\n2.  **Optimize**: Identify areas to improve business processes, cost structures, or resource allocation.\n3.  **Automate**: Propose specific AI-driven automation solutions to enhance productivity and reduce manual effort for the optimized processes.\n4.  **Forecast**: Predict potential revenue trends, demand fluctuations, or market changes resulting from these strategies for the next {{time_period}}.",
    notes: "For comprehensive business strategy development focusing on optimization and automation.",
    category: "Business",
    suggestedTags: ["business strategy", "process automation", "optimization", "forecasting", "ai in business"]
  },
  {
    curated_id: "curated_mkt_customer_segmentation_17",
    title: "Customer Segmentation Analysis & Strategy",
    content: "Analyze the provided customer data for {{company_or_product_name}} (describe data source/structure: {{data_description}}) and identify distinct customer segments based on:\n- Buying patterns and frequency\n- Average order value and lifetime value\n- Engagement metrics (e.g., website visits, email opens) and preferences\n\nFor each identified segment, provide:\n1. A clear name and description of the segment.\n2. Key characteristics and differentiating factors.\n3. Suggested tailored marketing approaches.\n4. Potential retention strategies for that segment.",
    notes: "For marketing and sales optimization through customer segmentation.",
    category: "Marketing",
    suggestedTags: ["customer segmentation", "marketing strategy", "data analysis", "sales optimization"]
  },
  // Section 8: Creative Problem Solving
  {
    curated_id: "curated_gen_perspective_challenge_18",
    title: "Perspective-Challenging Prompt",
    content: "I am currently thinking about {{describe_your_current_problem_or_idea}}. If you had to challenge my thinking on this, where would you start? What assumptions might I be making, and what alternative perspectives should I consider?",
    notes: "Force new thinking angles. This prompt helps break out of mental loops and discover overlooked aspects or assumptions.",
    category: "General",
    suggestedTags: ["problem solving", "critical thinking", "creativity", "brainstorming"]
  },
  {
    curated_id: "curated_gen_scenario_brainstorm_19",
    title: "Scenario-Based Creative Brainstorming",
    content: "Create a detailed scenario where {{specific_situation_or_challenge_description}}.\nWhen developing this scenario and potential solutions, consider:\n1. Multiple stakeholder perspectives (e.g., {{stakeholder_1}}, {{stakeholder_2}}, {{stakeholder_3}}).\n2. Potential obstacles and opportunities inherent in the situation.\n3. Resource constraints and limitations (e.g., {{budget_constraint}}, {{time_constraint}}, {{personnel_constraint}}).\n4. Timeline and urgency factors.\n\nBased on this scenario, provide 3 different approaches to address the situation, outlining the pros and cons for each approach.",
    notes: "For enhanced brainstorming by exploring a situation from multiple angles.",
    category: "General",
    suggestedTags: ["creative thinking", "scenario planning", "problem solving", "decision making"]
  },
  // Section 9: Learning and Skill Development
  {
    curated_id: "curated_edu_learning_plan_gen_20",
    title: "Structured Learning Plan Generation",
    content: "Create a comprehensive learning plan for acquiring the skill/subject of {{subject_or_skill}}. The plan should be tailored for a {{beginner | intermediate | advanced}} level learner and cover approximately {{duration_e_g_8_weeks}}.\nStructure the plan as follows:\n- Break down the learning into weekly modules or key topics.\n- For each module/topic, include practical exercises, small projects, or application ideas.\n- Suggest specific resources and materials (e.g., online courses, books, documentation, tools).\n- Define measurable progress milestones for each phase.\n- Provide criteria for self-assessment or project evaluation.",
    notes: "For systematic skill acquisition with a structured plan.",
    category: "Education",
    suggestedTags: ["learning plan", "skill development", "education plan", "self-study"]
  },
  {
    curated_id: "curated_edu_tech_concept_explain_21",
    title: "Technical Concept Explanation",
    content: "Explain the technical concept of {{technical_concept_name}} as if you were teaching it to a {{target_audience_e_g_beginner_developer_business_manager_high_school_student}}.\nYour explanation should include:\n- Clear definitions of key terms and context for the concept.\n- A step-by-step breakdown of how it works or its main components.\n- Real-world examples or analogies to make it understandable.\n- Common pitfalls, misconceptions, or challenges related to it.\n- Practical next steps for someone wanting to learn more or implement it.",
    notes: "For breaking down complex technical concepts into understandable explanations.",
    category: "Education",
    suggestedTags: ["explanation", "technical writing", "teaching", "concept breakdown"]
  },
  // Section 10: Marketing and Sales Optimization
  {
    curated_id: "curated_mkt_campaign_perf_analysis_22",
    title: "Marketing Campaign Performance Analysis",
    content: "Analyze the performance of my last {{X_number}} marketing campaigns for {{product_or_service_name}}. The campaigns were run on {{list_channels_e_g_Facebook_Google_Ads_Email}}. Data is available from {{data_source_e_g_analytics_platform_spreadsheet}}.\nYour analysis should cover:\n- Conversion rates (e.g., sign-ups, purchases) by audience segment (if available).\n- Creative elements (ads, copy, visuals) that drove the highest engagement.\n- Cost-effectiveness across different platforms/channels (e.g., CPA, ROAS).\n- Customer acquisition cost (CAC) and estimated lifetime value (LTV) if possible.\n- Provide specific, actionable recommendations for optimizing future campaigns.",
    notes: "For comprehensive marketing campaign evaluation.",
    category: "Marketing",
    suggestedTags: ["marketing analytics", "campaign analysis", "performance review", "optimization"]
  },
  {
    curated_id: "curated_mkt_personalized_sales_outreach_23",
    title: "Personalized Sales Outreach Content",
    content: "Create personalized outreach content (e.g., email, LinkedIn message) for the customer segment: {{customer_segment_description}}. This segment is interested in {{product_or_service_category}}.\nYour outreach should:\n- Analyze their specific pain points and needs related to {{their_industry_or_problem}}.\n- Reference relevant industry trends or challenges they might be facing.\n- Propose concrete value propositions of how {{our_product_or_service}} can help them.\n- Include a clear call-to-action (e.g., book a demo, visit a link, reply).\n- Maintain a {{professional | casual | consultative}} tone.",
    notes: "For targeted customer communication in sales.",
    category: "Marketing",
    suggestedTags: ["sales outreach", "personalization", "lead generation", "email marketing", "linkedin"]
  },
  // Section 11: Project Management and Planning
  {
    curated_id: "curated_biz_project_breakdown_24",
    title: "Comprehensive Project Breakdown & Plan",
    content: "Create a detailed project plan for the following project: {{project_description}}.\nThe plan should include:\n1. Scope, Objectives, and Success Criteria: Clearly define what the project will deliver and how success will be measured.\n2. Phases and Milestones: Break the project down into manageable phases with key milestones and deliverables for each.\n3. Required Resources and Dependencies: Identify necessary personnel, tools, budget, and any critical dependencies (internal/external).\n4. Estimated Timelines and Critical Path: Provide an estimated timeline for each phase and identify the critical path.\n5. Risk Mitigation Strategies: Outline potential risks and suggest strategies to mitigate them.\n6. Suggested Team Roles and Responsibilities: Propose key roles needed for the project and their main responsibilities.",
    notes: "For complex project planning and detailed breakdown.",
    category: "Business",
    suggestedTags: ["project management", "project plan", "planning", "risk management", " PMP"]
  },
  {
    curated_id: "curated_biz_risk_assessment_mitigation_25",
    title: "Risk Assessment and Mitigation Plan",
    content: "Analyze potential risks for the following project/initiative: {{project_or_initiative_description}}.\nYour analysis should:\n- Identify high-impact, high-probability risks (at least 5-7 key risks).\n- Assess the potential consequences and severity if each risk materializes.\n- Develop specific, actionable mitigation strategies for each identified risk.\n- Create contingency plans for critical risks (what to do if mitigation fails).\n- Suggest monitoring mechanisms and early warning indicators for these risks.",
    notes: "For proactive project management and risk planning.",
    category: "Business",
    suggestedTags: ["risk assessment", "risk management", "project planning", "mitigation", "contingency plan"]
  },
  // Section 12: Quality Assurance and Testing
  {
    curated_id: "curated_dev_comprehensive_code_testing_26",
    title: "Comprehensive Code Testing Strategy",
    content: "Generate a comprehensive testing strategy and example tests for the following {{programming_language}} code snippet/module that {{description_of_code_functionality}}:\n\n```{{programming_language}}\n{{paste_code_here}}\n```\n\nYour output should cover:\n- Unit tests for individual functions/methods, focusing on different inputs and outputs.\n- Integration tests for interactions between components (if applicable from snippet).\n- Edge case and boundary condition tests (e.g., empty inputs, nulls, max/min values).\n- Suggestions for performance and load testing scenarios if relevant.\n- Potential security vulnerability checks to consider.\nInclude example test data and expected outcomes for a few key tests.",
    notes: "For thorough software validation and test case generation.",
    category: "Development",
    suggestedTags: ["testing", "quality assurance", "unit testing", "integration testing", "test cases", "software development"]
  },
  {
    curated_id: "curated_biz_process_quality_eval_27",
    title: "Business Process Quality Evaluation",
    content: "Evaluate the following business process for quality and efficiency: {{detailed_description_of_the_process_including_steps_roles_tools}}.\nYour assessment should cover:\n- Current performance metrics and identification of bottlenecks or pain points in the process.\n- Compliance with industry standards or best practices for this type of process (if applicable).\n- Resource utilization (time, cost, personnel) and overall cost-effectiveness.\n- Error rates, quality issues, and their impact.\n- Opportunities for automation, simplification, or other improvements to enhance quality and efficiency.",
    notes: "For evaluating and improving business process quality.",
    category: "Business",
    suggestedTags: ["process improvement", "quality assurance", "business process management", "efficiency", "optimization"]
  },
  // Section 13: Communication and Documentation
  {
    curated_id: "curated_util_tech_doc_gen_28",
    title: "Technical Documentation Generation",
    content: "Create comprehensive documentation for the following {{system_process_or_feature_name}} which {{brief_description_of_its_purpose_and_functionality}}.\nThe documentation should be targeted at a {{technical_level_e_g_beginner_developer_advanced_user_non_technical_manager}} audience and include these sections:\n- Executive Summary: A brief overview for stakeholders.\n- Technical Specifications: Detailed information for developers or technical staff (if applicable).\n- User Guide: Step-by-step instructions on how to use/interact with it.\n- Troubleshooting / FAQ: Common issues and their solutions.\n- Maintenance and Update Procedures (if applicable).",
    notes: "For generating clear and comprehensive technical documentation.",
    category: "Utility",
    suggestedTags: ["documentation", "technical writing", "user guide", "communication"]
  },
  {
    curated_id: "curated_util_meeting_report_summary_29",
    title: "Meeting/Report Summarization",
    content: "Summarize the following meeting transcript / report content. The goal is to create a {{concise_executive_summary | detailed_action_item_list | client_facing_update}}.\n\nContent to summarize:\n```\n{{paste_meeting_transcript_or_report_text_here}}\n```\n\nYour summary must highlight:\n- Key decisions made and action items agreed upon.\n- Assigned responsibilities and deadlines for each action item.\n- Any unresolved issues or topics requiring further discussion/next steps.\n- Important metrics, data points, or findings mentioned.\n- Specific follow-up requirements.",
    notes: "For efficiently summarizing long meetings or reports into actionable insights.",
    category: "Utility",
    suggestedTags: ["summarization", "meeting minutes", "report writing", "communication", "productivity"]
  },
  // Section 14: Competitive Analysis and Market Research
  {
    curated_id: "curated_mkt_competitor_analysis_30",
    title: "Comprehensive Competitor Analysis",
    content: "Conduct a detailed competitive analysis for the {{industry_or_market_segment}} market, focusing on our company {{your_company_name_optional}} which offers {{your_product_service_description}}.\nIdentify {{number_e_g_3_5}} direct and indirect competitors.\nFor each competitor, analyze:\n- Their strengths, weaknesses, and overall market positioning.\n- Their pricing strategies and value propositions.\n- Their marketing channels and customer acquisition approaches.\nBased on this analysis, identify:\n- Market gaps and untapped opportunities for {{your_company_name_optional}}.\n- Suggest actionable competitive differentiation strategies for our product/service.",
    notes: "For strategic market positioning and understanding competitors.",
    category: "Marketing",
    suggestedTags: ["competitive analysis", "market research", "business strategy", "swot"]
  },
  {
    curated_id: "curated_mkt_market_trend_analysis_31",
    title: "Market Trend Analysis & Strategic Response",
    content: "Analyze current market trends for the {{industry_or_sector}} sector, relevant to a company like {{your_company_type_or_name}} offering {{your_products_services}}.\nYour analysis should cover:\n- Emerging technologies and innovations impacting the sector.\n- Significant regulatory or compliance changes.\n- Shifts in consumer behavior, preferences, or expectations.\n- Key economic, social, or demographic factors.\n- Predict potential future market developments over the next {{time_period_e_g_2_5_years}}.\n- Recommend strategic responses or adaptations for a company in this space.",
    notes: "For strategic planning based on current and future market trends.",
    category: "Marketing",
    suggestedTags: ["market trends", "trend analysis", "strategic planning", "market research", "forecasting"]
  },
  // Section 15: Financial Analysis and Planning
  {
    curated_id: "curated_biz_financial_perf_eval_32",
    title: "Financial Performance Evaluation",
    content: "Analyze the following financial data for {{company_name_or_period}}:\n```\n{{paste_financial_statements_or_key_data_here_e_g_income_statement_balance_sheet_cash_flow_details}}\n```\nProvide a comprehensive evaluation including:\n- Key performance indicators (KPIs) and financial ratios (e.g., profitability, liquidity, efficiency, solvency ratios).\n- Trend analysis over {{relevant_periods_if_data_allows}} and year-over-year comparisons.\n- Cash flow and liquidity assessment.\n- Profitability and operational efficiency metrics.\n- Identification of significant risk factors or areas of concern based on the financials.\n- High-level future financial projections or scenarios for the next {{time_period_e_g_quarter_year}} if data permits such inference.",
    notes: "For comprehensive financial assessment and KPI analysis.",
    category: "Business",
    suggestedTags: ["financial analysis", "performance review", "kpi", "ratio analysis", "business finance"]
  },
  {
    curated_id: "curated_biz_budget_planning_opt_33",
    title: "Budget Planning and Optimization",
    content: "Create a comprehensive budget plan for the {{project_name | department_name | initiative_name}} for the upcoming {{fiscal_period_e_g_year_quarter}}. The available budget is approximately {{total_budget_amount_optional}}.\nThe plan should include:\n- Detailed cost breakdown by category (e.g., personnel, marketing, R&D, operations, software, travel).\n- Revenue projections and underlying assumptions (if applicable).\n- Resource allocation priorities based on strategic goals: {{list_strategic_goals}}.\n- Provisions for contingency (e.g., {{percentage_of_budget}}%) and risk management.\n- Key performance metrics for tracking budget adherence and effectiveness.\n- Suggestions for optimization opportunities and cost-saving measures without compromising key objectives.",
    notes: "For strategic resource allocation and budget creation.",
    category: "Business",
    suggestedTags: ["budgeting", "financial planning", "resource allocation", "cost optimization", "forecasting"]
  },
  // Section 16: Customer Experience and Support
  {
    curated_id: "curated_mkt_cust_journey_map_34",
    title: "Customer Journey Mapping",
    content: "Map the complete customer journey for our {{product_or_service_name}}. The typical customer is {{customer_persona_description}}.\nYour mapping should:\n- Identify all key touchpoints and interactions the customer has with our brand/product/service, from awareness to post-purchase/renewal.\n- Analyze pain points, friction areas, and moments of delight at each stage.\n- Evaluate the emotional states (e.g., frustration, satisfaction, confusion) likely experienced by the customer at each touchpoint.\n- Assess current performance metrics or available data for each stage (if known, otherwise make educated assumptions).\n- Recommend specific improvements and optimizations for each stage to enhance the overall customer experience.\n- Design or describe an enhanced experience workflow incorporating these improvements.",
    notes: "For understanding and enhancing the overall customer experience.",
    category: "Marketing",
    suggestedTags: ["customer journey", "cx", "ux", "customer experience", "service design", "user research"]
  },
  {
    curated_id: "curated_biz_support_proc_opt_35",
    title: "Customer Support Process Optimization",
    content: "Optimize our current customer support process for {{product_or_service_name}}. The current process is: {{describe_current_support_process_channels_tools_etc}}.\nYour optimization plan should:\n- Analyze current performance metrics like average response times, resolution rates, customer satisfaction scores (CSAT), and common issue types.\n- Identify root causes for common or recurring customer issues.\n- Develop standardized response procedures or templates for frequent inquiries.\n- Propose the creation of self-service resources (e.g., updated FAQs, knowledge base articles, video tutorials) to address common problems proactively.\n- Suggest areas where automation or AI assistance (e.g., chatbots for initial triage, AI-suggested replies for agents) could be implemented.\n- Establish clear performance metrics and monitoring methods for the optimized process.",
    notes: "For improving efficiency and effectiveness of customer service operations.",
    category: "Business",
    suggestedTags: ["customer support", "process optimization", "service improvement", "automation", "helpdesk"]
  },
  // Section 17: Innovation and Product Development
  {
    curated_id: "curated_biz_prod_ideation_validation_36",
    title: "Product Ideation and Validation Strategy",
    content: "Generate and validate new product ideas for the {{target_market_or_customer_segment}} related to {{existing_product_line_or_company_focus_optional}}.\nYour process should include:\n- Identifying unmet needs, pain points, or emerging desires within the target segment.\n- Brainstorming at least 3-5 distinct solution concepts or product features to address these needs.\n- For each concept, evaluating its market potential, technical feasibility, and alignment with our company's strengths (assume strengths like {{company_strength_1}}, {{company_strength_2}}).\n- Assessing the competitive landscape and how each concept offers differentiation.\n- Developing Minimum Viable Product (MVP) specifications for the most promising concept(s).\n- Outlining a strategy for testing and validating these MVP concepts with the target audience.",
    notes: "For systematic innovation and new product development.",
    category: "Business",
    suggestedTags: ["product development", "ideation", "innovation", "mvp", "market validation", "product strategy"]
  },
  {
    curated_id: "curated_biz_tech_impl_plan_37",
    title: "Technology Implementation Planning",
    content: "Develop a comprehensive implementation plan for adopting/integrating {{new_technology_or_system_name}} into our organization. This technology aims to solve {{problem_it_solves_or_benefit_it_provides}}.\nOur current relevant infrastructure/processes are: {{description_of_current_state}}.\nThe plan should cover:\n- Assessment of current state and detailed requirements gathering for the new technology.\n- Definition of implementation phases, key milestones, and deliverables for each phase.\n- Identification of resource needs (personnel, budget, tools, external vendors) and critical dependencies.\n- Evaluation of potential risks (e.g., technical, operational, adoption) and development of mitigation strategies.\n- Creation of training plans for users/staff and a change management strategy to ensure smooth adoption.\n- Establishment of success metrics and a monitoring plan to track the implementation progress and post-launch performance.",
    notes: "For strategic adoption and integration of new technologies or systems.",
    category: "Business",
    suggestedTags: ["technology implementation", "project management", "change management", "it strategy", "system integration"]
  },
  // Section 18: Team Management and HR
  {
    curated_id: "curated_biz_team_perf_analysis_38",
    title: "Team Performance Analysis & Optimization",
    content: "Analyze the performance and dynamics of a team responsible for {{team_responsibilities_or_project_type}}. The team consists of {{number}} members with roles like {{role_1}}, {{role_2}}, etc. Current challenges include {{challenge_1_optional}}, {{challenge_2_optional}}.\nYour analysis should evaluate:\n- Individual and collective productivity towards achieving {{team_goals_or_kpis}}.\n- Identification of any skill gaps or areas for professional development within the team.\n- Assessment of communication effectiveness and collaboration patterns (both internal and with other teams).\n- Review of goal achievement, milestone progress, and adherence to timelines.\n- Suggest specific team optimization strategies (e.g., process changes, tool adoption, meeting cadence adjustments).\n- Develop high-level performance improvement plans or coaching areas for individuals or the team as a whole.",
    notes: "For effective team leadership and performance improvement.",
    category: "Business",
    suggestedTags: ["team management", "hr", "performance review", "leadership", "organizational development", "team building"]
  },
  {
    curated_id: "curated_biz_talent_acq_dev_strat_39",
    title: "Talent Acquisition and Development Strategy",
    content: "Create a comprehensive talent strategy for a {{company_size_stage_e_g_startup_mid_size_enterprise}} in the {{industry}} sector. The company's key strategic goals for the next {{time_period_e_g_1_3_years}} are {{goal_1}}, {{goal_2}}.\nThe talent strategy should address:\n- Defining required skills and core competencies for current and future needs, aligned with strategic goals.\n- Developing compelling job descriptions and ideal candidate profiles for key roles.\n- Designing effective recruitment and selection processes (sourcing, interviewing, assessment).\n- Creating structured onboarding and integration programs for new hires.\n- Establishing clear training and development pathways, including mentorship or leadership programs.\n- Implementing strategies for employee retention, engagement, and career progression.",
    notes: "For strategic HR planning related to acquiring and developing talent.",
    category: "Business",
    suggestedTags: ["human resources", "talent acquisition", "recruitment", "employee development", "hr strategy", "onboarding"]
  },
  // Section 19: Compliance and Risk Management
  {
    curated_id: "curated_biz_reg_compliance_assess_40",
    title: "Regulatory Compliance Assessment Plan",
    content: "Evaluate our organization's compliance with {{specific_regulation_or_standard_e_g_GDPR_HIPAA_ISO_27001}}. Our organization is a {{company_description_type_size_industry}}.\nYour assessment plan should include:\n- Identification of all applicable requirements and obligations under this regulation/standard.\n- A methodology to assess our current compliance status and identify any gaps (e.g., document review, interviews, system checks).\n- A framework for developing remediation plans for any identified gaps, including timelines and responsibilities.\n- Procedures for ongoing monitoring of compliance and regular reporting.\n- A plan for establishing and maintaining compliance (e.g., policy updates, training programs).\n- High-level guidance for audit preparation and response protocols related to this regulation/standard.",
    notes: "For comprehensive compliance management and audit readiness.",
    category: "Business",
    suggestedTags: ["compliance", "risk management", "regulatory affairs", "audit", "governance"]
  },
  {
    curated_id: "curated_biz_enterprise_risk_analysis_41",
    title: "Enterprise Risk Analysis Framework",
    content: "Conduct a comprehensive enterprise risk analysis for an organization like {{organization_type_and_industry}}. The key operational areas are {{area_1}}, {{area_2}}, {{area_3}}.\nYour framework should outline how to:\n- Identify and categorize potential risks across the enterprise (e.g., financial, operational, strategic, reputational, cyber-security, compliance).\n- Assess the probability (likelihood) and potential impact (severity) for each identified risk.\n- Evaluate the effectiveness of current mitigation measures and controls in place.\n- Develop risk response strategies (e.g., avoid, mitigate, transfer, accept) for significant risks.\n- Create monitoring systems and escalation procedures for critical risks.\n- Establish a risk governance structure and reporting framework to senior management/board.",
    notes: "For strategic and comprehensive risk management across an organization.",
    category: "Business",
    suggestedTags: ["risk management", "enterprise risk", "erm", "strategic planning", "governance", " GRC"]
  },
  // Section 20: Strategic Planning and Execution
  {
    curated_id: "curated_biz_long_term_strat_plan_42",
    title: "Long-Term Strategic Planning Framework",
    content: "Develop a comprehensive long-term (e.g., 3-5 year) strategic plan for an organization that is {{description_of_organization_current_state_industry_size}}. Its current market position is {{current_market_position}} and key capabilities include {{capability_1}}, {{capability_2}}.\nThe strategic plan should encompass:\n- Analysis of the current market position, competitive landscape, and internal capabilities (SWOT analysis elements).\n- Definition of a clear vision, mission, and measurable strategic objectives for the planning period.\n- Identification of key growth opportunities, potential market expansion areas, or new product/service developments.\n- Assessment of resource requirements (financial, human, technological) and potential investments needed.\n- Creation of a high-level implementation roadmap with major phases and milestones.\n- Establishment of key performance indicators (KPIs) and a review process to track progress and adapt the strategy.",
    notes: "For guiding an organization's direction and long-term growth.",
    category: "Business",
    suggestedTags: ["strategic planning", "business strategy", "long-term planning", "vision setting", "growth strategy"]
  },
  {
    curated_id: "curated_biz_change_mgmt_strat_43",
    title: "Change Management and Transformation Strategy",
    content: "Design a change management strategy for a significant organizational transformation initiative: {{description_of_transformation_e_g_digital_transformation_merger_restructuring}}. The organization is {{organization_description}} and the goals of the transformation are {{transformation_goals}}.\nThe strategy must address:\n- Assessing organizational readiness and capacity for this change. Identifying potential resistance points.\n- Identifying key stakeholders (groups and individuals) and developing a plan to engage change champions.\n- Developing clear and consistent communication plans tailored to different stakeholder groups throughout the change process.\n- Creating training and capability-building programs to equip employees with necessary skills and knowledge for the new state.\n- Establishing feedback mechanisms to monitor employee sentiment and adjust the change strategy as needed.\n- Defining success metrics for the change initiative and systems for monitoring adoption and impact.",
    notes: "For managing organizational evolution and ensuring successful transformation.",
    category: "Business",
    suggestedTags: ["change management", "organizational transformation", "leadership", "hr", "communication strategy"]
  }
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
