
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeProps } from 'react-markdown/lib/ast-to-react'; // Import CodeProps
import { Prompt, ModelConfig, ExecutionPreset, LinkedOutput, ResultLabel, ModalType } from '../types';
import SnippetsPopover from './SnippetsPopover';
import {
    INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES, YELLOW_BUTTON_FOCUS_CLASSES,
    AVAILABLE_MODELS, DEFAULT_MODEL_CONFIG, PARAMETER_TOOLTIPS, PROMPT_OUTPUT_REGEX,
    PlayIcon, ClipboardIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, LinkIcon,
    CodeBracketSquareIcon, BookmarkSquareIcon, InformationCircleIcon,
    ChevronUpIcon, ChevronDownIcon, ChevronRightIcon, SparklesIcon,
    HandThumbUpIcon, HandThumbDownIcon, StarIconOutline, StarIconSolid
} from '../constants';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

// Helper to extract variable names and their optional default values
const getVariablesAndDefaults = (content: string): Record<string, string> => {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*(?:\|\s*(.*?)\s*)?}}/g;
  const vars: Record<string, string> = {};
  let match;
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1];
    if (varName && !varName.startsWith('promptOutput:')) {
      if (!(varName in vars)) {
         vars[varName] = match[2]?.trim() || '';
      }
    }
  }
  return vars;
};

// Helper to extract unique variable names only
const extractVariableNames = (content: string): string[] => {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*(?:\|.*?)?}}/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1] && !match[1].startsWith('promptOutput:')) {
      matches.add(match[1]);
    }
  }
  return Array.from(matches);
};

const copyResultAsMarkdown = (resultText: string | null, sideLabel: string, showToast: (message: string, type?: 'success' | 'error' | 'info') => void) => {
    if (resultText === null) {
        showToast(`No result for ${sideLabel} to copy.`, 'info');
        return;
    }
    const markdownResult = "```\n" + resultText + "\n```";
    navigator.clipboard.writeText(markdownResult);
    showToast(`Result for ${sideLabel} copied as Markdown!`, 'success');
};


interface ExecutionBlockProps {
  idPrefix: string;
  titleLabel: string;
  promptId: string;

  contentVal: string;
  setContentVal: (val: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  contentHistory: string[];
  currentHistoryIndex: number;
  handleUndoContent: () => void;
  handleRedoContent: () => void;
  addContentToHist: () => void;

  detectedVars: string[];
  currentVarValues: Record<string, string>;
  onVarChange: (varName: string, value: string) => void;
  variableWarnings: string[];
  // isAutoFillingVal: boolean; // To be removed, use isGlobalLoading from context
  onAutoFillVariables: () => void;

  currentLinkedOutputs: LinkedOutput[];
  navigateToLinkedPrompt: (outputId: string) => void;

  selectedModelVal: string;
  setSelectedModelVal: (val: string) => void;
  modelConfigVal: ModelConfig;
  onModelConfigChange: (field: keyof ModelConfig, value: string | number) => void;
  showConfig: boolean;
  toggleShowConfig: () => void;
  currentPresetIdVal: string | null;
  onPresetChange: (presetId: string) => void;
  executionPresets: ExecutionPreset[];

  isExecutingVal: boolean; // Keep this for button label changes
  executionResultVal: string | null;
  executionErrorVal: string | null;
  handleRun: () => void;
  activeApiKey: boolean;

  currentResultLabel: ResultLabel | null;
  onToggleResultLabel: (label: ResultLabel) => void;

  showSnippets: boolean;
  setShowSnippets: (show: boolean) => void;
  snippetsButtonRef: React.RefObject<HTMLButtonElement>;
  handleInsertSnippet: (snippetContent: string) => void;

  isAbComparisonMode: boolean;
  isZenMode: boolean;

  onOpenModal: (type: ModalType, props?: any) => void;
  copyToClipboard: (text: string, fieldName: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ExecutionBlock: React.FC<ExecutionBlockProps> = ({
  idPrefix,
  titleLabel,
  promptId,
  contentVal,
  setContentVal,
  textareaRef,
  contentHistory,
  currentHistoryIndex,
  handleUndoContent,
  handleRedoContent,
  addContentToHist,
  detectedVars,
  currentVarValues,
  onVarChange,
  variableWarnings,
  // isAutoFillingVal, // Removed
  onAutoFillVariables,
  currentLinkedOutputs,
  navigateToLinkedPrompt,
  selectedModelVal,
  setSelectedModelVal,
  modelConfigVal,
  onModelConfigChange,
  showConfig,
  toggleShowConfig,
  currentPresetIdVal,
  onPresetChange,
  executionPresets,
  isExecutingVal, // Keep for button label "Executing..."
  executionResultVal,
  executionErrorVal,
  handleRun,
  activeApiKey,
  currentResultLabel,
  onToggleResultLabel,
  showSnippets,
  setShowSnippets,
  snippetsButtonRef,
  handleInsertSnippet,
  isAbComparisonMode,
  isZenMode,
  onOpenModal,
  copyToClipboard,
  showToast,
}) => {
  const { isGlobalLoading } = useAppContext(); // Get global loading state
  const currentContentVarsAndDefaults = getVariablesAndDefaults(contentVal);

  return (
    <div className={`space-y-4 p-4 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] shadow-lg ${isZenMode ? 'flex-grow flex flex-col' : ''}`}>
        <h3 className="text-md font-semibold text-[var(--accent1)]">{titleLabel}</h3>
        <div className={isZenMode ? 'flex-grow flex flex-col' : ''}>
            <div className="flex justify-between items-center mb-1">
                 <label htmlFor={`${idPrefix}Content`} className="block text-sm font-medium text-[var(--text-primary)]">Content</label>
                 <div className="flex items-center gap-1.5 sm:gap-2">
                     <button type="button" onClick={handleUndoContent} disabled={currentHistoryIndex <= 0} className={`p-1 rounded text-[var(--text-secondary)] hover:text-[var(--accent1)] disabled:opacity-50 ${COMMON_BUTTON_FOCUS_CLASSES}`} title="Undo Content Change (Session)"><ArrowUturnLeftIcon className="w-3.5 h-3.5"/></button>
                     <button type="button" onClick={handleRedoContent} disabled={currentHistoryIndex >= contentHistory.length - 1} className={`p-1 rounded text-[var(--text-secondary)] hover:text-[var(--accent1)] disabled:opacity-50 ${COMMON_BUTTON_FOCUS_CLASSES}`} title="Redo Content Change (Session)"><ArrowUturnRightIcon className="w-3.5 h-3.5"/></button>
                     <button type="button" ref={snippetsButtonRef} onClick={() => setShowSnippets(!showSnippets)} className={`relative text-xs text-[var(--accent1)] hover:underline flex items-center gap-1 rounded ${COMMON_BUTTON_FOCUS_CLASSES}`} title="Insert Snippet">
                        <CodeBracketSquareIcon className="w-4 h-4"/> Snippets
                     </button>
                     {showSnippets && (
                        <SnippetsPopover 
                            isOpen={showSnippets} 
                            onClose={() => setShowSnippets(false)}
                            onSelectSnippet={(snippet) => handleInsertSnippet(snippet)}
                            targetButtonRef={snippetsButtonRef}
                        />
                     )}
                     <button
                        type="button"
                        onClick={() => onOpenModal('visualChainBuilder', {currentContent: contentVal, applyContentCallback: setContentVal, promptIdToExclude: promptId})}
                        className={`text-xs text-[var(--accent2)] hover:underline flex items-center gap-1 rounded ${COMMON_BUTTON_FOCUS_CLASSES}`}
                        title="Build/Insert Prompt Chain"
                      >
                       <LinkIcon className="w-3.5 h-3.5"/> Chain
                     </button>
                     <button type="button" onClick={() => copyToClipboard(contentVal, titleLabel + " Content")} className={`text-xs text-[var(--accent1)] hover:underline flex items-center gap-0.5 rounded ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                        <ClipboardIcon className="w-3 h-3"/> Copy
                     </button>
                 </div>
            </div>
          <textarea id={`${idPrefix}Content`} value={contentVal} 
            ref={textareaRef}
            onChange={(e) => setContentVal(e.target.value)}
            onBlur={addContentToHist}
            rows={isAbComparisonMode ? (isZenMode ? 10 : 6) : (isZenMode ? 15 : 8) }
            className={`${INPUT_BASE_CLASSES} px-3 py-2 resize-y ${INPUT_FOCUS_CLASSES} ${isZenMode ? 'flex-grow' : ''}`} />
        </div>

        {(detectedVars.length > 0 || currentLinkedOutputs.length > 0) && (
            <div className="space-y-3 p-3 bg-[var(--bg-input-secondary-main)] rounded-lg">
                {detectedVars.length > 0 && (
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1.5">
                            <h4 className="text-sm font-medium text-[var(--text-primary)]">Variables for {titleLabel}:</h4>
                            <button
                                type="button"
                                onClick={onAutoFillVariables}
                                disabled={isGlobalLoading || !activeApiKey}
                                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--accent-special)] text-black hover:bg-opacity-80 transition-colors disabled:opacity-50 ${YELLOW_BUTTON_FOCUS_CLASSES}`}
                                title="Auto-fill variables with sample values using AI"
                            >
                                <SparklesIcon className="w-3.5 h-3.5" />
                                Auto-fill
                            </button>
                        </div>
                        <ul className="space-y-2 text-xs">
                          {detectedVars.map(varName => (
                            <li key={varName} 
                                className="p-2 bg-[var(--bg-input-main)] rounded-md shadow-sm flex flex-col sm:flex-row sm:items-center gap-2 group"
                            >
                                <label 
                                    htmlFor={`${idPrefix}Var-${varName}`}
                                    className="text-xs text-[var(--accent1)] group-hover:text-[var(--accent2)] sm:w-1/3 cursor-text whitespace-nowrap overflow-hidden text-ellipsis"
                                    title={`Variable: ${varName}${currentContentVarsAndDefaults[varName] ? ' | Default: ' + currentContentVarsAndDefaults[varName] : ''}`}
                                >
                                  {`{{${varName}${currentContentVarsAndDefaults[varName] ? ` | ${currentContentVarsAndDefaults[varName]}` : ''}}}`}
                                </label>
                                <input
                                    type="text"
                                    id={`${idPrefix}Var-${varName}`}
                                    value={currentVarValues[varName] || ''}
                                    onChange={(e) => onVarChange(varName, e.target.value)}
                                    placeholder={currentContentVarsAndDefaults[varName] || 'Enter value...'}
                                    className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs flex-grow ${INPUT_FOCUS_CLASSES}`}
                                />
                            </li>
                          ))}
                        </ul>
                        {variableWarnings.length > 0 && (
                            <div className="mt-2 space-y-0.5">
                                {variableWarnings.map((warning, idx) => (
                                    <p key={idx} className="text-xs text-yellow-500">{warning}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                 {currentLinkedOutputs.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1.5">Linked Prompt Outputs:</h4>
                        <ul className="space-y-1.5 text-xs">
                            {currentLinkedOutputs.map(output => (
                                <li key={output.id + output.fullPlaceholder} 
                                    className="p-2 bg-[var(--bg-input-main)] rounded-md shadow-sm flex justify-between items-center group cursor-pointer hover:bg-[var(--accent2)] hover:bg-opacity-20"
                                    onClick={() => navigateToLinkedPrompt(output.id)}
                                    title={`Click to navigate. Output of: "${output.title}"`}
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateToLinkedPrompt(output.id);}}
                                >
                                    <div>
                                        <code className="text-[var(--accent1)] group-hover:text-[var(--accent2)]">{output.fullPlaceholder}</code>
                                        <span className="text-[var(--text-tertiary)] mx-1">-&gt;</span>
                                        <span className="italic group-hover:text-[var(--text-secondary)]" title={output.title}>{output.title}</span>
                                    </div>
                                    <ChevronRightIcon className="w-3.5 h-3.5 text-[var(--accent1)] group-hover:text-[var(--accent2)]"/>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}
        
        <div className="space-y-3 p-3 bg-[var(--bg-input-secondary-main)] rounded-lg">
            <button type="button" onClick={toggleShowConfig} className={`w-full flex justify-between items-center text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-input-main)] p-2 rounded ${COMMON_BUTTON_FOCUS_CLASSES}`}>
                <span>Model Configuration</span>
                {showConfig ? <ChevronUpIcon className="w-4 h-4"/> : <ChevronDownIcon className="w-4 h-4"/>}
            </button>
            {showConfig && (
                <div className="mt-2 space-y-3">
                    <div>
                        <label htmlFor={`${idPrefix}Model`} className="block text-xs font-medium text-[var(--text-secondary)] mb-0.5">Model</label>
                        <select id={`${idPrefix}Model`} value={selectedModelVal} onChange={(e) => setSelectedModelVal(e.target.value)}
                            className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs ${INPUT_FOCUS_CLASSES}`}>
                            {AVAILABLE_MODELS.map(model => (<option key={model.id} value={model.id}>{model.name}</option>))}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                             <label htmlFor={`${idPrefix}Preset`} className="block text-xs font-medium text-[var(--text-secondary)] mb-0.5">Load Preset</label>
                             <select id={`${idPrefix}Preset`} value={currentPresetIdVal || ""} onChange={(e) => onPresetChange(e.target.value)}
                                className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs ${INPUT_FOCUS_CLASSES}`}>
                                <option value="">-- None --</option>
                                {executionPresets.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                             </select>
                        </div>
                        <button type="button" onClick={() => onOpenModal('savePreset', { modelConfigToSave: modelConfigVal, forSide: titleLabel.includes("A") ? 'A' : 'B' })} title="Save current configuration as new preset"
                            className={`p-1.5 bg-[var(--accent-special)] hover:bg-opacity-80 text-[var(--dark-text-strong)] rounded ${YELLOW_BUTTON_FOCUS_CLASSES}`}><BookmarkSquareIcon className="w-4 h-4"/></button>
                    </div>

                    <div>
                        <label htmlFor={`${idPrefix}SystemInstruction`} className="flex items-center text-xs font-medium text-[var(--text-secondary)] mb-0.5">
                            System Instruction (Optional)
                            <InformationCircleIcon className="w-3 h-3 ml-1 text-[var(--text-tertiary)]" title={PARAMETER_TOOLTIPS.systemInstruction} />
                        </label>
                        <textarea id={`${idPrefix}SystemInstruction`} value={modelConfigVal.systemInstruction || ''} onChange={(e) => onModelConfigChange('systemInstruction', e.target.value)} rows={isZenMode ? 3 : 2}
                            className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs resize-y ${INPUT_FOCUS_CLASSES}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label htmlFor={`${idPrefix}Temperature`} className="flex items-center text-xs font-medium text-[var(--text-secondary)] mb-0.5">
                                Temp. <InformationCircleIcon className="w-3 h-3 ml-1 text-[var(--text-tertiary)]" title={PARAMETER_TOOLTIPS.temperature} />
                            </label>
                            <input type="number" id={`${idPrefix}Temperature`} value={modelConfigVal.temperature ?? ''} onChange={(e) => onModelConfigChange('temperature', e.target.value)} step={0.01} min={0} max={2} placeholder={DEFAULT_MODEL_CONFIG.temperature?.toString()}
                                className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs ${INPUT_FOCUS_CLASSES}`} />
                        </div>
                        <div>
                            <label htmlFor={`${idPrefix}TopP`} className="flex items-center text-xs font-medium text-[var(--text-secondary)] mb-0.5">
                                Top P <InformationCircleIcon className="w-3 h-3 ml-1 text-[var(--text-tertiary)]" title={PARAMETER_TOOLTIPS.topP} />
                            </label>
                            <input type="number" id={`${idPrefix}TopP`} value={modelConfigVal.topP ?? ''} onChange={(e) => onModelConfigChange('topP', e.target.value)} step={0.01} min={0} max={1} placeholder={DEFAULT_MODEL_CONFIG.topP?.toString()}
                                className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs ${INPUT_FOCUS_CLASSES}`} />
                        </div>
                        <div>
                            <label htmlFor={`${idPrefix}TopK`} className="flex items-center text-xs font-medium text-[var(--text-secondary)] mb-0.5">
                                Top K <InformationCircleIcon className="w-3 h-3 ml-1 text-[var(--text-tertiary)]" title={PARAMETER_TOOLTIPS.topK} />
                            </label>
                            <input type="number" id={`${idPrefix}TopK`} value={modelConfigVal.topK ?? ''} onChange={(e) => onModelConfigChange('topK', e.target.value)} step={1} min={1} placeholder={DEFAULT_MODEL_CONFIG.topK?.toString()}
                                className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs ${INPUT_FOCUS_CLASSES}`} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor={`${idPrefix}ResponseMimeType`} className="flex items-center text-xs font-medium text-[var(--text-secondary)] mb-0.5">
                            Response Format <InformationCircleIcon className="w-3 h-3 ml-1 text-[var(--text-tertiary)]" title={PARAMETER_TOOLTIPS.responseMimeType} />
                        </label>
                        <select 
                            id={`${idPrefix}ResponseMimeType`} 
                            value={modelConfigVal.responseMimeType || "text/plain"} 
                            onChange={(e) => onModelConfigChange('responseMimeType', e.target.value)}
                            className={`${INPUT_BASE_CLASSES} px-2 py-1 text-xs ${INPUT_FOCUS_CLASSES}`}
                        >
                            <option value="text/plain">Text</option>
                            <option value="application/json">JSON</option>
                        </select>
                    </div>
                </div>
            )}
        </div>

        <button
            type="button"
            onClick={handleRun}
            disabled={isGlobalLoading || !activeApiKey}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${COMMON_BUTTON_FOCUS_CLASSES} ${isZenMode ? 'hidden' : ''}`}
        >
            <PlayIcon className="w-4 h-4"/>
            {isExecutingVal ? 'Executing...' : `Run ${titleLabel}`}
        </button>

        {executionResultVal && (
            <div aria-live="polite" className="mt-3 p-3 bg-[var(--bg-input-secondary-main)] rounded-lg shadow">
                <div className="flex justify-between items-center mb-1.5">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">Result ({titleLabel}):</h4>
                    <div className="flex gap-1.5">
                        <button 
                            onClick={() => copyResultAsMarkdown(executionResultVal, titleLabel, showToast)} 
                            title="Copy result as Markdown" 
                            className={`${COMMON_BUTTON_FOCUS_CLASSES} p-1 rounded-full hover:bg-[var(--bg-input-main)]`}
                        >
                            <ClipboardIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        </button>
                        <button onClick={() => onToggleResultLabel('good')} title="Mark as Good" className={`${COMMON_BUTTON_FOCUS_CLASSES} p-1 rounded-full ${currentResultLabel === 'good' ? 'bg-green-500 bg-opacity-20' : 'hover:bg-[var(--bg-input-main)]'}`}>
                            <HandThumbUpIcon className={`w-3.5 h-3.5 ${currentResultLabel === 'good' ? 'text-green-400' : 'text-[var(--text-tertiary)]'}`} />
                        </button>
                        <button onClick={() => onToggleResultLabel('bad')} title="Mark as Bad" className={`${COMMON_BUTTON_FOCUS_CLASSES} p-1 rounded-full ${currentResultLabel === 'bad' ? 'bg-red-500 bg-opacity-20' : 'hover:bg-[var(--bg-input-main)]'}`}>
                            <HandThumbDownIcon className={`w-3.5 h-3.5 ${currentResultLabel === 'bad' ? 'text-red-400' : 'text-[var(--text-tertiary)]'}`} />
                        </button>
                        <button onClick={() => onToggleResultLabel('star')} title="Mark as Starred" className={`${YELLOW_BUTTON_FOCUS_CLASSES} p-1 rounded-full ${currentResultLabel === 'star' ? 'bg-yellow-500 bg-opacity-20' : 'hover:bg-[var(--bg-input-main)]'}`}>
                            {currentResultLabel === 'star' ? 
                                <StarIconSolid className="w-3.5 h-3.5 text-[var(--accent-special)]" /> :
                                <StarIconOutline className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                            }
                        </button>
                    </div>
                </div>
                <div className="text-xs max-h-60 overflow-y-auto">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold my-1.5 text-[var(--text-primary)]" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold my-1.5 text-[var(--text-primary)]" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-semibold my-1 text-[var(--text-primary)]" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-sm font-semibold my-1 text-[var(--text-primary)]" {...props} />,
                            p: ({node, ...props}) => <p className="my-1 text-[var(--text-secondary)]" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside my-1 pl-3 text-[var(--text-secondary)]" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1 pl-3 text-[var(--text-secondary)]" {...props} />,
                            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="pl-2.5 italic border-l-2 border-[var(--border-color-strong)] my-1.5 text-[var(--text-tertiary)]" {...props} />,
                            code({ node, inline, className, children, ...props }: CodeProps) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline ? (
                                <pre className={`bg-[var(--bg-input-main)] p-2.5 rounded-md overflow-x-auto text-xs my-1.5 border border-[var(--border-color)] text-[var(--text-primary)] ${className || ''}`} {...props as React.HTMLAttributes<HTMLPreElement>}>
                                  <code className={match ? `language-${match[1]}` : undefined}>{String(children).replace(/\n$/, '')}</code>
                                </pre>
                              ) : (
                                <code className={`bg-[var(--bg-input-main)] px-1.5 py-0.5 rounded text-xs text-[var(--accent1)] ${className || ''}`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            table: ({node, ...props}) => <table className="table-auto w-full my-2 text-xs border-collapse border border-[var(--border-color-strong)]" {...props} />,
                            thead: ({node, ...props}) => <thead className="bg-[var(--bg-input-main)]" {...props} />,
                            th: ({node, ...props}) => <th className="border border-[var(--border-color-strong)] px-2 py-1 text-left text-[var(--text-primary)]" {...props} />,
                            td: ({node, ...props}) => <td className="border border-[var(--border-color-strong)] px-2 py-1 text-[var(--text-secondary)]" {...props} />,
                        }}
                    >
                        {executionResultVal}
                    </ReactMarkdown>
                </div>
            </div>
        )}
        {executionErrorVal && (
            <div role="alert" className="mt-3 p-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg text-red-400 text-xs">
                <p className="font-semibold mb-0.5">Error ({titleLabel}):</p>
                <p>{executionErrorVal}</p>
            </div>
        )}
    </div>
  );
};
export default ExecutionBlock;