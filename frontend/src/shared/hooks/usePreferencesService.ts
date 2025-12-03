import { useAuth } from 'features/auth/hooks';
import { useCallback, useEffect, useReducer } from 'react';

import logger from 'shared/utils/logger';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Generic state interface for managing preferences with loading and error states.
 */
export interface PreferencesState<T> {
  /** Current preferences configuration */
  preferences: T;
  /** Loading state indicator for asynchronous preference operations */
  isLoading: boolean;
  /** Error message string for failed preference operations, null when no error */
  error: string | null;
}

/**
 * Generic action types for preferences reducer.
 */
type PreferencesAction<T> =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: T }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<T> }
  | { type: 'SET_PREFERENCES'; payload: T }
  | { type: 'RESET_ERROR' };

/**
 * Service interface that preferences services must implement.
 */
export interface PreferencesServiceAdapter<T> {
  /** Fetch preferences from the server */
  fetchPreferences: () => Promise<T>;
  /** Update preferences on the server */
  updatePreferences: (preferences: Partial<T>) => Promise<void>;
  /** Get default preferences (used when not authenticated) */
  getDefaultPreferences: () => T;
}

/**
 * Configuration options for the preferences service hook.
 */
export interface UsePreferencesServiceOptions<T> {
  /** The service adapter to use for fetching/updating preferences */
  service: PreferencesServiceAdapter<T>;
  /** Name for logging purposes */
  serviceName: string;
  /** Whether to show toast notifications on error (default: false) */
  showToastOnError?: boolean;
  /** Custom error message for fetch failures */
  fetchErrorMessage?: string;
  /** Custom error message for update failures */
  updateErrorMessage?: string;
}

/**
 * Return type for the usePreferencesService hook.
 */
export interface UsePreferencesServiceResult<T> {
  /** Current preferences */
  preferences: T;
  /** Whether preferences are currently loading */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
  /** Refresh preferences from the server */
  refreshPreferences: () => Promise<void>;
  /** Update preferences with partial data (optimistic update with rollback) */
  updatePreferences: (newPrefs: Partial<T>) => Promise<void>;
  /** Update preferences silently without toast notifications */
  updatePreferencesSilent: (newPrefs: Partial<T>) => Promise<void>;
  /** Reset the error state */
  resetError: () => void;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Dispatch function for custom actions */
  dispatch: React.Dispatch<PreferencesAction<T>>;
}

// =============================================================================
// REDUCER FACTORY
// =============================================================================

/**
 * Creates a reducer for managing preferences state.
 */
function createPreferencesReducer<T>() {
  return (state: PreferencesState<T>, action: PreferencesAction<T>): PreferencesState<T> => {
    switch (action.type) {
      case 'LOAD_START':
        return { ...state, isLoading: true, error: null };
      case 'LOAD_SUCCESS':
        return {
          ...state,
          isLoading: false,
          preferences: action.payload,
          error: null,
        };
      case 'LOAD_ERROR':
        return { ...state, isLoading: false, error: action.payload };
      case 'UPDATE_PREFERENCES':
        return {
          ...state,
          preferences: { ...state.preferences, ...action.payload },
          error: null,
        };
      case 'SET_PREFERENCES':
        return {
          ...state,
          preferences: action.payload,
          error: null,
        };
      case 'RESET_ERROR':
        return { ...state, error: null };
      default:
        return state;
    }
  };
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Generic hook for managing preferences with loading, error handling, and optimistic updates.
 *
 * Features:
 * - Automatic loading on authentication
 * - Optimistic updates with rollback on failure
 * - Error state management
 * - Silent update mode (no toast notifications)
 * - Reducer-based state management
 *
 * @example
 * ```typescript
 * const canvasPrefsService: PreferencesServiceAdapter<CanvasPreferences> = {
 *   fetchPreferences: () => CanvasPreferencesService.fetchPreferences(),
 *   updatePreferences: (prefs) => CanvasPreferencesService.updatePreferences(prefs),
 *   getDefaultPreferences: () => CanvasPreferencesService.getDefaultPreferences(),
 * };
 *
 * function useCanvasPreferences() {
 *   return usePreferencesService({
 *     service: canvasPrefsService,
 *     serviceName: 'canvas',
 *   });
 * }
 * ```
 */
export function usePreferencesService<T>(
  options: UsePreferencesServiceOptions<T>,
): UsePreferencesServiceResult<T> {
  const {
    service,
    serviceName,
    fetchErrorMessage = `Failed to load ${serviceName} preferences`,
    updateErrorMessage = `Failed to save ${serviceName} preferences`,
  } = options;

  const reducer = createPreferencesReducer<T>();
  const initialState: PreferencesState<T> = {
    preferences: service.getDefaultPreferences(),
    isLoading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { token } = useAuth();
  const isAuthenticated = !!token;

  // Refresh preferences from the server
  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    dispatch({ type: 'LOAD_START' });

    try {
      const preferences = await service.fetchPreferences();
      dispatch({ type: 'LOAD_SUCCESS', payload: preferences });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : fetchErrorMessage;
      logger.error(`${serviceName} preferences fetch error:`, error);
      dispatch({ type: 'LOAD_ERROR', payload: errorMessage });
    }
  }, [isAuthenticated, service, serviceName, fetchErrorMessage]);

  // Update preferences with optimistic update and rollback
  const updatePreferences = useCallback(
    async (newPrefs: Partial<T>) => {
      if (!isAuthenticated) {
        return;
      }

      // Store previous state for potential rollback
      const oldPrefs = state.preferences;
      // Merge new preferences with current state to get full preferences object
      const mergedPrefs = { ...oldPrefs, ...newPrefs };
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        // Send full merged preferences to ensure all required fields are present
        await service.updatePreferences(mergedPrefs);
      } catch (error) {
        // Rollback to previous state on failure
        logger.error(`${serviceName} preferences update error:`, error);
        dispatch({ type: 'SET_PREFERENCES', payload: oldPrefs });
        dispatch({ type: 'LOAD_ERROR', payload: updateErrorMessage });
        throw error;
      }
    },
    [isAuthenticated, state.preferences, service, serviceName, updateErrorMessage],
  );

  // Silent update - same as updatePreferences but without setting error state
  const updatePreferencesSilent = useCallback(
    async (newPrefs: Partial<T>) => {
      if (!isAuthenticated) {
        return;
      }

      const oldPrefs = state.preferences;
      // Merge new preferences with current state to get full preferences object
      const mergedPrefs = { ...oldPrefs, ...newPrefs };
      dispatch({ type: 'UPDATE_PREFERENCES', payload: newPrefs });

      try {
        // Send full merged preferences to ensure all required fields are present
        await service.updatePreferences(mergedPrefs);
      } catch (error) {
        // Silently restore previous state
        logger.error(`${serviceName} preferences silent update error:`, error);
        dispatch({ type: 'SET_PREFERENCES', payload: oldPrefs });
        throw error;
      }
    },
    [isAuthenticated, state.preferences, service, serviceName],
  );

  const resetError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' });
  }, []);

  // Load preferences on authentication
  useEffect(() => {
    if (isAuthenticated) {
      void refreshPreferences();
    }
  }, [isAuthenticated, refreshPreferences]);

  return {
    preferences: state.preferences,
    isLoading: state.isLoading,
    error: state.error,
    refreshPreferences,
    updatePreferences,
    updatePreferencesSilent,
    resetError,
    isAuthenticated,
    dispatch,
  };
}
