import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access the runtime configuration from the window object.
// This object is populated by the main() function in index.tsx before this module is loaded.
const supabaseUrl = (window as any).APP_CONFIG?.VITE_SUPABASE_URL;
const supabaseAnonKey = (window as any).APP_CONFIG?.VITE_SUPABASE_ANON_KEY;

// Initialize the client. Throw an error if not configured.
export const supabaseClient: SupabaseClient = (() => {
  // Also check if the values are still the placeholders, indicating replacement failed.
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.startsWith('---')) {
    const errorMessage = "Supabase client initialization failed: Supabase URL or Key is missing. " +
                         "This usually happens when the runtime configuration (e.g., from '/config.json') is not loaded correctly. " +
                         "Please check your deployment configuration to ensure these values are available to the frontend application at runtime.";
    console.error(errorMessage);
    // A hard error is thrown because the application cannot function correctly for authenticated users without Supabase.
    throw new Error(errorMessage);
  }
  return createClient(supabaseUrl, supabaseAnonKey);
})();