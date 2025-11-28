import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import type { DockAnchor } from 'features/settings/types/UserTypes';
import { useCallback, useEffect, useState } from 'react';
import type { Tool } from 'shared/types/CommonTypes';
import logger from 'shared/utils/logger';

/**
 * Interface defining user tool preferences for drawing and canvas operations.
 */
export interface ToolPreferences {
  // Default drawing tool selection for new canvas sessions
  defaultTool: Tool;
  // Default stroke color in hex format for drawing operations
  defaultStrokeColor: string;
  // Default stroke width in pixels for drawing tools
  defaultStrokeWidth: number;
  // Dock anchor position for floating toolbar placement
  dockAnchor: DockAnchor;
  // Whether the floating dock is minimized/collapsed
  isDockMinimized: boolean;
}

const defaultToolPreferences: ToolPreferences = {
  defaultTool: 'brush',
  defaultStrokeColor: '#FFFFFF',
  defaultStrokeWidth: 3,
  dockAnchor: 'bottom-center',
  isDockMinimized: false,
};

/**
 * Custom hook for managing user drawing tool preferences with optimistic updates and error handling.
 * Provides comprehensive tool preference management including default tool selection, stroke properties,
 * and canvas drawing settings with persistent storage for authenticated users.
 * Implements optimistic UI updates with rollback functionality for failed operations and proper error states.
 * Offers granular preference updates as well as batch preference modification capabilities.
 * 
 * @returns Object containing current tool preferences, loading states, and preference update functions
 */
export const useToolPreferencesAPI = () => {
  const [preferences, setPreferences] = useState<ToolPreferences>(defaultToolPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const isAuthenticated = !!token;

  // Memoize to prevent infinite loops when used in useEffect dependency array
  const refreshPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const toolPrefs = await userService.getToolPreferences();
      setPreferences(toolPrefs);
    } catch (error) {
      logger.error('Failed to load tool preferences:', error);
      setError('Failed to load tool preferences');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updatePreference = async <K extends keyof ToolPreferences>(
    key: K,
    value: ToolPreferences[K],
  ) => {
    if (!isAuthenticated) {
      return;
    }

    // Store previous value for potential rollback
    const previousValue = preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setError(null);

    try {
      const updatedPrefs = { ...preferences, [key]: value };
      await userService.updateToolPreferences(updatedPrefs);
    } catch (error) {
      logger.error(`Failed to update ${key}:`, error);
      // Rollback to previous value on failure
      setPreferences((prev) => ({ ...prev, [key]: previousValue }));
      setError(`Failed to save ${key} preference`);
      throw error;
    }
  };

  const updateTool = (tool: Tool) => updatePreference('defaultTool', tool);
  const updateStrokeColor = (color: string) => updatePreference('defaultStrokeColor', color);
  const updateStrokeWidth = (width: number) => updatePreference('defaultStrokeWidth', width);
  const updateDockAnchor = (anchor: DockAnchor) => updatePreference('dockAnchor', anchor);
  const updateDockMinimized = (minimized: boolean) => updatePreference('isDockMinimized', minimized);

  const updateToolPreferences = async (newPrefs: Partial<ToolPreferences>) => {
    if (!isAuthenticated) {
      return;
    }

    // Store current state for rollback capability
    const oldPrefs = preferences;
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
    setError(null);

    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      await userService.updateToolPreferences(updatedPrefs);
    } catch (error) {
      logger.error('Failed to save tool preferences:', error);
      // Restore previous state on failure
      setPreferences(oldPrefs);
      setError('Failed to save tool preferences');
      throw error;
    }
  };

  const resetError = () => setError(null);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshPreferences();
    }
  }, [isAuthenticated, refreshPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth,
    updateDockAnchor,
    updateDockMinimized,
    updateToolPreferences,
    refreshPreferences,
    resetError,
  };
};
