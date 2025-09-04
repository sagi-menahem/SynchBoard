import * as UserService from 'features/settings/services/userService';
import type { ChangePasswordRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for managing user password change operations with comprehensive user feedback.
 * Provides secure password update functionality with loading states and toast notifications.
 * Handles service layer communication and error propagation while maintaining consistent UX patterns.
 * Integrates with localization system for internationalized feedback messages.
 * 
 * @returns Object containing password management handlers with proper error handling
 */
export const usePasswordManager = () => {
  const { t } = useTranslation(['settings', 'common']);

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    try {
      toast.loading(t('settings:loading.password.update'));
      await UserService.changePassword(data);
      toast.dismiss();
      toast.success(t('settings:success.password.update'));
    } catch (error) {
      toast.dismiss();
      throw error;
    }
  };

  return {
    handleChangePassword,
  };
};
