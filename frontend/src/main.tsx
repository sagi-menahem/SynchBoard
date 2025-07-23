// File: frontend/src/main.tsx
import App from 'App.tsx';
import { AuthProvider } from 'context/AuthProvider.tsx';
import 'i18n';
import 'index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);