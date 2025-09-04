import * as userService from 'features/settings/services/userService';
import type { UserProfile } from 'features/settings/types/UserTypes';
import logger from 'shared/utils/logger';

export interface UserBoardPreferences {
  boardBackgroundSetting: string;
}

const DEFAULT_BOARD_PREFERENCES: UserBoardPreferences = {
  boardBackgroundSetting: '#282828',
};

export const UserPreferencesService = {
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

  async updatePreferences(preferences: Partial<UserBoardPreferences>): Promise<void> {
    try {
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

  getDefaultPreferences(): UserBoardPreferences {
    return { ...DEFAULT_BOARD_PREFERENCES };
  },
};
