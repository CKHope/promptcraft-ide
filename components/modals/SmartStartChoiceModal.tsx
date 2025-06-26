
import React from 'react';
import Modal from '../Modal';
import { ModalType } from '../../types';
import { PencilIcon, ArrowsRightLeftIcon, LinkIcon, BookOpenIcon, COMMON_BUTTON_FOCUS_CLASSES } from '../../constants';

interface SmartStartChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (type: ModalType, props?: any) => void;
}

const SmartStartChoiceModal: React.FC<SmartStartChoiceModalProps> = ({ isOpen, onClose, onOpenModal }) => {
  const choices = [
    { label: "Blank Prompt", description: "Start with a clean slate.", type: 'newPrompt', creationMode: 'blank', icon: PencilIcon },
    { label: "A/B Test Blueprint", description: "Set up two prompt variants for comparison.", type: 'newPrompt', creationMode: 'abTest', icon: ArrowsRightLeftIcon },
    { label: "New Orchestrator Prompt", description: "Design a multi-step prompt sequence.", type: 'visualChainBuilder', creationMode: 'chainBlueprint', icon: LinkIcon }, // Changed label & type
    { label: "From Curated Library", description: "Browse and import pre-made prompts.", type: 'curatedLibrary', icon: BookOpenIcon },
  ];

  const handleSelectChoice = (choice: typeof choices[number]) => {
    onClose(); 
    if (choice.type === 'curatedLibrary') {
        onOpenModal('curatedLibrary');
    } else if (choice.type === 'visualChainBuilder') {
        // Directly open VisualChainBuilderModal with specific props for new chain creation
        onOpenModal('visualChainBuilder', { 
            currentContent: `This prompt will orchestrate several steps to achieve a goal.\n\nFirst, it will use the output of: {{promptOutput:STEP_1_PLACEHOLDER_ID}}\n\nThen, using the above output, it will: {{describe_next_action}}`, // Pre-fill template
            applyContentCallback: (newContent: string) => {
                // This callback would eventually be tied to creating a new prompt
                // For now, it's a placeholder if VisualChainBuilder directly creates the prompt
                // Or, it updates the content of a newly created (but not yet saved) orchestrator prompt
                console.log("VisualChainBuilder applyContentCallback for new chain:", newContent);
                // Ideally, this would trigger opening a new prompt in PromptEditor with this content
                // and the "Chained Prompt Blueprint" _initialEditorMode.
                // This part needs careful integration with how addPrompt and setSelectedPrompt work.
                // For this change, we focus on launching the modal.
                // A possible flow:
                // 1. SmartStartChoiceModal -> VisualChainBuilderModal
                // 2. VisualChainBuilderModal onApply -> creates a new prompt object (not yet in DB)
                // 3. Sets this new prompt object as selectedPrompt, with _initialEditorMode: 'chainBlueprint'
                // 4. PromptEditor then picks this up.
                // OR VisualChainBuilderModal onApply calls addPrompt directly.
                onOpenModal('newPrompt', { creationMode: 'chainBlueprint', initialContentFromBuilder: newContent });

            },
            isNewChainSetup: true // A flag to indicate this is for a new orchestrator prompt
        });
    }
     else { // newPrompt type
        onOpenModal('newPrompt', { creationMode: choice.creationMode });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Prompt" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {choices.map(choice => (
          <button
            key={choice.label}
            type="button"
            onClick={() => handleSelectChoice(choice)}
            className={`p-4 border rounded-xl hover:shadow-lg hover:border-[var(--accent1)] transition-all text-left space-y-1 bg-[var(--bg-secondary)] border-[var(--border-color)] ${COMMON_BUTTON_FOCUS_CLASSES}`} // Updated: rounded-xl
          >
            <div className="flex items-center gap-2">
              <choice.icon className="w-5 h-5 text-[var(--accent1)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">{choice.label}</h3>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">{choice.description}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default SmartStartChoiceModal;
