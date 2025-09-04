import * as userService from 'features/settings/services/userService';
import logger from 'shared/utils/logger';

export type LayoutMode = 'focus-canvas' | 'balanced' | 'focus-chat';

export interface CanvasPreferences {
  canvasChatSplitRatio: number;
  layoutMode: LayoutMode;
}

const DEFAULT_CANVAS_PREFERENCES: CanvasPreferences = {
  canvasChatSplitRatio: 70,
  layoutMode: 'balanced',
};

export const CanvasPreferencesService = {
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

  async updateSplitRatio(splitRatio: number): Promise<void> {
    try {
      await userService.updateCanvasPreferences({ canvasChatSplitRatio: splitRatio });
    } catch (error) {
      logger.error('Failed to update split ratio:', error);
      throw error;
    }
  },

  async updatePreferences(preferences: Partial<CanvasPreferences>): Promise<void> {
    try {
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

  getDefaultPreferences(): CanvasPreferences {
    return { ...DEFAULT_CANVAS_PREFERENCES };
  },
};
