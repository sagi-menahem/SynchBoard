import React, { useEffect, useRef, useState, type ReactNode } from 'react';

import { getUserProfile } from 'features/settings/services/userService';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';
import logger from 'shared/utils/logger';

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { t } = useTranslation(['auth']);
  const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  
  const [token, setToken] = useState<string | null>(storedToken);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const expiryWarningTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (expiryWarningTimeoutRef.current !== null) {
      clearTimeout(expiryWarningTimeoutRef.current);
      expiryWarningTimeoutRef.current = null;
    }

    const validateAuth = async () => {
      if (token !== null && token !== '') {
        try {
          const decodedToken: { sub: string, exp?: number } = jwtDecode(token);
          setUserEmail(decodedToken.sub);
          
          const isExpired = decodedToken.exp !== undefined ? decodedToken.exp * 1000 < Date.now() : false;
          
          if (isExpired) {
            logger.warn('[AuthProvider] Token is expired, clearing auth state');
            setToken(null);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
            setIsInitializing(false);
            return;
          }

          try {
            await getUserProfile();
            
            if (decodedToken.exp !== undefined) {
              const expiryTime = decodedToken.exp * 1000;
              const warningTime = expiryTime - (5 * 60 * 1000);
              const timeUntilWarning = warningTime - Date.now();
              
              if (timeUntilWarning > 0) {
                expiryWarningTimeoutRef.current = window.setTimeout(() => {
                  toast(t('auth:sessionExpiry.warning'), {
                    duration: 10000,
                    id: 'session-expiry-warning',
                    icon: '⚠️',
                  });
                }, timeUntilWarning);
              }
            }
          } catch (error) {
            logger.warn('[AuthProvider] User validation failed, clearing auth state', error);
            setToken(null);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
            setUserEmail(null);
          }
        } catch (error) {
          logger.error('[AuthProvider] Failed to decode JWT token', error);
          setToken(null);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
          setUserEmail(null);
        }
      } else {
        setUserEmail(null);
      }
      
      setIsInitializing(false);
    };

    void validateAuth();
    
    return () => {
      if (expiryWarningTimeoutRef.current !== null) {
        clearTimeout(expiryWarningTimeoutRef.current);
      }
    };
  }, [token, t]);

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
