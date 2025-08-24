import { useContext } from 'react';

import logger from 'utils/logger';

import { AuthContext } from 'context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    const error = new Error('useAuth must be used within an AuthProvider');
    logger.error('[useAuth] Context not found - missing AuthProvider wrapper', {
      stack: new Error().stack,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }

  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH === 'true') {
    logger.debug('[useAuth] Hook called', {
      hasContext: !!context,
      hasToken: !!context?.token,
      userEmail: context?.userEmail,
      tokenLength: context?.token?.length,
      caller: new Error().stack?.split('\n')[2]?.trim(),
    });
  }

  return context;
};
