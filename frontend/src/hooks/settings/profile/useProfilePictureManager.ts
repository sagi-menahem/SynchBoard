import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import * as userService from 'services/userService';
import type { UserProfile } from 'types/UserTypes';


export const useProfilePictureManager = (onSuccess?: (updatedUser: UserProfile) => void) => {
  const { t } = useTranslation();

  const handlePictureUpload = async (file: File) => {
    const updatedUser = await toast.promise(
      userService.uploadProfilePicture(file),
      {
        loading: t('loading.picture.upload'),
        success: t('success.picture.update'),
        error: t('errors.picture.upload'),
      },
    );
    onSuccess?.(updatedUser);
    return updatedUser;
  };

  const handlePictureDelete = async () => {
    const updatedUser = await toast.promise(
      userService.deleteProfilePicture(),
      {
        loading: t('loading.picture.delete'),
        success: t('success.picture.delete'),
        error: t('errors.picture.delete'),
      },
    );
    onSuccess?.(updatedUser);
    return updatedUser;
  };

  return {
    handlePictureUpload,
    handlePictureDelete,
  };
};
