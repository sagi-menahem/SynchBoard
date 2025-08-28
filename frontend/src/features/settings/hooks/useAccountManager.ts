
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
    await toast.promise(
      userService.deleteAccount().then(() => {
        logout();
        navigate(APP_ROUTES.AUTH);
      }),
      {
        loading: t('settings:loading.account.delete'),
        success: t('settings:success.account.delete'),
        error: t('settings:errors.account.delete'),
      },
    );
  };

  return {
    handleDeleteAccount,
  };
};
