import * as UserService from 'features/settings/services/userService';
import type { ChangePasswordRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';



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
      // Don't show generic error - specific validation errors are already shown by apiClient
      throw error;
    }
  };

  return {
    handleChangePassword,
  };
};
