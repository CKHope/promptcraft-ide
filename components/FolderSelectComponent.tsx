
import React from 'react';
import { Folder } from '../types';
import { INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES } from '../constants';

const FolderSelectComponent: React.FC<{ id: string; value: string | null; onChange: (folderId: string | null) => void; className?: string; folders: Folder[] }> = ({ id, value, onChange, className, folders }) => {
    const buildFolderOptions = (parentId: string | null, depth: number): JSX.Element[] => {
        return folders
            .filter(f => f.parentId === parentId)
            .sort((a,b) => a.name.localeCompare(b.name))
            .flatMap(folder => [
                <option key={folder.id} value={folder.id}>
                    {'\u00A0'.repeat(depth * 4) + folder.name}
                </option>,
                ...buildFolderOptions(folder.id, depth + 1)
            ]);
    };

    return (
        <select
            id={id}
            value={value === null ? "__root__" : value || "__root__"}
            onChange={(e) => onChange(e.target.value === "__root__" ? null : e.target.value)}
            className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES} ${className || ''}`}
        >
            <option value="__root__">(No Folder / Root)</option>
            {buildFolderOptions(null, 0)}
        </select>
    );
};

export default FolderSelectComponent;
