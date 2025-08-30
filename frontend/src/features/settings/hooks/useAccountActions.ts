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
    await toast.promise(
      userService.changePassword(data),
      {
        loading: t('settings:loading.password.update'),
        success: t('settings:success.password.update'),
        error: t('settings:errors.password.update'),
      },
    );
  };

  const handleDeleteAccount = async () => {
    await toast.promise(
      userService.deleteAccount().then(() => {
        logout();
        void navigate(APP_ROUTES.AUTH);
      }),
      {
        loading: t('settings:loading.account.delete'),
        success: t('settings:success.account.delete'),
        error: t('settings:errors.account.delete'),
      },
    );
  };

  return {
    handleChangePassword,
    handleDeleteAccount,
  };
};