import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { COMMON_BUTTON_FOCUS_CLASSES } from '../constants';

const TagsSidebarSection: React.FC = () => {
    const { tags, selectedTagIdForFiltering, setSelectedTagIdForFiltering, setCurrentFolderId, setSelectedPrompt } = useAppContext();

    const handleSelectTag = (tagId: string) => {
        setSelectedTagIdForFiltering(tagId);
        setCurrentFolderId(undefined); 
        setSelectedPrompt(null);
    };

    if (tags.length === 0) return null;

    return (
        <nav aria-labelledby="tags-heading" className="mt-6">
            <h3 id="tags-heading" className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Filter by Tag</h3>
            <ul className="space-y-px text-sm">
                {tags.map(tag => (
                    <li key={tag.id}>
                        <button
                            type="button"
                            onClick={() => handleSelectTag(tag.id)}
                            className={`w-full flex items-center justify-between text-left px-2 py-2 text-xs rounded-md hover:bg-[var(--bg-secondary)] transition-colors
                                ${selectedTagIdForFiltering === tag.id ? 'bg-[var(--accent1)] bg-opacity-20 text-[var(--accent1)] font-medium' : 'text-[var(--text-primary)]'}
                                ${COMMON_BUTTON_FOCUS_CLASSES}`}
                        >
                            <span className="truncate">{tag.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default TagsSidebarSection;