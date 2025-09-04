import { getUserProfile } from 'features/settings/services/userService';
import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getToken, setToken as saveToken, removeToken } from 'shared/utils/authUtils';
import logger from 'shared/utils/logger';

import { AuthContext } from './AuthContext';
import { useSyncAuthValidation } from './hooks/useSyncAuthValidation';

interface AuthProviderProps {
  /** Child components that will have access to authentication context */
  children: ReactNode;
}

/**
 * Authentication context provider that manages global authentication state.
 * Handles JWT token validation, user session management, and automatic token cleanup.
 * Provides authentication context value containing user state, login/logout methods,
 * and initialization status to all child components.
 *
 * @param children - Child components that will have access to authentication context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const storedToken = getToken();

  const [token, setToken] = useState<string | null>(storedToken);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitializing] = useState(false);
  const [needsBackendValidation, setNeedsBackendValidation] = useState(false);

  const { validateTokenSync, clearExpiryWarning, clearTokenFromStorage } = useSyncAuthValidation();

  // Memoized to avoid expensive token validation on every render - only recalculates when token changes
  useMemo(() => {
    const result = validateTokenSync(token);

    // Clear invalid or expired tokens from state and storage
    if (result.shouldClearToken && token) {
      setToken(null);
      clearTokenFromStorage();
      setUserEmail(null);
      setNeedsBackendValidation(false);
    } else if (result.isValid) {
      setUserEmail(result.userEmail);
      setNeedsBackendValidation(result.needsBackendValidation);
    } else {
      setUserEmail(null);
      setNeedsBackendValidation(false);
    }

    return result;
  }, [token, validateTokenSync, clearTokenFromStorage]);

  useEffect(() => {
    if (needsBackendValidation && token) {
      // Validate token with backend to ensure it's still accepted by server
      getUserProfile()
        .then(() => {
          logger.info('[AuthProvider] Backend validation successful');
          setNeedsBackendValidation(false);
        })
        .catch((error) => {
          logger.warn('[AuthProvider] Backend validation failed - clearing token', error);
          setToken(null);
          setUserEmail(null);
          clearTokenFromStorage();
          setNeedsBackendValidation(false);
        });
    }
  }, [needsBackendValidation, token, clearTokenFromStorage]);

  useEffect(() => {
    return () => {
      clearExpiryWarning();
    };
  }, [clearExpiryWarning]);

  // Memoized to prevent child components from re-rendering when login function reference changes
  const login = useCallback((newToken: string) => {
    setToken(newToken);
    saveToken(newToken);
  }, []);

  // Memoized to prevent child components from re-rendering when logout function reference changes
  const logout = useCallback(() => {
    setToken(null);
    removeToken();
  }, []);

  // Memoized to prevent context consumers from re-rendering when dependencies haven't changed
  const value = useMemo(
    () => ({
      token,
      userEmail,
      isInitializing,
      login,
      logout,
    }),
    [token, userEmail, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
