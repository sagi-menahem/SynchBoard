// File: frontend/src/main.tsx
import App from 'App.tsx';
import { AppProvider } from 'context/AppProvider';
import 'i18n';
import 'index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);
