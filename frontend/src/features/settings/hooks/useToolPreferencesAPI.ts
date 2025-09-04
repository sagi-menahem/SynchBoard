
import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import { useCallback, useEffect, useState } from 'react';
import type { Tool } from 'shared/types/CommonTypes';
import logger from 'shared/utils/logger';

export interface ToolPreferences {
  defaultTool: Tool;
  defaultStrokeColor: string;
  defaultStrokeWidth: number;
}

const defaultToolPreferences: ToolPreferences = {
  defaultTool: 'brush',
  defaultStrokeColor: '#FFFFFF',
  defaultStrokeWidth: 3,
};

export const useToolPreferencesAPI = () => {
  const [preferences, setPreferences] = useState<ToolPreferences>(defaultToolPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const isAuthenticated = !!token;

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

    const previousValue = preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setError(null);

    try {
      const updatedPrefs = { ...preferences, [key]: value };
      await userService.updateToolPreferences(updatedPrefs);
    } catch (error) {
      logger.error(`Failed to update ${key}:`, error);
      setPreferences((prev) => ({ ...prev, [key]: previousValue }));
      setError(`Failed to save ${key} preference`);
      throw error;
    }
  };

  const updateTool = (tool: Tool) => updatePreference('defaultTool', tool);
  const updateStrokeColor = (color: string) => updatePreference('defaultStrokeColor', color);
  const updateStrokeWidth = (width: number) => updatePreference('defaultStrokeWidth', width);

  const updateToolPreferences = async (newPrefs: Partial<ToolPreferences>) => {
    if (!isAuthenticated) {
      return;
    }

    const oldPrefs = preferences;
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
    setError(null);

    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      await userService.updateToolPreferences(updatedPrefs);
    } catch (error) {
      logger.error('Failed to save tool preferences:', error);
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
    updateToolPreferences,
    refreshPreferences,
    resetError,
  };
};
