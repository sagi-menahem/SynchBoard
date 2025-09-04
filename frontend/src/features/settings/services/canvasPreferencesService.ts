import * as userService from 'features/settings/services/userService';
import logger from 'shared/utils/logger';

/** Layout mode type defining different canvas layout configurations */
export type LayoutMode = 'focus-canvas' | 'balanced' | 'focus-chat';

/**
 * Interface defining canvas layout preferences for workspace customization.
 */
export interface CanvasPreferences {
  // Split ratio between canvas and chat areas (0-100 percentage)
  canvasChatSplitRatio: number;
  // Layout mode determining canvas/chat area focus and arrangement
  layoutMode: LayoutMode;
}

const DEFAULT_CANVAS_PREFERENCES: CanvasPreferences = {
  canvasChatSplitRatio: 70, // Default canvas to chat area ratio: 70% canvas, 30% chat
  layoutMode: 'balanced',
};

export const CanvasPreferencesService = {
  /**
   * Fetches canvas preferences from the server with error handling and transformation.
   * 
   * @returns Promise resolving to canvas preferences with split ratio and layout mode
   * @throws {Error} When preferences cannot be loaded from the server
   */
  async fetchPreferences(): Promise<CanvasPreferences> {
    try {
      const canvasPrefs = await userService.getCanvasPreferences();
      return {
        canvasChatSplitRatio: canvasPrefs.canvasChatSplitRatio,
        layoutMode: 'balanced',
      };
    } catch (error) {
      logger.error('Failed to fetch canvas preferences:', error);
      throw new Error('Failed to load canvas preferences');
    }
  },

  /**
   * Updates the canvas/chat split ratio on the server.
   * 
   * @param splitRatio - New split ratio value (0-100 percentage)
   * @throws {Error} When the split ratio update fails on the server
   */
  async updateSplitRatio(splitRatio: number): Promise<void> {
    try {
      await userService.updateCanvasPreferences({ canvasChatSplitRatio: splitRatio });
    } catch (error) {
      logger.error('Failed to update split ratio:', error);
      throw error;
    }
  },

  /**
   * Updates multiple canvas preferences on the server with selective field updates.
   * 
   * @param preferences - Partial canvas preferences object with fields to update
   * @throws {Error} When preference updates fail on the server
   */
  async updatePreferences(preferences: Partial<CanvasPreferences>): Promise<void> {
    try {
      // Only update split ratio if provided (layout mode not yet supported server-side)
      if (preferences.canvasChatSplitRatio !== undefined) {
        await userService.updateCanvasPreferences({
          canvasChatSplitRatio: preferences.canvasChatSplitRatio,
        });
      }
    } catch (error) {
      logger.error('Failed to update canvas preferences:', error);
      throw error;
    }
  },

  /**
   * Returns default canvas preferences for fallback and initialization purposes.
   * 
   * @returns Default canvas preferences with balanced layout and 70% canvas split
   */
  getDefaultPreferences(): CanvasPreferences {
    return { ...DEFAULT_CANVAS_PREFERENCES };
  },
};
