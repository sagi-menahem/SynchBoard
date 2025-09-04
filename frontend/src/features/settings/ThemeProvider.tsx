import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import logger from 'shared/utils/logger';
import { applyScrollbarTheme } from 'shared/utils/scrollbarTheme';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  isLoading: boolean;
  error: string | null;
  setTheme: (theme: Theme) => void;
  resetError: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'user-theme';
const getInitialTheme = (): Theme => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
    return storedTheme;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyThemeToDOM = (theme: Theme) => {
  document.body.setAttribute('data-theme', theme);
  applyScrollbarTheme(theme);
  void document.body.offsetHeight;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track recent theme changes to prevent server overrides
  const recentThemeChangeRef = useRef<{ theme: Theme; timestamp: number } | null>(null);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      // Track this change to prevent server overrides
      recentThemeChangeRef.current = {
        theme: newTheme,
        timestamp: Date.now(),
      };

      // 1. Apply immediately to DOM (visual feedback first)
      applyThemeToDOM(newTheme);

      // 2. Update React state
      setThemeState(newTheme);

      // 3. Save to localStorage
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);

      // 4. Background API sync (fire-and-forget, don't block UI)
      if (isAuthenticated) {
        userService.updateThemePreferences({ theme: newTheme }).catch((err) => {
          logger.error('Failed to sync theme preference to backend:', err);
        });
      }
    },
    [isAuthenticated],
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Load theme from server for authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      // For guests, just apply the initial theme
      const initialTheme = getInitialTheme();
      setThemeState(initialTheme);
      applyThemeToDOM(initialTheme);
      return;
    }

    const loadThemeFromServer = async () => {
      setIsLoading(true);
      try {
        const themePrefs = await userService.getThemePreferences();

        // Check if there was a recent theme change that we should not override
        const recentChange = recentThemeChangeRef.current;
        const isRecentChange =
          recentChange &&
          Date.now() - recentChange.timestamp < TIMING_CONSTANTS.THEME_CHANGE_DETECTION_TIMEOUT;

        if (isRecentChange) {
          setIsLoading(false);
          return;
        }

        // Get the current theme from localStorage
        const localTheme = getInitialTheme();

        // Only override localStorage if server has a different theme
        if (themePrefs.theme && themePrefs.theme !== localTheme) {
          setThemeState(themePrefs.theme);
          applyThemeToDOM(themePrefs.theme);
          localStorage.setItem(THEME_STORAGE_KEY, themePrefs.theme);
        }
      } catch (err) {
        logger.error('Failed to load theme preferences:', err);
        setError('Failed to load theme preferences');
      } finally {
        setIsLoading(false);
      }
    };

    void loadThemeFromServer();
  }, [isAuthenticated]);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    applyThemeToDOM(initialTheme);
    setThemeState(initialTheme);
  }, []);

  const value: ThemeContextType = {
    theme,
    isLoading,
    error,
    setTheme,
    resetError,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
