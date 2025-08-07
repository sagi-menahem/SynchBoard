import React from 'react';

import App from 'App.tsx';
import ReactDOM from 'react-dom/client';

import { AppProvider } from 'context/AppProvider';

import 'i18n';
import 'index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);
