import React from 'react';

import { Toaster } from 'react-hot-toast';

import { useAuth } from 'features/auth/hooks';
import { useIsMobile } from 'shared/hooks';

// Header height from design tokens (56px)
const HEADER_HEIGHT = 56;
const MOBILE_TOP_OFFSET = 12;

/**
 * Global toast notification configuration component for the application.
 * Provides centralized styling and positioning for all toast notifications using react-hot-toast.
 * Configures theme-aware toast appearance that adapts to the application's design system.
 *
 * On desktop: bottom-right positioning
 * On mobile: top-center positioning, below navbar if logged in
 */
export const ToasterConfig: React.FC = () => {
  const isMobile = useIsMobile();
  const { token } = useAuth();
  const isLoggedIn = !!token;

  // On mobile: top-center, with offset for navbar if logged in
  // On desktop: bottom-right
  const position = isMobile ? 'top-center' : 'bottom-right';

  const containerStyle = isMobile
    ? {
        top: isLoggedIn ? HEADER_HEIGHT + MOBILE_TOP_OFFSET : MOBILE_TOP_OFFSET,
        left: 0,
        right: 0,
      }
    : {
        bottom: 20,
        right: 20,
      };

  return (
    <Toaster
      position={position}
      gutter={8}
      containerStyle={containerStyle}
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--user-chosen-color, var(--color-surface-elevated))',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px var(--color-overlay-medium)',
          backdropFilter: 'blur(12px)',
        },
        success: {
          style: {
            border: '1px solid var(--color-success)',
          },
          iconTheme: {
            primary: 'var(--color-success)',
            secondary: 'var(--user-chosen-color, var(--color-surface-elevated))',
          },
        },
        error: {
          style: {
            border: '1px solid var(--color-error)',
          },
          iconTheme: {
            primary: 'var(--color-error)',
            secondary: 'var(--user-chosen-color, var(--color-surface-elevated))',
          },
        },
        loading: {
          style: {
            border: '1px solid var(--color-primary)',
          },
          iconTheme: {
            primary: 'var(--color-primary)',
            secondary: 'var(--user-chosen-color, var(--color-surface-elevated))',
          },
        },
      }}
    />
  );
};
