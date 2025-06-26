
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './contexts/AppContext';
import App from './components/App';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseClient } from './services/supabaseClient';

// Service Worker Registration
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