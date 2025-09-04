import React from 'react';

import { Toaster } from 'react-hot-toast';

export const ToasterConfig: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      gutter={8}
      containerStyle={{
        bottom: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--color-surface-elevated)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px var(--color-overlay-medium)',
        },
        success: {
          style: {
            border: '1px solid var(--color-success)',
          },
          iconTheme: {
            primary: 'var(--color-success)',
            secondary: 'var(--color-surface-elevated)',
          },
        },
        error: {
          style: {
            border: '1px solid var(--color-error)',
          },
          iconTheme: {
            primary: 'var(--color-error)',
            secondary: 'var(--color-surface-elevated)',
          },
        },
        loading: {
          style: {
            border: '1px solid var(--color-primary)',
          },
          iconTheme: {
            primary: 'var(--color-primary)',
            secondary: 'var(--color-surface-elevated)',
          },
        },
      }}
    />
  );
};
