

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access the runtime configuration from the window object.
// This object is populated by a script in index.html, allowing environment variables
// to be injected at runtime.
const supabaseUrl = (window as any).APP_CONFIG?.VITE_SUPABASE_URL;
const supabaseAnonKey = (window as any).APP_CONFIG?.VITE_SUPABASE_ANON_KEY;


// Initialize the client. Throw an error if not configured.
export const supabaseClient: SupabaseClient = (() => {
  // Also check if the values are still the placeholders, indicating replacement failed.
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.startsWith('---')) {
    const errorMessage = "Supabase client initialization failed: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
                         "These are essential for Supabase features to work. \n" +
                         "Please ensure they are correctly set in a '.env' file in your project root. \n" +
                         "Example .env content:\n" +
                         "VITE_SUPABASE_URL=your_supabase_project_url\n" +
                         "VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key\n" +
                         "After creating or modifying the .env file, you MUST restart your Vite development server.";
    console.error(errorMessage);
    // For the application to stop execution and clearly indicate the misconfiguration,
    // throwing an error here is appropriate. The developer must set up their .env file.
    throw new Error(errorMessage);
  }
  return createClient(supabaseUrl, supabaseAnonKey);
})();