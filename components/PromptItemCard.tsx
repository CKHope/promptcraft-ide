
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Prompt } from '../types';
import { ClipboardIcon, KeyIcon, StarIconSolid, StarIconOutline, COMMON_BUTTON_FOCUS_CLASSES, YELLOW_BUTTON_FOCUS_CLASSES } from '../constants';

const PromptItemCard: React.FC<{ prompt: Prompt; onSelect: () => void }> = ({ prompt, onSelect }) => {
  const { tags: allTags, showToast, pinPrompt, unpinPrompt, pinnedPromptIds } = useAppContext(); 
  const promptTags = prompt.tags.map(tagId => allTags.find(t => t.id === tagId)?.name).filter(Boolean);
  const isPinned = pinnedPromptIds.includes(prompt.id); 

  const copyToClipboard = (e: React.MouseEvent, text: string, type: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    showToast(`${type} copied!`, 'success');
  };

  const handleTogglePin = (e: React.MouseEvent) => { 
    e.stopPropagation();
    if (isPinned) {
      unpinPrompt(prompt.id);
      showToast('Unpinned from dashboard', 'info');
    } else {
      pinPrompt(prompt.id);
      showToast('Pinned to dashboard', 'success');
    }
  };

  return (
    <article
      onClick={onSelect}
      aria-labelledby={`prompt-title-${prompt.id}`}
      className={`bg-[var(--bg-secondary)] p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border border-[var(--border-color)] hover:border-[var(--accent1)] ${COMMON_BUTTON_FOCUS_CLASSES}`} // Updated: card-style like properties
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
    >
      <div className="flex justify-between items-start mb-1.5">
        <h3 id={`prompt-title-${prompt.id}`} className="text-md font-semibold text-[var(--text-primary)] truncate flex-grow mr-2" title={prompt.title}>{prompt.title}</h3>
        <div className="flex space-x-1 flex-shrink-0">
             <button 
              type="button" 
              onClick={handleTogglePin} 
              className={`text-[var(--text-tertiary)] hover:text-[var(--accent-special)] p-1 rounded ${YELLOW_BUTTON_FOCUS_CLASSES}`} 
              aria-label={isPinned ? "Unpin prompt" : "Pin prompt"}
              aria-pressed={isPinned}
            >
              {isPinned ? <StarIconSolid className="w-4 h-4 text-[var(--accent-special)]" /> : <StarIconOutline className="w-4 h-4" />}
            </button>
            <button type="button" onClick={(e) => copyToClipboard(e, prompt.content, "Prompt content")} className={`text-[var(--text-tertiary)] hover:text-[var(--accent1)] p-1 rounded ${COMMON_BUTTON_FOCUS_CLASSES}`} aria-label="Copy prompt content">
              <ClipboardIcon className="w-4 h-4" />
            </button>
             <button type="button" onClick={(e) => copyToClipboard(e, prompt.id, "Prompt ID")} title="Copy Prompt ID" className={`text-[var(--text-tertiary)] hover:text-[var(--accent2)] p-1 rounded ${COMMON_BUTTON_FOCUS_CLASSES}`} aria-label="Copy prompt ID">
              <KeyIcon className="w-3.5 h-3.5" />
            </button>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-2.5 line-clamp-2" title={prompt.content}>{prompt.content}</p>
      {promptTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2" aria-label="Tags">
          {promptTags.map(tagName => (
            <span key={tagName} className="text-xs bg-[var(--accent1)] bg-opacity-20 text-[var(--button-primary-text)] px-2 py-0.5 rounded-full"> {/* Updated: text color */}
              #{tagName}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-[var(--text-tertiary)]">Updated: <time dateTime={prompt.updated_at}>{new Date(prompt.updated_at).toLocaleDateString()}</time></p>
    </article>
  );
};

export default PromptItemCard;