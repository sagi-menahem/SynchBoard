import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';

export const useAccountManager = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { logout } = useAuth();
  const navigate = useNavigate();

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
    handleDeleteAccount,
  };
};
