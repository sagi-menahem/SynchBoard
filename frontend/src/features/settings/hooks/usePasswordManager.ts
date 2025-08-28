import * as UserService from 'features/settings/services/userService';
import type { ChangePasswordRequest } from 'features/settings/types/UserTypes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';



export const usePasswordManager = () => {
  const { t } = useTranslation();

  const handleChangePassword = async (data: ChangePasswordRequest) => {
    await toast.promise(
      UserService.changePassword(data),
      {
        loading: t('loading.password.update'),
        success: t('success.password.update'),
        error: t('errors.password.update'),
      },
    );
  };

  return {
    handleChangePassword,
  };
};
