import { useContext } from 'react';

import logger from 'shared/utils/logger';

import { AuthContext } from '../AuthContext';
import * as authService from '../services/authService';

/**
 * Hook for accessing authentication state and methods throughout the application.
 * Provides secure access to user authentication data, login status, and OAuth redirection.
 * Must be used within an AuthProvider component tree.
 *
 * @returns Authentication context with user data, tokens, loading states, and OAuth methods
 * @throws {Error} When used outside of AuthProvider context
 */
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
