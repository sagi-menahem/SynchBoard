/**
 * Main entry point for the SynchBoard React application.
 * Handles theme initialization, sets up scrollbar theme management,
 * and renders the root React component tree.
 */

import App from 'App';
import { AppProvider } from 'AppProvider';
import React from 'react';
import ReactDOM from 'react-dom/client';
import logger from 'shared/utils/logger';
import { setupScrollbarThemeManager } from 'shared/utils/scrollbarTheme';

import 'index.scss';
import 'shared/lib/i18n';

const THEME_STORAGE_KEY = 'user-theme';
const earlyTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;

// Initialize theme early to prevent flash of unstyled content (FOUC)
if (earlyTheme && (earlyTheme === 'light' || earlyTheme === 'dark')) {
  document.body.setAttribute('data-theme', earlyTheme);
} else {
  // Fall back to system preference when no stored theme is found
  const prefersColorScheme =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const fallbackTheme = prefersColorScheme ? 'dark' : 'light';
  document.body.setAttribute('data-theme', fallbackTheme);
}

setupScrollbarThemeManager();

// Ensure root element exists before attempting to render React app
const rootElement = document.getElementById('root');
if (!rootElement) {
  const error = new Error('Failed to find the root element');
  logger.error('[main] Root element not found - cannot initialize React application');
  throw error;
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
