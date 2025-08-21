import { APP_ROUTES } from 'constants';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import * as userService from 'services/userService';


export const useAccountManager = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      toast.success(t('success.account.delete'));
      logout();
      navigate(APP_ROUTES.AUTH);
    } catch (error) {
      logger.error('Failed to delete account:', error);
      throw error;
    }
  };

  return {
    handleDeleteAccount,
  };
};
