import React from 'react';

// Placeholder for diffLines function
export interface DiffChange { // Exporting for potential external use or testing
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number; 
}

export const diffLines = (oldStr: string, newStr: string): DiffChange[] => {
  console.warn("'diffLines' is using a placeholder implementation.");
  const changes: DiffChange[] = [];
  if (oldStr === newStr) {
    changes.push({ value: oldStr, count: oldStr.split('\n').length });
  } else {
    if (oldStr) {
      changes.push({ value: oldStr, removed: true, count: oldStr.split('\n').length });
    }
    if (newStr) {
      changes.push({ value: newStr, added: true, count: newStr.split('\n').length });
    }
  }
  return changes;
};

const DiffView: React.FC<{ text1: string, text2: string, type: string }> = ({ text1, text2, type }) => {
    const changes = diffLines(text1 || '', text2 || '');
    const hasMeaningfulChanges = changes.some(part => (part.added || part.removed) && part.value.trim() !== '');

    return (
        <div className="mb-4">
            <h4 className="text-md font-semibold text-[var(--text-primary)] mb-1.5">{type}:</h4>
             {hasMeaningfulChanges ? (
                <pre className="text-xs bg-[var(--bg-input-main)] p-3 rounded-md max-h-60 overflow-y-auto border border-[var(--border-color)]">
                    {changes.map((part, index) => {
                        let lineClass = 'diff-line';
                        let prefix = '  ';
                        if (part.added) {
                            lineClass += ' diff-added';
                            prefix = '+ ';
                        } else if (part.removed) {
                            lineClass += ' diff-removed';
                            prefix = '- ';
                        } else {
                            lineClass += ' diff-unchanged';
                        }
                        return <span key={index} className={lineClass}>{prefix}{part.value}</span>;
                    })}
                </pre>
             ) : (
                <p className="text-xs text-[var(--text-tertiary)] italic px-3 py-2 bg-[var(--bg-input-secondary-main)] rounded-md">No significant differences found between the two texts.</p>
             )}
        </div>
    );
};

export default DiffView;