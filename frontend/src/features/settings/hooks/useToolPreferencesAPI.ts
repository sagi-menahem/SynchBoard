import * as userService from 'features/settings/services/userService';
import type { DockAnchor } from 'features/settings/types/UserTypes';
import { useCallback } from 'react';
import type { Tool } from 'shared/types/CommonTypes';
import {
  usePreferencesService,
  type PreferencesServiceAdapter,
} from 'shared/hooks/usePreferencesService';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Interface defining user tool preferences for drawing and canvas operations.
 */
export interface ToolPreferences {
  /** Default drawing tool selection for new canvas sessions */
  defaultTool: Tool;
  /** Default stroke color in hex format for drawing operations */
  defaultStrokeColor: string;
  /** Default stroke width in pixels for drawing tools */
  defaultStrokeWidth: number;
  /** Dock anchor position for floating toolbar placement */
  dockAnchor: DockAnchor;
  /** Whether the floating dock is minimized/collapsed */
  isDockMinimized: boolean;
}

const defaultToolPreferences: ToolPreferences = {
  defaultTool: 'brush',
  defaultStrokeColor: '#FFFFFF',
  defaultStrokeWidth: 3,
  dockAnchor: 'bottom-center',
  isDockMinimized: false,
};

// =============================================================================
// SERVICE ADAPTER
// =============================================================================

const toolPreferencesAdapter: PreferencesServiceAdapter<ToolPreferences> = {
  fetchPreferences: () => userService.getToolPreferences(),
  updatePreferences: async (prefs) => {
    // The API expects full preferences, so we need to merge with current
    // This is handled by getting current and merging before sending
    await userService.updateToolPreferences(prefs as ToolPreferences);
  },
  getDefaultPreferences: () => defaultToolPreferences,
};

// =============================================================================
// HOOK
// =============================================================================

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
  const {
    preferences,
    isLoading,
    error,
    refreshPreferences,
    updatePreferences: updateToolPreferences,
    updatePreferencesSilent,
    resetError,
    isAuthenticated,
  } = usePreferencesService({
    service: toolPreferencesAdapter,
    serviceName: 'tool',
    fetchErrorMessage: 'Failed to load tool preferences',
    updateErrorMessage: 'Failed to save tool preferences',
  });

  // Convenience methods for updating individual preferences
  const updateTool = useCallback(
    async (tool: Tool) => {
      await updatePreferencesSilent({ defaultTool: tool });
    },
    [updatePreferencesSilent],
  );

  const updateStrokeColor = useCallback(
    async (color: string) => {
      await updatePreferencesSilent({ defaultStrokeColor: color });
    },
    [updatePreferencesSilent],
  );

  const updateStrokeWidth = useCallback(
    async (width: number) => {
      await updatePreferencesSilent({ defaultStrokeWidth: width });
    },
    [updatePreferencesSilent],
  );

  const updateDockAnchor = useCallback(
    async (anchor: DockAnchor) => {
      await updatePreferencesSilent({ dockAnchor: anchor });
    },
    [updatePreferencesSilent],
  );

  const updateDockMinimized = useCallback(
    async (minimized: boolean) => {
      await updatePreferencesSilent({ isDockMinimized: minimized });
    },
    [updatePreferencesSilent],
  );

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
    isAuthenticated,
  };
};
