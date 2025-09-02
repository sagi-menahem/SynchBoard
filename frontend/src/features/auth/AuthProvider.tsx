import React, { useEffect, useState, useMemo, type ReactNode } from 'react';

import { getUserProfile } from 'features/settings/services/userService';
import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';
import logger from 'shared/utils/logger';

import { AuthContext } from './AuthContext';
import { useSyncAuthValidation } from './hooks/useSyncAuthValidation';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  
  const [token, setToken] = useState<string | null>(storedToken);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitializing] = useState(false); // Start as false for immediate render
  const [needsBackendValidation, setNeedsBackendValidation] = useState(false);
  
  const { validateTokenSync, clearExpiryWarning, clearTokenFromStorage } = useSyncAuthValidation();

  // Synchronous validation on token change
  useMemo(() => {
    const result = validateTokenSync(token);
    
    // Update state immediately based on synchronous validation
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

  // Background validation with backend (non-blocking)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearExpiryWarning();
    };
  }, [clearExpiryWarning]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  };

  const value = {
    token,
    userEmail,
    isInitializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
