import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import FolderItem from './FolderItem';
import TagsSidebarSection from './TagsSidebarSection';
// import * as geminiService from '../services/geminiService'; // No longer needed here
import { PlusIcon, FolderIcon, FolderPlusIcon, BookOpenIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, KeyIcon, ShareIcon, XMarkIcon, BoltIcon, COMMON_BUTTON_FOCUS_CLASSES, YELLOW_BUTTON_FOCUS_CLASSES } from '../constants'; 

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileSidebarOpen, toggleMobileSidebar }) => {
  const { 
    folders, 
    currentFolderId, 
    setCurrentFolderId, 
    setSelectedPrompt, 
    setSelectedTagIdForFiltering, 
    prompts: allPrompts, 
    onOpenModal,
    activeApiKey,
    // showToast, // No longer needed directly for AI gen
    // showGlobalLoader, // No longer needed directly for AI gen
    // hideGlobalLoader, // No longer needed directly for AI gen
    isGlobalLoading,
    aiGeneratePromptIdeaAndOpenModal // Use context function
  } = useAppContext();

  const handleSelectFolder = (folderId: string | null | undefined) => {
      setCurrentFolderId(folderId);
      setSelectedPrompt(null);
      setSelectedTagIdForFiltering(null); 
      if (isMobileSidebarOpen) { 
        toggleMobileSidebar();
      }
  };

  const handleActionClick = (action: () => void) => {
    action();
    if (isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  };

  const handleAiGenerateClick = () => {
    // aiGeneratePromptIdeaAndOpenModal already handles activeApiKey check and user feedback.
    aiGeneratePromptIdeaAndOpenModal();
    if (isMobileSidebarOpen) { // Close sidebar if mobile after initiating action
        toggleMobileSidebar();
    }
  };


  const rootFolders = folders.filter(f => f.parentId === null).sort((a,b) => a.name.localeCompare(b.name));
  const promptsWithoutFolderCount = allPrompts.filter(p => p.folderId === null || p.folderId === undefined).length;
  const allPromptsCount = allPrompts.length;

  return (
    <aside 
      className={`
        bg-[var(--bg-primary)] p-4 space-y-4 border-r border-[var(--border-color)] overflow-y-auto flex flex-col h-full 
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shrink-0 md:z-auto md:inset-auto md:transform-none md:transition-none md:shadow-none
      `}
      aria-hidden={!isMobileSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768} 
    >
      <div className="flex justify-between items-center md:hidden mb-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Menu</h2>
        <button 
          onClick={toggleMobileSidebar} 
          className={`p-2 rounded-full hover:bg-[var(--bg-secondary)] ${COMMON_BUTTON_FOCUS_CLASSES}`} 
          aria-label="Close menu"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAiGenerateClick}
          disabled={isGlobalLoading || !activeApiKey}
          className={`flex-shrink-0 p-2.5 bg-[var(--accent-special)] hover:bg-opacity-80 text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${YELLOW_BUTTON_FOCUS_CLASSES}`}
          title="AI Generate New Prompt Idea"
        >
          <BoltIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleActionClick(() => onOpenModal('smartStartChoice'))} 
          className={`flex-grow flex items-center justify-center space-x-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 ${COMMON_BUTTON_FOCUS_CLASSES}`}
          disabled={isGlobalLoading}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="text-sm">New Prompt</span>
        </button>
      </div>


      <nav aria-labelledby="folders-heading" className="flex-grow">
        <div className="flex justify-between items-center mb-1.5">
            <h3 id="folders-heading" className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Folders</h3>
            <button type="button" onClick={() => handleActionClick(() => onOpenModal('newFolder', { parentId: null }))} title="New Root Folder"
              className={`p-1.5 text-[var(--accent1)] hover:bg-[var(--bg-secondary)] rounded-md ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                <FolderPlusIcon className="w-4 h-4"/>
            </button>
        </div>
        <ul className="space-y-px text-sm">
            <li>
                <button
                    type="button"
                    onClick={() => handleSelectFolder(undefined)} 
                    className={`w-full flex items-center justify-between text-left px-2 py-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors
                                ${currentFolderId === undefined ? 'bg-[var(--accent1)] bg-opacity-20 text-[var(--button-primary-text)] font-semibold' : 'text-[var(--text-primary)]'}
                                ${COMMON_BUTTON_FOCUS_CLASSES}`}
                >
                    <span>All Prompts</span>
                    {currentFolderId === undefined && allPromptsCount > 0 && <span className="text-xs text-[var(--text-tertiary)]">({allPromptsCount})</span>}
                </button>
            </li>
             <li>
                <button
                    type="button"
                    onClick={() => handleSelectFolder(null)} 
                     className={`w-full flex items-center justify-between text-left px-2 py-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors
                                ${currentFolderId === null ? 'bg-[var(--accent1)] bg-opacity-20 text-[var(--button-primary-text)] font-semibold' : 'text-[var(--text-primary)]'}
                                ${COMMON_BUTTON_FOCUS_CLASSES}`}
                >
                    <span className="flex items-center"><FolderIcon className="w-4 h-4 mr-1.5 ml-[22px]"/> (No Folder)</span>
                    {currentFolderId === null && promptsWithoutFolderCount > 0 && <span className="text-xs text-[var(--text-tertiary)]">({promptsWithoutFolderCount})</span>}
                </button>
            </li>
            {rootFolders.map(folder => <FolderItem key={folder.id} folder={folder} level={0} onSelectFolder={handleSelectFolder} currentFolderId={currentFolderId} allFolders={folders}/>)}
        </ul>
        <TagsSidebarSection />
      </nav>

       <nav aria-labelledby="actions-heading" className="mt-auto pt-4 border-t border-[var(--border-color)]">
        <h3 id="actions-heading" className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Actions</h3>
        <div className="space-y-1">
            {[
                { label: "Prompt Library", icon: BookOpenIcon, action: () => onOpenModal('curatedLibrary') },
                { label: "Prompt Graph", icon: ShareIcon, action: () => onOpenModal('promptGraph') }, 
                { label: "Import Data", icon: ArrowUpTrayIcon, action: () => onOpenModal('import') },
                { label: "Export Data", icon: ArrowDownTrayIcon, action: () => onOpenModal('export') },
                { label: "Manage API Keys", icon: KeyIcon, action: () => onOpenModal('apiKeyManager') },
            ].map(item => (
                <button key={item.label} type="button" onClick={() => handleActionClick(item.action)} className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                    <item.icon className="w-4 h-4 text-[var(--accent1)]"/> <span>{item.label}</span>
                </button>
            ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
