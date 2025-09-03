import { useContext } from 'react';

import logger from 'shared/utils/logger';

import { AuthContext } from '../AuthContext';
import * as authService from '../services/authService';

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


  return {
    ...context,
    redirectToGoogle: authService.redirectToGoogle,
  };
};
