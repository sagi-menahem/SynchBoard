import { useAuth } from 'features/auth/hooks';
import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

/**
 * Root route handler that redirects users based on authentication status.
 * Provides initial loading state during authentication initialization and
 * intelligently routes authenticated users to boards or unauthenticated users to auth.
 */
const RootRedirect: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { token, isInitializing } = useAuth();

  useEffect(() => {
    // Authentication state has finished initializing
    if (!isInitializing) {
    }
  }, [token, isInitializing]);

  if (isInitializing) {
    // Show loading state while authentication context initializes
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666',
        }}
      >
        {t('common:loading')}
      </div>
    );
  }

  if (token) {
    return <Navigate to="/boards" replace />;
  }
  return <Navigate to="/auth" replace />;
};

export default RootRedirect;
