import React from 'react';

import App from 'App';
import { AppProvider } from 'AppProvider';
import ReactDOM from 'react-dom/client';
import logger from 'shared/utils/logger';
import { setupScrollbarThemeManager } from 'shared/utils/scrollbarTheme';

import 'shared/lib/i18n';
import 'index.scss';

// Apply theme immediately from localStorage to prevent flash
const THEME_STORAGE_KEY = 'user-theme';
const earlyTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;

if (earlyTheme && (earlyTheme === 'light' || earlyTheme === 'dark')) {
  document.body.setAttribute('data-theme', earlyTheme);
} else {
  // Check OS preference as fallback
  const prefersColorScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const fallbackTheme = prefersColorScheme ? 'dark' : 'light';
  document.body.setAttribute('data-theme', fallbackTheme);
}

// Initialize scrollbar theme
setupScrollbarThemeManager();

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
