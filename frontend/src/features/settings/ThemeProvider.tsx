import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TIMING_CONSTANTS } from 'shared/constants/TimingConstants';
import logger from 'shared/utils/logger';
import { applyScrollbarTheme } from 'shared/utils/scrollbarTheme';

/** Theme type definition for application-wide theme management */
export type Theme = 'light' | 'dark';

/**
 * Context interface for theme management providing application-wide theme state and controls.
 */
export interface ThemeContextType {
  // Current active theme setting
  theme: Theme;
  // Loading state indicator for theme synchronization operations
  isLoading: boolean;
  // Error message for failed theme operations, null when no error
  error: string | null;
  // Function to change the active theme with persistence and DOM updates
  setTheme: (theme: Theme) => void;
  // Function to clear current error state
  resetError: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Props for the ThemeProvider component.
 */
interface ThemeProviderProps {
  /** Child components that will have access to theme context */
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'user-theme';
const getInitialTheme = (): Theme => {
  // Check localStorage for previously saved theme preference
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
    return storedTheme;
  }
  // Fall back to system preference if no stored theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyThemeToDOM = (theme: Theme) => {
  document.body.setAttribute('data-theme', theme);
  applyScrollbarTheme(theme);
  // Force DOM reflow to ensure theme changes are applied immediately
  void document.body.offsetHeight;
};

/**
 * React Context Provider component for managing application-wide theme state and synchronization.
 * Provides global theme management with localStorage persistence and server synchronization for authenticated users.
 * Handles system theme detection, recent change tracking to prevent conflicts, and DOM theme application.
 * The value object exposes current theme state, loading indicators, theme switching function, and error handling.
 * Integrates with scrollbar theming and ensures smooth theme transitions across the entire application.
 *
 * @param children - Child components that will consume the theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recentThemeChangeRef = useRef<{ theme: Theme; timestamp: number } | null>(null);

  // Memoize to prevent unnecessary re-renders when theme setter is passed to child components
  const setTheme = useCallback(
    (newTheme: Theme) => {
      // Track recent theme change to prevent server conflicts
      recentThemeChangeRef.current = {
        theme: newTheme,
        timestamp: Date.now(),
      };

      applyThemeToDOM(newTheme);

      setThemeState(newTheme);

      localStorage.setItem(THEME_STORAGE_KEY, newTheme);

      // Sync with server for authenticated users
      if (isAuthenticated) {
        userService.updateThemePreferences({ theme: newTheme }).catch((err) => {
          logger.error('Failed to sync theme preference to backend:', err);
        });
      }
    },
    [isAuthenticated],
  );

  // Memoize to provide stable reference for error reset handlers
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      const initialTheme = getInitialTheme();
      setThemeState(initialTheme);
      applyThemeToDOM(initialTheme);
      return;
    }

    const loadThemeFromServer = async () => {
      setIsLoading(true);
      try {
        const themePrefs = await userService.getThemePreferences();

        // Check if user recently changed theme to avoid overriding local changes
        const recentChange = recentThemeChangeRef.current;
        const isRecentChange =
          recentChange &&
          Date.now() - recentChange.timestamp < TIMING_CONSTANTS.THEME_CHANGE_DETECTION_TIMEOUT;

        if (isRecentChange) {
          setIsLoading(false);
          return;
        }

        const localTheme = getInitialTheme();

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

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
