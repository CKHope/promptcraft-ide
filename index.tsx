
// Establish runtime config placeholders. These are global and will be populated
// by the fetch call before the main app loads. This ensures they exist and prevents
// "undefined" errors if the config fetch fails.
(window as any).process = { env: { API_KEY: "---API_KEY---" } };
(window as any).APP_CONFIG = {
    VITE_SUPABASE_URL: "---VITE_SUPABASE_URL---",
    VITE_SUPABASE_ANON_KEY: "---VITE_SUPABASE_ANON_KEY---"
};

// Service Worker Registration can run early.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

/**
 * Initializes the application.
 * 1. Fetches runtime configuration from /config.json.
 * 2. Populates global window objects with the fetched config.
 * 3. Dynamically imports and renders the React application.
 * This approach ensures that all modules that depend on the runtime config
 * are loaded *after* the configuration is available, solving issues with
 * environment variables in Docker deployments.
 */
async function main() {
    console.log("Fetching runtime configuration...");
    try {
        const response = await fetch('/config.json');
        if (response.ok) {
            const config = await response.json();
            // Populate the global config objects. The services will pick these up when they are initialized.
            if (config.API_KEY) (window as any).process.env.API_KEY = config.API_KEY;
            
            // Accommodate different env variable naming conventions (e.g., with or without VITE_ prefix)
            if (config.VITE_SUPABASE_URL || config.SUPABASE_URL) {
                (window as any).APP_CONFIG.VITE_SUPABASE_URL = config.VITE_SUPABASE_URL || config.SUPABASE_URL;
            }
            if (config.VITE_SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY) {
                (window as any).APP_CONFIG.VITE_SUPABASE_ANON_KEY = config.VITE_SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY;
            }
            
            console.log("Runtime configuration successfully applied.");
        } else {
            console.error(`Failed to load /config.json (status: ${response.status}). App will use placeholder values, which will likely cause initialization errors.`);
        }
    } catch (e) {
        console.error('Error fetching /config.json. App will use placeholder values, which will likely cause errors.', e);
    }

    // Dynamically import modules that depend on the runtime config.
    const React = (await import('react')).default;
    const ReactDOM = (await import('react-dom/client'));
    const { AppProvider } = await import('./contexts/AppContext');
    const { default: App } = await import('./components/App');
    const { SessionContextProvider } = await import('@supabase/auth-helpers-react');
    // supabaseClient will be initialized internally after config is loaded.
    const { supabaseClient } = await import('./services/supabaseClient');

    const rootElement = document.getElementById('root');
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <SessionContextProvider supabaseClient={supabaseClient}>
                    <AppProvider>
                        <App />
                    </AppProvider>
                </SessionContextProvider>
            </React.StrictMode>
        );
    }
}

// Start the application initialization process.
main();