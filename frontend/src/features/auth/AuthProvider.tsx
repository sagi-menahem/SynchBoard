import React, { useEffect, useState, type ReactNode } from 'react';

import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';

import { AuthContext } from './AuthContext';
import { useAuthValidation } from './hooks/useAuthValidation';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  
  const [token, setToken] = useState<string | null>(storedToken);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { validateToken, clearExpiryWarning, clearTokenFromStorage } = useAuthValidation();

  useEffect(() => {
    const performValidation = async () => {
      const result = await validateToken(token);
      
      if (result.shouldClearToken) {
        setToken(null);
        clearTokenFromStorage();
      }
      
      setUserEmail(result.userEmail);
      setIsInitializing(false);
    };

    void performValidation();
    
    return () => {
      clearExpiryWarning();
    };
  }, [token, validateToken, clearExpiryWarning, clearTokenFromStorage]);

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
