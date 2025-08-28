import React from 'react';

import App from 'App';
import { AppProvider } from 'AppProvider';
import ReactDOM from 'react-dom/client';
import logger from 'shared/utils/logger';

import 'shared/lib/i18n';
import 'index.css';

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
