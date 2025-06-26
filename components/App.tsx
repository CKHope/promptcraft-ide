import React, { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';
import SmartStartDashboard from './SmartStartDashboard';
import PromptList from './PromptList';
import PromptEditor from './PromptEditor';
import { SparklesIcon, COMMON_BUTTON_FOCUS_CLASSES, ViewfinderCircleIcon, PlusIcon, BoltIcon, YELLOW_BUTTON_FOCUS_CLASSES } from '../constants';


const App: React.FC = () => {
  const { 
    selectedPrompt, 
    currentFolderId, 
    isZenMode, 
    setIsZenMode, 
    isPowerPaletteOpen, 
    setIsPowerPaletteOpen, 
    onOpenModal,
    aiGeneratePromptIdeaAndOpenModal, // Added
    isGlobalLoading, // Added
    activeApiKey // Added
  } = useAppContext();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsPowerPaletteOpen(prev => !prev);
      }
      if(event.key === 'Escape'){
        if (isPowerPaletteOpen) setIsPowerPaletteOpen(false);
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPowerPaletteOpen, setIsPowerPaletteOpen, isMobileSidebarOpen]);


  const showSmartStartInStandardMode = selectedPrompt === null && currentFolderId === undefined && !isZenMode;

  if (isZenMode) {
    return (
      <div className="flex flex-col h-screen antialiased text-[var(--text-primary)] bg-[var(--bg-app)] zen-mode-active">
        <main className="flex-1 overflow-y-auto bg-[var(--bg-app)] h-full">
          {selectedPrompt ? <PromptEditor key={selectedPrompt.id} prompt={selectedPrompt} /> : (
              <div className="p-6 text-center text-[var(--text-secondary)] h-full flex flex-col justify-center items-center space-y-5">
                  <SparklesIcon className="w-16 h-16 text-[var(--accent1)] opacity-70"/>
                  <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Zen Mode</h1>
                  <p className="text-sm max-w-md">
                    You're in a focused editing environment. Create a new prompt or let AI spark an idea for you. You can also switch to Standard View to browse your library.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
                     <button
                        onClick={aiGeneratePromptIdeaAndOpenModal}
                        disabled={isGlobalLoading || !activeApiKey}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent-special)] hover:bg-opacity-80 text-black font-semibold rounded-lg shadow-md transition-colors text-sm ${YELLOW_BUTTON_FOCUS_CLASSES} disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <BoltIcon className="w-5 h-5" /> AI Generate Prompt Idea
                      </button>
                    <button 
                      onClick={() => onOpenModal('smartStartChoice')}
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-md transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}
                    >
                      <PlusIcon className="w-5 h-5" /> Create New Manually
                    </button>
                  </div>
                  <button 
                      onClick={() => setIsZenMode(false)}
                       className={`mt-4 flex items-center justify-center gap-2 px-5 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-medium rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES}`}
                    >
                      <ViewfinderCircleIcon className="w-5 h-5" /> Switch to Standard View
                  </button>
              </div>
          )}
        </main>
      </div>
    );
  }

  // Standard Mode
  return (
    <div className={`flex flex-col h-screen antialiased text-[var(--text-primary)] bg-[var(--bg-app)]`}>
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isMobileSidebarOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
          {showSmartStartInStandardMode && <SmartStartDashboard />}
          {!showSmartStartInStandardMode && !selectedPrompt && <PromptList />}
          {selectedPrompt && <PromptEditor key={selectedPrompt.id} prompt={selectedPrompt} />}
        </main>
      </div>
      {isMobileSidebarOpen && (
        <div 
          onClick={toggleMobileSidebar} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden="true" 
        />
      )}
    </div>
  );
};

export default App;
