import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getUserProfile } from 'features/settings/services/userService';
import { getToken, setToken as saveToken, removeToken } from 'shared/utils/authUtils';
import logger from 'shared/utils/logger';

import { AuthContext } from './AuthContext';
import { useSyncAuthValidation } from './hooks/useSyncAuthValidation';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const storedToken = getToken();

  const [token, setToken] = useState<string | null>(storedToken);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitializing] = useState(false);
  const [needsBackendValidation, setNeedsBackendValidation] = useState(false);

  const { validateTokenSync, clearExpiryWarning, clearTokenFromStorage } = useSyncAuthValidation();

  useMemo(() => {
    const result = validateTokenSync(token);

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

  const login = useCallback((newToken: string) => {
    setToken(newToken);
    saveToken(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    removeToken();
  }, []);

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
