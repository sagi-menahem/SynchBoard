import { useAuth } from 'features/auth/hooks';
import * as userService from 'features/settings/services/userService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants';

/**
 * Custom hook for managing user account lifecycle operations, specifically account deletion.
 * Handles the complete flow of account deletion including service calls, authentication cleanup,
 * and navigation redirection with proper user feedback through toast notifications.
 * Ensures secure logout and navigation to authentication flow after successful account deletion.
 * 
 * @returns Object containing account management handlers for destructive account operations
 */
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
      throw error;
    }
  };

  return {
    handleDeleteAccount,
  };
};
