import { useCallback } from 'react';

import { useToolPreferences } from 'context/ToolPreferencesContext';
import type { Tool } from 'types/CommonTypes';

export const useToolbarState = () => {
  const { 
    preferences,
    isLoading,
    error,
    updateTool,
    updateStrokeColor,
    updateStrokeWidth 
  } = useToolPreferences();

  const setTool = useCallback((newTool: Tool) => {
    updateTool(newTool);
  }, [updateTool]);

  const setStrokeColor = useCallback((newColor: string) => {
    updateStrokeColor(newColor);
  }, [updateStrokeColor]);

  const setStrokeWidth = useCallback((newWidth: number) => {
    updateStrokeWidth(newWidth);
  }, [updateStrokeWidth]);

  return {
    tool: preferences.defaultTool,
    setTool,
    strokeColor: preferences.defaultStrokeColor,
    setStrokeColor,
    strokeWidth: preferences.defaultStrokeWidth,
    setStrokeWidth,
    isLoading,
    error,
  };
};
