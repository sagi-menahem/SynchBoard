import * as UserService from 'features/settings/services/userService';
import type { ChangePasswordRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';



export const usePasswordManager = () => {
  const { t } = useTranslation(['settings', 'common']);

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    await toast.promise(
      UserService.changePassword(data),
      {
        loading: t('settings:loading.password.update'),
        success: t('settings:success.password.update'),
        error: t('settings:errors.password.update'),
      },
    );
  };

  return {
    handleChangePassword,
  };
};
