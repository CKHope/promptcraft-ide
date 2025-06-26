
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Prompt } from '../types';
import { PlusIcon, ArrowsRightLeftIcon, LinkIcon, BookOpenIcon, StarIconSolid, StarIconOutline, SparklesIcon, ChevronRightIcon, BoltIcon, COMMON_BUTTON_FOCUS_CLASSES, YELLOW_BUTTON_FOCUS_CLASSES } from '../constants';


const SmartStartDashboard: React.FC = () => {
  const { 
    prompts: allPrompts, 
    onOpenModal, 
    setSelectedPrompt, 
    pinnedPromptIds, 
    pinPrompt, 
    unpinPrompt,
    showToast,
    aiGeneratePromptIdeaAndOpenModal, 
    isGlobalLoading, 
    activeApiKey 
  } = useAppContext();

  const createChoices = [
    { label: "Blank Prompt", description: "Start with a clean slate.", creationMode: 'blank', modalType: 'newPrompt', icon: SparklesIcon },
    { label: "A/B Test Blueprint", description: "Set up two prompt variants.", creationMode: 'abTest', modalType: 'newPrompt', icon: ArrowsRightLeftIcon },
    { label: "Chained Prompt Blueprint", description: "Begin a multi-step sequence.", modalType: 'visualChainBuilder', creationMode: 'chainBlueprint', icon: LinkIcon },
    { label: "From Curated Library", description: "Browse pre-made prompts.", modalType: 'curatedLibrary', icon: BookOpenIcon },
  ];

  const handleCreateChoice = (creationMode?: 'blank' | 'abTest' | 'chainBlueprint', modalType?: 'curatedLibrary' | 'newPrompt' | 'smartStartChoice' | 'visualChainBuilder') => {
    if (modalType === 'curatedLibrary') {
      onOpenModal('curatedLibrary');
    } else if (modalType === 'visualChainBuilder' && creationMode === 'chainBlueprint') {
        onOpenModal('visualChainBuilder', { 
            currentContent: `This prompt will orchestrate several steps to achieve a goal.\n\nFirst, it will use the output of: {{promptOutput:STEP_1_PLACEHOLDER_ID}}\n\nThen, using the above output, it will: {{describe_next_action}}`,
            applyContentCallback: (newContent: string) => {
                onOpenModal('newPrompt', { creationMode: 'chainBlueprint', initialContentFromBuilder: newContent });
            },
            isNewChainSetup: true 
        });
    } else if (modalType === 'newPrompt' && creationMode) {
      onOpenModal('newPrompt', { creationMode });
    } else {
        onOpenModal('smartStartChoice');
    }
  };


  const favoritePrompts = React.useMemo(() => {
    return allPrompts
      .filter(p => pinnedPromptIds.includes(p.id))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }, [allPrompts, pinnedPromptIds]);

  const recentPrompts = React.useMemo(() => {
    return allPrompts
      .filter(p => !pinnedPromptIds.includes(p.id)) 
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [allPrompts, pinnedPromptIds]);

  const togglePin = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    if (pinnedPromptIds.includes(promptId)) {
      unpinPrompt(promptId);
      showToast('Unpinned from dashboard!', 'info');
    } else {
      pinPrompt(promptId);
      showToast('Pinned to dashboard!', 'success');
    }
  };
  
  const DashboardCard: React.FC<{prompt: Prompt, isFavorite?: boolean}> = ({ prompt, isFavorite }) => (
    <div 
        onClick={() => setSelectedPrompt(prompt)}
        className={`bg-[var(--bg-secondary)] p-3 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-[var(--border-color)] hover:border-[var(--accent1)] flex justify-between items-center ${COMMON_BUTTON_FOCUS_CLASSES}`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedPrompt(prompt); }}
        aria-label={`Open prompt: ${prompt.title}`}
    >
        <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate" title={prompt.title}>{prompt.title}</h4>
            <p className="text-xs text-[var(--text-tertiary)]">
                Updated: {new Date(prompt.updated_at).toLocaleDateString()}
            </p>
        </div>
        <button 
            type="button" 
            onClick={(e) => togglePin(e, prompt.id)}
            className={`p-1.5 rounded-full hover:bg-[var(--bg-input-main)] transition-colors ${YELLOW_BUTTON_FOCUS_CLASSES}`}
            title={isFavorite ? "Unpin from Dashboard" : "Pin to Dashboard"}
            aria-pressed={isFavorite}
        >
            {isFavorite ? <StarIconSolid className="w-4 h-4 text-[var(--accent-special)]" /> : <StarIconOutline className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--accent-special)]" />}
        </button>
    </div>
  );


  return (
    <div className="p-4 md:p-6 space-y-8 h-full overflow-y-auto">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Welcome to PromptCraft IDE</h2>
        <p className="text-sm text-[var(--text-secondary)]">Your space to create, manage, and test AI prompts.</p>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Create Something New</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
           <button
                onClick={aiGeneratePromptIdeaAndOpenModal}
                disabled={isGlobalLoading || !activeApiKey}
                className={`p-4 border rounded-xl hover:shadow-lg hover:border-[var(--accent-special)] transition-all text-left space-y-1.5 bg-[var(--accent-special)] bg-opacity-20 border-[var(--accent-special)] ${YELLOW_BUTTON_FOCUS_CLASSES} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
              <div className="flex items-center gap-2.5">
                <BoltIcon className="w-5 h-5 text-[var(--accent-special)]" />
                <h4 className="font-medium text-black opacity-80">AI Generate Prompt Idea</h4>
              </div>
              <p className="text-xs text-black opacity-60">Let AI spark your creativity and suggest a new prompt.</p>
            </button>
            <button
              onClick={() => onOpenModal('smartStartChoice')}
              className={`p-4 border rounded-xl hover:shadow-lg hover:border-[var(--accent1)] transition-all text-left space-y-1.5 bg-[var(--bg-secondary)] border-[var(--border-color)] ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
              <div className="flex items-center gap-2.5">
                <PlusIcon className="w-5 h-5 text-[var(--accent1)]" />
                <h4 className="font-medium text-[var(--text-primary)]">Create Manually</h4>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">Choose from blank, A/B test, chained, or library prompts.</p>
            </button>
        </div>
      </section>

      
      <section className="mt-6 pt-6 border-t border-[var(--border-color)]"> 
        <h3 className="text-md font-semibold text-[var(--text-primary)] mb-3 opacity-80">Or, choose a specific starting point:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {createChoices.map(choice => (
            <button
              key={choice.label}
              type="button"
              onClick={() => handleCreateChoice(choice.creationMode as any, choice.modalType as any)}
              className={`p-4 border rounded-xl hover:shadow-lg hover:border-[var(--accent1)] transition-all text-left space-y-1.5 bg-[var(--bg-secondary)] border-[var(--border-color)] ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
              <div className="flex items-center gap-2.5">
                <choice.icon className="w-5 h-5 text-[var(--accent1)]" />
                <h4 className="font-medium text-[var(--text-primary)] text-sm">{choice.label}</h4>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">{choice.description}</p>
            </button>
          ))}
        </div>
      </section>


      {favoritePrompts.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Favorite Prompts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoritePrompts.map(prompt => <DashboardCard key={prompt.id} prompt={prompt} isFavorite={true} />)}
          </div>
        </section>
      )}

      {recentPrompts.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Recent Prompts</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPrompts.map(prompt => <DashboardCard key={prompt.id} prompt={prompt} isFavorite={false} />)}
          </div>
        </section>
      )}
      
      {(favoritePrompts.length === 0 && recentPrompts.length === 0) && (
          <p className="text-center text-[var(--text-tertiary)] py-6 text-sm">
              No prompts yet. Click one of the "Create" options above to get started!
          </p>
      )}

      <section>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Discover</h3>
        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-secondary)]">
                Tip: Use <kbd className="px-2 py-1 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-input-main)] border border-[var(--border-color-strong)] rounded-md">{navigator.platform.toUpperCase().indexOf('MAC')>=0 ? 'Cmd' : 'Ctrl'} + K</kbd> to open the Power Palette for quick actions and search.
            </p>
             <button 
                onClick={() => onOpenModal('curatedLibrary')} 
                className={`mt-3 text-sm text-[var(--accent1)] hover:text-[var(--accent2)] flex items-center gap-1.5 ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
                Explore the Prompt Library <ChevronRightIcon className="w-4 h-4" />
            </button>
        </div>
      </section>

    </div>
  );
};

export default SmartStartDashboard;
