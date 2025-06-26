
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import PromptItemCard from './PromptItemCard';
import { MagnifyingGlassIcon, INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES } from '../constants';

const PromptList: React.FC = () => {
  const { prompts, tags: allTags, setSelectedPrompt, isLoading, error, currentFolderId, folders, selectedTagIdForFiltering, setSelectedTagIdForFiltering } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

  useEffect(() => {
      if (selectedTagIdForFiltering && !activeTagFilters.includes(selectedTagIdForFiltering)) {
          setActiveTagFilters([selectedTagIdForFiltering]);
      } else if (selectedTagIdForFiltering === null && activeTagFilters.length > 0) {
          // Cleared from sidebar, clear local if desired. For now, it assumes sidebar drives single global filter or clears it.
      }
  }, [selectedTagIdForFiltering, activeTagFilters]);


  const furtherFilteredPrompts = prompts.filter(p => {
    const searchMatch = searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const tagMatch = activeTagFilters.length === 0 ||
      activeTagFilters.every(filterTagId => p.tags.includes(filterTagId));

    return searchMatch && tagMatch;
  });

  const toggleTagFilter = (tagId: string) => {
    const newFilters = activeTagFilters.includes(tagId)
      ? activeTagFilters.filter(id => id !== tagId)
      : [...activeTagFilters, tagId];
    setActiveTagFilters(newFilters);

    if (newFilters.length === 1) {
        setSelectedTagIdForFiltering(newFilters[0]);
    } else {
        setSelectedTagIdForFiltering(null); 
    }
  };

  const clearAllLocalFilters = () => {
      setActiveTagFilters([]);
      setSelectedTagIdForFiltering(null); 
  };


  const currentFolderName = currentFolderId === undefined
    ? "All Prompts" 
    : currentFolderId === null
      ? "Prompts (No Folder)"
      : folders.find(f => f.id === currentFolderId)?.name || "Folder";


  if (isLoading) return <div role="status" aria-live="polite" className="p-6 text-center text-sm text-[var(--text-tertiary)]">Loading prompts...</div>;
  if (error) return <div role="alert" className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6 flex-grow">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          {currentFolderName}
          {activeTagFilters.length === 1 && allTags.find(t => t.id === activeTagFilters[0]) &&
            <span className="text-base font-normal text-[var(--text-secondary)]"> (filtered by tag: "{allTags.find(t => t.id === activeTagFilters[0])?.name}")</span>
          }
           {activeTagFilters.length > 1 &&
            <span className="text-base font-normal text-[var(--text-secondary)]"> (filtered by multiple tags)</span>
          }
      </h2>
      
      <div className="command-palette-wrapper w-full relative group">
          <label htmlFor="search-prompts" className="sr-only">Search prompts</label>
          <div className="flex items-center gap-2 bg-[var(--bg-input-main)] border border-[var(--border-color)] rounded-lg p-1 focus-within:border-[var(--interactive-focus-ring)] transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5 ml-2 text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                  type="search"
                  id="search-prompts"
                  placeholder={`Search in ${currentFolderName}... (titles, content, notes)`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full bg-transparent text-[var(--text-primary)] outline-none p-2 placeholder-[var(--text-tertiary)] text-sm`}
              />
          </div>
      </div>

       {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center" role="group" aria-labelledby="filter-tags-label">
          <span id="filter-tags-label" className="text-sm font-medium text-[var(--text-secondary)]">Filter by tags:</span>
          {allTags.map(tag => (
            <button
              type="button"
              key={tag.id}
              onClick={() => toggleTagFilter(tag.id)}
              aria-pressed={activeTagFilters.includes(tag.id)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors
                ${activeTagFilters.includes(tag.id)
                  ? 'bg-[var(--accent1)] text-[var(--button-primary-text)] border-[var(--accent1)]'
                  : 'bg-[var(--bg-input-secondary-main)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--accent1)] hover:bg-opacity-20 hover:border-[var(--accent1)]'}
                  ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
              {tag.name}
            </button>
          ))}
           {activeTagFilters.length > 0 && (
             <button type="button" onClick={clearAllLocalFilters}
                className={`text-xs text-[var(--accent1)] hover:text-[var(--accent2)] hover:underline rounded ${COMMON_BUTTON_FOCUS_CLASSES}`}>Clear filters</button>
           )}
        </div>
      )}

      {furtherFilteredPrompts.length === 0 && !isLoading && (
        <p className="text-[var(--text-tertiary)] text-center py-8 text-sm">
          {prompts.length === 0 ? `No prompts in ${currentFolderName}. Click 'New Prompt' to get started!` : "No prompts match your current search or filter criteria."}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {furtherFilteredPrompts.map(prompt => (
          <PromptItemCard key={prompt.id} prompt={prompt} onSelect={() => setSelectedPrompt(prompt)} />
        ))}
      </div>
    </div>
  );
};

export default PromptList;
