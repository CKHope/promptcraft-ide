
import React, { useState, useMemo } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import { CuratedPrompt } from '../../types';
import { INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES, CURATED_PROMPT_CATEGORIES, SAMPLE_CURATED_PROMPTS, PROMPT_OUTPUT_REGEX, MagnifyingGlassIcon } from '../../constants';

interface CuratedLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CuratedLibraryModal: React.FC<CuratedLibraryModalProps> = ({ isOpen, onClose }) => {
    const { addPrompt, showToast, currentFolderId, getPromptById, loadData } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState<typeof CURATED_PROMPT_CATEGORIES[number] | "All">("All");
    const [librarySearchTerm, setLibrarySearchTerm] = useState('');

    const promptsToDisplay = useMemo(() => {
        let filteredByCategory = selectedCategory === "All"
            ? SAMPLE_CURATED_PROMPTS
            : SAMPLE_CURATED_PROMPTS.filter(p => p.category === selectedCategory);

        if (librarySearchTerm.trim() === '') {
            return filteredByCategory;
        }

        const lowerSearchTerm = librarySearchTerm.toLowerCase();
        return filteredByCategory.filter(p =>
            p.title.toLowerCase().includes(lowerSearchTerm) ||
            p.content.toLowerCase().includes(lowerSearchTerm) ||
            (p.notes && p.notes.toLowerCase().includes(lowerSearchTerm)) ||
            (p.category && p.category.toLowerCase().includes(lowerSearchTerm)) ||
            (p.suggestedTags && p.suggestedTags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
        );
    }, [selectedCategory, librarySearchTerm]);


    const importWithDependencies = async (
        curatedPromptToImport: CuratedPrompt,
        allProcessedIdsInThisOperation: Set<string>, 
        newlyAddedPromptsOutputArray: { id: string, title: string }[], 
        currentChainFolderId: string | null | undefined
    ): Promise<void> => {
        if (allProcessedIdsInThisOperation.has(curatedPromptToImport.curated_id)) {
            return; 
        }
        allProcessedIdsInThisOperation.add(curatedPromptToImport.curated_id);

        const existingPrompt = await getPromptById(curatedPromptToImport.curated_id);

        if (!existingPrompt) {
            const newPrompt = await addPrompt({ 
                id: curatedPromptToImport.curated_id, 
                title: curatedPromptToImport.title,
                content: curatedPromptToImport.content,
                notes: curatedPromptToImport.notes,
                tagNames: curatedPromptToImport.suggestedTags || [],
                folderId: currentChainFolderId,
            });
            if (newPrompt) {
                newlyAddedPromptsOutputArray.push({ id: newPrompt.id, title: newPrompt.title });
            }
        }
        
        PROMPT_OUTPUT_REGEX.lastIndex = 0;
        let match;
        const dependenciesToImport: CuratedPrompt[] = [];
        while ((match = PROMPT_OUTPUT_REGEX.exec(curatedPromptToImport.content)) !== null) {
            const dependentCuratedId = match[1];
            if (!allProcessedIdsInThisOperation.has(dependentCuratedId)) {
                const dependentCuratedPrompt = SAMPLE_CURATED_PROMPTS.find(p => p.curated_id === dependentCuratedId);
                if (dependentCuratedPrompt) {
                    dependenciesToImport.push(dependentCuratedPrompt);
                }
            }
        }

        for (const dep of dependenciesToImport) {
            await importWithDependencies(dep, allProcessedIdsInThisOperation, newlyAddedPromptsOutputArray, currentChainFolderId);
        }
    };


    const handleImportCuratedPrompt = async (masterCuratedPrompt: CuratedPrompt) => {
        const allProcessedIdsDuringOperation = new Set<string>();
        const newlyAddedPromptsInfo: { id: string, title: string }[] = [];
        const targetFolderId = currentFolderId === undefined ? null : currentFolderId;

        await importWithDependencies(masterCuratedPrompt, allProcessedIdsDuringOperation, newlyAddedPromptsInfo, targetFolderId);

        const masterTitle = masterCuratedPrompt.title;
        const masterWasProcessed = allProcessedIdsDuringOperation.has(masterCuratedPrompt.curated_id);
        const masterWasNewlyAdded = newlyAddedPromptsInfo.some(p => p.id === masterCuratedPrompt.curated_id);
        
        const newlyAddedDependenciesCount = newlyAddedPromptsInfo.filter(p => p.id !== masterCuratedPrompt.curated_id).length;

        if (!masterWasProcessed) {
            showToast(`Error processing import for "${masterTitle}". Prompt not found in curated list.`, 'error');
            return;
        }

        if (newlyAddedPromptsInfo.length === 0) { 
            showToast(`"${masterTitle}" and its ${allProcessedIdsDuringOperation.size > 1 ? 'dependencies are' : 'is'} already in your library.`, 'info');
        } else if (masterWasNewlyAdded) {
            if (newlyAddedDependenciesCount > 0) {
                showToast(`"${masterTitle}" and ${newlyAddedDependenciesCount} related prompt(s) imported!`, 'success');
            } else { 
                 const totalDependenciesProcessed = allProcessedIdsDuringOperation.size - 1; 
                 if (totalDependenciesProcessed > 0) {
                    showToast(`"${masterTitle}" imported successfully! Its ${totalDependenciesProcessed} ${totalDependenciesProcessed === 1 ? 'dependency is' : 'dependencies are'} already in your library.`, 'success');
                 } else {
                    showToast(`"${masterTitle}" imported successfully!`, 'success');
                 }
            }
        } else { 
            if (newlyAddedDependenciesCount > 0) {
                showToast(`"${masterTitle}" (already in library) and ${newlyAddedDependenciesCount} related prompt(s) imported!`, 'success');
            } else {
                showToast(`"${masterTitle}" and its dependencies are already in your library or were updated.`, 'info');
            }
        }
        
        await loadData(currentFolderId); 
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Curated Prompt Library" size="xl">
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                    <label htmlFor="categoryFilter" className="sr-only">Filter by category</label>
                    <select
                        id="categoryFilter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                        className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES} w-full sm:w-auto`}
                    >
                        <option value="All">All Categories</option>
                        {CURATED_PROMPT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="relative flex-grow">
                    <label htmlFor="librarySearch" className="sr-only">Search library</label>
                    <input
                        type="search"
                        id="librarySearch"
                        placeholder="Search library by keyword, title, content..."
                        value={librarySearchTerm}
                        onChange={(e) => setLibrarySearchTerm(e.target.value)}
                        className={`${INPUT_BASE_CLASSES} pl-10 pr-4 py-2 w-full ${INPUT_FOCUS_CLASSES}`}
                    />
                    <MagnifyingGlassIcon aria-hidden="true" className="w-5 h-5 text-[var(--text-tertiary)] absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>
            {promptsToDisplay.length === 0 && <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                {librarySearchTerm ? 'No prompts match your search.' : 'No prompts in this category.'}
            </p>}
            <ul className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                {promptsToDisplay.map(prompt => (
                    <li key={prompt.curated_id} className="p-4 bg-[var(--bg-input-secondary-main)] rounded-lg shadow">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-md font-semibold text-[var(--text-primary)]">{prompt.title}</h3>
                            <button
                                onClick={() => handleImportCuratedPrompt(prompt)}
                                className={`text-xs px-3 py-1.5 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}
                            >
                                Import
                            </button>
                        </div>
                        {prompt.category && <p className="text-xs text-[var(--accent1)] mb-1.5">{prompt.category}</p>}
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 my-1.5">{prompt.content}</p>
                        {prompt.notes && <p className="text-xs text-[var(--text-tertiary)] italic mt-1 line-clamp-1">Notes: {prompt.notes}</p>}
                        {prompt.suggestedTags && prompt.suggestedTags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {prompt.suggestedTags.map(tag => (
                                    <span key={tag} className="text-xs bg-[var(--bg-input-main)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </Modal>
    );
};

export default CuratedLibraryModal;
