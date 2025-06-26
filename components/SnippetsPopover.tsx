
import React, { useRef, useEffect } from 'react';
import { Snippet } from '../types';
import { SAMPLE_SNIPPETS, COMMON_BUTTON_FOCUS_CLASSES, CodeBracketSquareIcon } from '../constants';

const SnippetsPopover: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippet: (content: string) => void;
  targetButtonRef: React.RefObject<HTMLButtonElement>;
}> = ({ isOpen, onClose, onSelectSnippet, targetButtonRef }) => {
  if (!isOpen) return null;

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          targetButtonRef.current && !targetButtonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, targetButtonRef]);
  
  const categorizedSnippets = SAMPLE_SNIPPETS.reduce((acc, snippet) => {
    const category = snippet.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(snippet);
    return acc;
  }, {} as Record<string, Snippet[]>);


  return (
    <div
      ref={popoverRef}
      className="absolute z-20 mt-1 w-72 max-h-80 overflow-y-auto bg-white dark:bg-slate-700 rounded-md shadow-lg border border-slate-200 dark:border-slate-600 p-2"
      style={{ top: targetButtonRef.current ? targetButtonRef.current.offsetTop + targetButtonRef.current.offsetHeight + 4 : 'auto', 
               left: targetButtonRef.current ? targetButtonRef.current.offsetLeft : 'auto' }}
    >
      {Object.entries(categorizedSnippets).map(([category, snippets]) => (
        <div key={category} className="mb-2">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 px-1">{category}</h4>
          <ul className="space-y-1">
            {snippets.map(snippet => (
              <li key={snippet.id}>
                <button
                  type="button"
                  onClick={() => { onSelectSnippet(snippet.content); onClose(); }}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 ${COMMON_BUTTON_FOCUS_CLASSES}`}
                >
                  {snippet.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SnippetsPopover;
