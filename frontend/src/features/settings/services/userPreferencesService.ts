import * as userService from 'features/settings/services/userService';
import type { UserProfile } from 'features/settings/types/UserTypes';
import logger from 'shared/utils/logger';

/**
 * Interface defining user board preferences for visual customization.
 */
export interface UserBoardPreferences {
  // Background color setting for boards in hex format or color name
  boardBackgroundSetting: string;
}

const DEFAULT_BOARD_PREFERENCES: UserBoardPreferences = {
  boardBackgroundSetting: '--board-bg-midnight-blue',
};

export const UserPreferencesService = {
  /**
   * Fetches user board preferences from the server via user profile with fallback defaults.
   * 
   * @returns Promise resolving to user board preferences with background settings
   * @throws {Error} When preferences cannot be loaded from the server
   */
  async fetchPreferences(): Promise<UserBoardPreferences> {
    try {
      const profile: UserProfile = await userService.getUserProfile();
      return {
        boardBackgroundSetting:
          profile.boardBackgroundSetting ?? DEFAULT_BOARD_PREFERENCES.boardBackgroundSetting,
      };
    } catch (error) {
      logger.error('Failed to fetch user board preferences:', error);
      throw new Error('Failed to load board preferences');
    }
  },

  /**
   * Updates the board background setting on the server.
   * 
   * @param background - New background color in hex format or color name
   * @throws {Error} When the background update fails on the server
   */
  async updateBoardBackground(background: string): Promise<void> {
    try {
      await userService.updateUserPreferences({
        boardBackgroundSetting: background,
      });
    } catch (error) {
      logger.error('Failed to update board background preference:', error);
      throw error;
    }
  },

  /**
   * Updates multiple user board preferences on the server with selective field updates.
   * 
   * @param preferences - Partial board preferences object with fields to update
   * @throws {Error} When preference updates fail on the server
   */
  async updatePreferences(preferences: Partial<UserBoardPreferences>): Promise<void> {
    try {
      // Only update background setting if provided
      if (preferences.boardBackgroundSetting !== undefined) {
        await userService.updateUserPreferences({
          boardBackgroundSetting: preferences.boardBackgroundSetting,
        });
      }
    } catch (error) {
      logger.error('Failed to update board preferences:', error);
      throw error;
    }
  },

  /**
   * Returns default board preferences for fallback and initialization purposes.
   * 
   * @returns Default board preferences with dark background setting
   */
  getDefaultPreferences(): UserBoardPreferences {
    return { ...DEFAULT_BOARD_PREFERENCES };
  },
};
