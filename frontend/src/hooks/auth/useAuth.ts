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


  return context;
};
