-- Create the 'folders' table
CREATE TABLE public.folders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    parent_id uuid REFERENCES public.folders(id) ON DELETE SET NULL, -- Allows parent folder to be deleted without deleting children
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT folders_pkey PRIMARY KEY (id)
);
-- Enable Row Level Security for 'folders'
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for 'folders'
CREATE POLICY "Users can manage their own folders"
    ON public.folders
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create the 'tags' table
CREATE TABLE public.tags (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT tags_pkey PRIMARY KEY (id),
    CONSTRAINT tags_user_id_name_key UNIQUE (user_id, name) -- Ensures tag names are unique per user
);
-- Enable Row Level Security for 'tags'
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for 'tags'
CREATE POLICY "Users can manage their own tags"
    ON public.tags
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create the 'prompts' table
CREATE TABLE public.prompts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    notes text,
    folder_id uuid REFERENCES public.folders(id) ON DELETE SET NULL, -- If folder is deleted, prompt's folder_id becomes NULL
    tags uuid[], -- Array of tag UUIDs
    first_successful_result_text text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT prompts_pkey PRIMARY KEY (id)
);
-- Enable Row Level Security for 'prompts'
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for 'prompts'
CREATE POLICY "Users can manage their own prompts"
    ON public.prompts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create the 'prompt_versions' table
CREATE TABLE public.prompt_versions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    prompt_id uuid NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE, -- If prompt is deleted, its versions are also deleted
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    notes text,
    commit_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT prompt_versions_pkey PRIMARY KEY (id)
);
-- Enable Row Level Security for 'prompt_versions'
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
-- Create RLS policies for 'prompt_versions'
-- Users can manage versions of prompts they own.
CREATE POLICY "Users can manage versions of their own prompts"
    ON public.prompt_versions
    FOR ALL
    USING (
        auth.uid() = user_id AND
        (EXISTS ( SELECT 1
                  FROM prompts p
                  WHERE p.id = prompt_versions.prompt_id AND p.user_id = auth.uid() ))
    )
    WITH CHECK (
        auth.uid() = user_id AND
        (EXISTS ( SELECT 1
                  FROM prompts p
                  WHERE p.id = prompt_versions.prompt_id AND p.user_id = auth.uid() ))
    );

-- Add indexes for foreign keys and frequently queried columns (optional but recommended for performance)
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX idx_prompts_folder_id ON public.prompts(folder_id);
CREATE INDEX idx_prompt_versions_prompt_id ON public.prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_user_id ON public.prompt_versions(user_id);

-- Function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update 'updated_at' on table updates
CREATE TRIGGER on_prompts_update
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_tags_update
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_folders_update
    BEFORE UPDATE ON public.folders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- (prompt_versions typically only get created, not updated, but a trigger could be added if needed)