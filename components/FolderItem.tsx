
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Folder } from '../types';
import { FolderIcon, FolderPlusIcon, PencilIcon, TrashIcon, ChevronRightIcon, COMMON_BUTTON_FOCUS_CLASSES } from '../constants';

const FolderItem: React.FC<{ folder: Folder; level: number; onSelectFolder: (id: string | null | undefined) => void; currentFolderId?: string | null; allFolders: Folder[] }> = ({ folder, level, onSelectFolder, currentFolderId, allFolders }) => {
    const { prompts: allPrompts, onOpenModal } = useAppContext();
    const [isExpanded, setIsExpanded] = useState(false);

    const childFolders = allFolders.filter(f => f.parentId === folder.id).sort((a,b) => a.name.localeCompare(b.name));
    const promptsInThisFolderCount = allPrompts.filter(p => p.folderId === folder.id).length;
    const isSelected = currentFolderId === folder.id;

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };
    
    const handleFolderClick = () => {
        onSelectFolder(folder.id);
        if (childFolders.length > 0) {
           setIsExpanded(true); 
        }
    };

    return (
        <li>
            <div className="flex items-center group">
                <button
                    type="button"
                    onClick={handleToggleExpand}
                    disabled={childFolders.length === 0}
                    className={`p-1 rounded-md hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed ${COMMON_BUTTON_FOCUS_CLASSES}`}
                    aria-label={isExpanded ? `Collapse folder ${folder.name}` : `Expand folder ${folder.name}`}
                    aria-expanded={isExpanded}
                >
                    {childFolders.length > 0 ? (
                        <ChevronRightIcon className={`w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    ) : (
                        <span className="w-3.5 h-3.5 inline-block"></span> 
                    )}
                </button>
                <button
                    type="button"
                    onClick={handleFolderClick}
                    className={`flex-grow flex items-center justify-between text-left px-2 py-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}
                                ${isSelected ? 'bg-[var(--accent1)] bg-opacity-20 text-[var(--button-primary-text)] font-semibold' : 'text-[var(--text-primary)]'}
                                `}
                    style={{ paddingLeft: `${0.5 + (level * 0.75)}rem` }} 
                    aria-current={isSelected ? "page" : undefined}
                >
                    <span className="flex items-center truncate">
                        <FolderIcon className="w-4 h-4 mr-1.5" />
                        <span className="truncate" title={folder.name}>{folder.name}</span>
                    </span>
                    {isSelected && promptsInThisFolderCount > 0 && <span className="text-xs text-[var(--text-tertiary)]">({promptsInThisFolderCount})</span>}
                </button>
                 <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pr-1">
                     <button type="button" onClick={(e) => { e.stopPropagation(); onOpenModal('newFolder', { parentId: folder.id }); }} title={`New Folder in ${folder.name}`}
                        className={`p-1.5 text-[var(--accent1)] hover:bg-[var(--bg-secondary)] rounded-md ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                        <FolderPlusIcon className="w-3.5 h-3.5"/>
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onOpenModal('renameFolder', { folderToRename: folder }); }} title={`Rename ${folder.name}`}
                        className={`p-1.5 text-[var(--accent2)] hover:bg-[var(--bg-secondary)] rounded-md ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                        <PencilIcon className="w-3.5 h-3.5"/>
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onOpenModal('deleteFolderConfirm', { folderId: folder.id, folderName: folder.name }); }} title={`Delete ${folder.name}`}
                        className={`p-1.5 text-red-500 hover:bg-[var(--bg-secondary)] rounded-md ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                        <TrashIcon className="w-3.5 h-3.5"/>
                    </button>
                 </div>
            </div>
            {isExpanded && childFolders.length > 0 && (
                <ul className="pl-4 border-l border-[var(--border-color)] ml-[11px]"> 
                    {childFolders.map(child => <FolderItem key={child.id} folder={child} level={level + 1} onSelectFolder={onSelectFolder} currentFolderId={currentFolderId} allFolders={allFolders}/>)}
                </ul>
            )}
        </li>
    );
};

export default FolderItem;
