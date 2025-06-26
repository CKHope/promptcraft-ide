import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { Prompt, Tag, Folder, PromptVersion } from '../types';
import { generateUUID } from '../constants';

// Generic error handler for Supabase operations
function handleSupabaseError(error: PostgrestError | null, context: string): void {
    if (error) {
        console.error(`Supabase error (${context}):`, error.message);
        // Potentially throw new Error(`Supabase error (${context}): ${error.message}`);
        // or use a global error reporting service
    }
}

// Prompts
export async function syncPromptToSupabase(
    supabase: SupabaseClient,
    prompt: Prompt
): Promise<Prompt | null> {
    if (!prompt.user_id) {
        console.warn("Prompt lacks user_id, cannot sync to Supabase:", prompt.title);
        return null;
    }
    const { id, user_id, title, content, notes, folderId, tags, firstSuccessfulResultText, created_at, updated_at } = prompt;
    const promptForSupabase = {
        id,
        user_id,
        title,
        content,
        notes: notes || null,
        folder_id: folderId || null,
        tags: tags || [], // Supabase expects array, even if empty
        first_successful_result_text: firstSuccessfulResultText || null,
        created_at: created_at || new Date().toISOString(),
        updated_at: updated_at || new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('prompts')
        .upsert(promptForSupabase, { onConflict: 'id' }) // Use upsert
        .select()
        .single();
    
    handleSupabaseError(error, `syncing prompt ${prompt.title}`);
    if (data) return { ...prompt, supabase_synced_at: new Date().toISOString() }; // Return local prompt with sync time
    return null;
}

export async function fetchPromptsFromSupabase(
    supabase: SupabaseClient,
    userId: string
): Promise<Prompt[]> {
    const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', userId);

    handleSupabaseError(error, 'fetching prompts');
    if (!data) return [];

    return data.map(p => ({
        id: p.id,
        user_id: p.user_id,
        title: p.title,
        content: p.content,
        notes: p.notes,
        tags: p.tags || [],
        folderId: p.folder_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
        firstSuccessfulResultText: p.first_successful_result_text,
        supabase_synced_at: p.updated_at, // Assume last sync was when it was last updated on server
    }));
}

// Tags
export async function syncTagToSupabase(
    supabase: SupabaseClient,
    tag: Tag
): Promise<Tag | null> {
    if (!tag.user_id) {
        console.warn("Tag lacks user_id, cannot sync to Supabase:", tag.name);
        return null;
    }
    const { id, user_id, name, created_at, updated_at } = tag;
    const tagForSupabase = { id, user_id, name, created_at, updated_at };

    const { data, error } = await supabase
        .from('tags')
        .upsert(tagForSupabase, { onConflict: 'id' }) // Unique constraint on (user_id, name) should be handled by DB
        .select()
        .single();
        
    handleSupabaseError(error, `syncing tag ${tag.name}`);
    if (data) return { ...tag, supabase_synced_at: new Date().toISOString() };
    return null;
}

export async function fetchTagsFromSupabase(
    supabase: SupabaseClient,
    userId: string
): Promise<Tag[]> {
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId);

    handleSupabaseError(error, 'fetching tags');
    if (!data) return [];
    return data.map(t => ({
        id: t.id,
        user_id: t.user_id,
        name: t.name,
        created_at: t.created_at,
        updated_at: t.updated_at,
        supabase_synced_at: t.updated_at,
    }));
}

// Folders
export async function syncFolderToSupabase(
    supabase: SupabaseClient,
    folder: Folder
): Promise<Folder | null> {
    if (!folder.user_id) {
        console.warn("Folder lacks user_id, cannot sync to Supabase:", folder.name);
        return null;
    }
    const { id, user_id, name, parentId, created_at, updated_at } = folder;
    const folderForSupabase = {
        id,
        user_id,
        name,
        parent_id: parentId || null,
        created_at,
        updated_at
    };
    
    const { data, error } = await supabase
        .from('folders')
        .upsert(folderForSupabase, { onConflict: 'id' })
        .select()
        .single();

    handleSupabaseError(error, `syncing folder ${folder.name}`);
    if (data) return { ...folder, supabase_synced_at: new Date().toISOString() };
    return null;
}

export async function fetchFoldersFromSupabase(
    supabase: SupabaseClient,
    userId: string
): Promise<Folder[]> {
    const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId);

    handleSupabaseError(error, 'fetching folders');
    if (!data) return [];
    return data.map(f => ({
        id: f.id,
        user_id: f.user_id,
        name: f.name,
        parentId: f.parent_id,
        created_at: f.created_at,
        updated_at: f.updated_at,
        supabase_synced_at: f.updated_at,
    }));
}

// Prompt Versions
export async function syncPromptVersionToSupabase(
    supabase: SupabaseClient,
    version: PromptVersion
): Promise<PromptVersion | null> {
    if (!version.user_id || !version.prompt_id) {
        console.warn("Prompt version lacks user_id or prompt_id, cannot sync:", version.id);
        return null;
    }
    const { id, prompt_id, user_id, content, notes, commitMessage, created_at } = version;
    const versionForSupabase = {
        id: id || generateUUID(), // Ensure ID exists
        prompt_id,
        user_id,
        content,
        notes: notes || null,
        commit_message: commitMessage || null,
        created_at: created_at || new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('prompt_versions')
        .upsert(versionForSupabase, { onConflict: 'id' })
        .select()
        .single();

    handleSupabaseError(error, `syncing prompt version ${version.id}`);
    if (data) return { ...version, id: data.id, supabase_synced_at: new Date().toISOString() };
    return null;
}

export async function fetchPromptVersionsFromSupabase(
    supabase: SupabaseClient,
    promptId: string,
    userId: string
): Promise<PromptVersion[]> {
     const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    handleSupabaseError(error, `fetching versions for prompt ${promptId}`);
    if (!data) return [];
    return data.map(v => ({
        id: v.id,
        prompt_id: v.prompt_id,
        user_id: v.user_id,
        content: v.content,
        notes: v.notes,
        commitMessage: v.commit_message,
        created_at: v.created_at,
        supabase_synced_at: v.created_at,
    }));
}

// Batch fetch all prompt versions for a user (useful for initial load)
export async function fetchAllPromptVersionsForUserFromSupabase(
    supabase: SupabaseClient,
    userId: string
): Promise<PromptVersion[]> {
    const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    handleSupabaseError(error, `fetching all versions for user ${userId}`);
    if (!data) return [];
    return data.map(v => ({
        id: v.id,
        prompt_id: v.prompt_id,
        user_id: v.user_id,
        content: v.content,
        notes: v.notes,
        commitMessage: v.commit_message,
        created_at: v.created_at,
        supabase_synced_at: v.created_at,
    }));
}
