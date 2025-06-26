
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define interfaces to help TypeScript understand the structure of import.meta.env
// This is a common workaround if Vite's client types are not globally available
// or to be more explicit about the expected environment variables.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  // Add other VITE_ environment variables used in your application here
}

// Ensure these environment variables are set in your .env file
// Vite exposes env variables prefixed with VITE_ on import.meta.env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;


// Initialize the client. Throw an error if not configured.
export const supabaseClient: SupabaseClient = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
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
