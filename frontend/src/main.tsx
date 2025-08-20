import React from 'react';

import App from 'App.tsx';
import { AppProvider } from 'context';
import ReactDOM from 'react-dom/client';
import { Logger } from 'utils';

const logger = Logger;

import 'i18n';
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
