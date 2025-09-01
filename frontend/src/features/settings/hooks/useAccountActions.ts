import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import type { ChangePasswordRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';

export const useAccountActions = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    try {
      toast.loading(t('settings:loading.password.update'));
      await userService.changePassword(data);
      toast.dismiss();
      toast.success(t('settings:success.password.update'));
    } catch (error) {
      toast.dismiss();
      // Don't show generic error - specific validation errors are already shown by apiClient
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast.loading(t('settings:loading.account.delete'));
      await userService.deleteAccount();
      logout();
      void navigate(APP_ROUTES.AUTH);
      toast.dismiss();
      toast.success(t('settings:success.account.delete'));
    } catch (error) {
      toast.dismiss();
      // Don't show generic error - specific validation errors are already shown by apiClient
      throw error;
    }
  };

  return {
    handleChangePassword,
    handleDeleteAccount,
  };
};