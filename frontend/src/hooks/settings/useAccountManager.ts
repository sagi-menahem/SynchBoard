import { APP_ROUTES } from 'constants';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'hooks/auth';
import * as userService from 'services/userService';


export const useAccountManager = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    await toast.promise(
      userService.deleteAccount().then(() => {
        logout();
        navigate(APP_ROUTES.AUTH);
      }),
      {
        loading: t('loading.account.delete'),
        success: t('settingsPage.accountDeleteSuccess'),
        error: t('errors.account.delete'),
      },
    );
  };

  return {
    handleDeleteAccount,
  };
};
