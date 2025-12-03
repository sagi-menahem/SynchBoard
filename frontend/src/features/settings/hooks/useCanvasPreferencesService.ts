import { useAuth } from 'features/auth/hooks';
import { useSocketSubscription } from 'features/websocket/hooks/useSocket';
import type { UserUpdateDTO } from 'features/websocket/types/WebSocketTypes';
import { useCallback } from 'react';
import { WEBSOCKET_TOPICS } from 'shared/constants/ApiConstants';
import {
  usePreferencesService,
  type PreferencesServiceAdapter,
} from 'shared/hooks/usePreferencesService';

import {
  CanvasPreferencesService,
  type CanvasPreferences,
  type LayoutMode,
} from '../services/canvasPreferencesService';

// =============================================================================
// SERVICE ADAPTER
// =============================================================================

const canvasPreferencesAdapter: PreferencesServiceAdapter<CanvasPreferences> = {
  fetchPreferences: () => CanvasPreferencesService.fetchPreferences(),
  updatePreferences: (prefs) => CanvasPreferencesService.updatePreferences(prefs),
  getDefaultPreferences: () => CanvasPreferencesService.getDefaultPreferences(),
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Custom hook for managing canvas layout preferences with real-time synchronization and error handling.
 * Provides comprehensive state management for canvas split ratios, layout modes, and preference persistence.
 * Integrates with WebSocket subscriptions for real-time preference updates across multiple clients.
 * Implements optimistic updates with rollback functionality and proper authentication-aware operations.
 *
 * @returns Object containing current preferences, loading states, and preference update functions
 */
export function useCanvasPreferencesService() {
  const {
    preferences,
    isLoading,
    error,
    refreshPreferences,
    updatePreferences: updateCanvasPreferences,
    updatePreferencesSilent,
    resetError,
    isAuthenticated,
  } = usePreferencesService({
    service: canvasPreferencesAdapter,
    serviceName: 'canvas',
    fetchErrorMessage: 'Failed to load canvas preferences',
    updateErrorMessage: 'Failed to save canvas preferences',
  });

  const { userEmail } = useAuth();

  // Convenience method for updating split ratio
  const updateSplitRatio = useCallback(
    async (splitRatio: number) => {
      await updatePreferencesSilent({ canvasChatSplitRatio: splitRatio });
    },
    [updatePreferencesSilent],
  );

  // Local-only layout mode update (not persisted to server)
  const updateLayoutMode = useCallback(async (_layoutMode: LayoutMode) => {
    // Layout mode is typically handled locally, not persisted
    // If persistence is needed, use updateCanvasPreferences({ layoutMode })
  }, []);

  // Handle real-time canvas settings updates from other clients
  const handleCanvasSettingsUpdate = useCallback(
    (message: UserUpdateDTO) => {
      if (message.updateType === 'CANVAS_SETTINGS_CHANGED') {
        void refreshPreferences();
      }
    },
    [refreshPreferences],
  );

  // Subscribe to user topic for real-time updates
  useSocketSubscription(
    userEmail ? WEBSOCKET_TOPICS.USER(userEmail) : '',
    handleCanvasSettingsUpdate,
    'user',
  );

  return {
    preferences,
    isLoading,
    error,
    updateSplitRatio,
    updateLayoutMode,
    updateCanvasPreferences,
    refreshPreferences,
    resetError,
    isAuthenticated,
  };
}

// Re-export types for convenience
export type { CanvasPreferences, LayoutMode } from '../services/canvasPreferencesService';
