import { LOCAL_STORAGE_KEYS } from 'constants';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';

import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { Logger } from 'utils';

const logger = Logger;

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  logger.info('[AuthProvider] Initializing - localStorage token exists:', !!storedToken, {
    tokenLength: storedToken?.length,
    tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : null,
  });
  
  const [token, setToken] = useState<string | null>(storedToken);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const expiryWarningTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (expiryWarningTimeoutRef.current) {
      clearTimeout(expiryWarningTimeoutRef.current);
      expiryWarningTimeoutRef.current = null;
    }

    if (token) {
      try {
        const decodedToken: { sub: string, exp?: number } = jwtDecode(token);
        setUserEmail(decodedToken.sub);
        
        const isExpired = decodedToken.exp ? decodedToken.exp * 1000 < Date.now() : false;
        
        if (isExpired) {
          logger.warn('[AuthProvider] Token is expired, clearing auth state');
          setToken(null);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        } else {
          logger.info('[AuthProvider] Authentication state initialized', { 
            userEmail: decodedToken.sub,
            expiresAt: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : 'no expiry',
          });
          
          if (decodedToken.exp) {
            const expiryTime = decodedToken.exp * 1000;
            const warningTime = expiryTime - (5 * 60 * 1000);
            const timeUntilWarning = warningTime - Date.now();
            
            if (timeUntilWarning > 0) {
              expiryWarningTimeoutRef.current = window.setTimeout(() => {
                toast('Your session will expire in 5 minutes. Please save your work.', {
                  duration: 10000,
                  id: 'session-expiry-warning',
                  icon: '⚠️',
                });
              }, timeUntilWarning);
            }
          }
        }
      } catch (error) {
        logger.error('[AuthProvider] Failed to decode JWT token', error);
        setToken(null);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      }
    } else {
      setUserEmail(null);
    }
    
    setIsInitializing(false);
    
    return () => {
      if (expiryWarningTimeoutRef.current) {
        clearTimeout(expiryWarningTimeoutRef.current);
      }
    };
  }, [token]);

  const login = (newToken: string) => {
    logger.info('[AuthProvider] User login - setting new token', {
      tokenLength: newToken?.length,
      tokenPreview: newToken ? `${newToken.substring(0, 20)}...` : null,
    });
    setToken(newToken);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
    logger.info('[AuthProvider] Token saved to localStorage');
  };

  const logout = () => {
    logger.info('[AuthProvider] User logout - clearing token');
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    logger.info('[AuthProvider] Token removed from localStorage');
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
