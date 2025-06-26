import React from 'react';
import { PlayIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon, COMMON_BUTTON_FOCUS_CLASSES } from '../constants';

interface ZenModeActionBarProps {
  isAbComparisonMode: boolean;
  onRunA: () => void;
  onRunB?: () => void; // Optional, only if A/B
  onRunBoth?: () => void; // Optional, only if A/B
  onSave: () => void;
  onToggleDetails: () => void;
  isDetailsVisible: boolean;
  onExitZenMode: () => void;
  isExecutingA: boolean;
  isExecutingB?: boolean;
  activeApiKey: boolean;
}

const FAB_BUTTON_BASE_CLASSES = "p-3 rounded-full shadow-xl transition-all duration-200 ease-in-out transform hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100";
const FAB_BUTTON_THEME_CLASSES = "bg-[var(--accent1)] hover:bg-[var(--accent2)] text-[var(--button-primary-text)]"; // Using accent for FABs

const ZenModeActionBar: React.FC<ZenModeActionBarProps> = ({
  isAbComparisonMode,
  onRunA,
  onRunB,
  onRunBoth,
  onSave,
  onToggleDetails,
  isDetailsVisible,
  onExitZenMode,
  isExecutingA,
  isExecutingB,
  activeApiKey,
}) => {

  const handleSmartRun = () => {
    if (isAbComparisonMode && onRunBoth) {
      onRunBoth();
    } else {
      onRunA();
    }
  };

  const isAnyExecuting = isAbComparisonMode ? (isExecutingA || (isExecutingB === true)) : isExecutingA;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-2 bg-[var(--bg-modal-main)] bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl"> {/* Updated rounded, bg */}
      <button
        type="button"
        onClick={handleSmartRun}
        disabled={isAnyExecuting || !activeApiKey}
        className={`${FAB_BUTTON_BASE_CLASSES} ${FAB_BUTTON_THEME_CLASSES} ${COMMON_BUTTON_FOCUS_CLASSES}`}
        title={isAbComparisonMode ? "Run Both Prompts (A & B)" : "Run Prompt A"}
        aria-label={isAbComparisonMode ? "Run Both Prompts" : "Run Prompt"}
      >
        <PlayIcon className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={onSave}
        className={`${FAB_BUTTON_BASE_CLASSES} ${FAB_BUTTON_THEME_CLASSES} ${COMMON_BUTTON_FOCUS_CLASSES}`}
        title="Save Changes"
        aria-label="Save Changes"
      >
        <CheckIcon className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={onToggleDetails}
        className={`${FAB_BUTTON_BASE_CLASSES} bg-[var(--bg-secondary)] hover:bg-[var(--bg-input-main)] text-[var(--text-primary)] ${COMMON_BUTTON_FOCUS_CLASSES}`} // Different style for toggle
        title={isDetailsVisible ? "Hide Prompt Details" : "Show Prompt Details"}
        aria-label={isDetailsVisible ? "Hide Prompt Details" : "Show Prompt Details"}
        aria-pressed={isDetailsVisible}
      >
        {isDetailsVisible ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
      </button>
      
      <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>

      <button
        type="button"
        onClick={onExitZenMode}
        className={`${FAB_BUTTON_BASE_CLASSES} bg-red-500 hover:bg-red-600 text-white ${COMMON_BUTTON_FOCUS_CLASSES}`} // Keep red for exit
        title="Exit Zen Mode"
        aria-label="Exit Zen Mode"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ZenModeActionBar;