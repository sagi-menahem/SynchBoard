
import * as userService from 'features/settings/services/userService';
import type { UpdateUserProfileRequest, UserProfile } from 'features/settings/types/UserTypes';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

export const useUserProfile = () => {
  const { t } = useTranslation(['settings', 'common']);

  // Data state (from useUserProfileManager)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editing state (from useProfileEditing)
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    firstName: '',
    lastName: '',
    gender: 'male',
    phoneNumber: '',
  });

  // Consolidated data fetching
  const fetchUser = useCallback(() => {
    setIsLoading(true);
    const startTime = Date.now();
    const minDelay = 200;

    userService
      .getUserProfile()
      .then((userData: UserProfile) => {
        setUser(userData);
        // Auto-sync editing form data
        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName ?? '',
          gender: userData.gender,
          phoneNumber: userData.phoneNumber ?? '',
        });
      })
      .catch((error: unknown) => {
        logger.error('Failed to fetch user profile:', error);
        toast.error(t('settings:errors.profile.fetch'));
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingDelay);
      });
  }, [t]);

  // Profile update (enhanced to stop editing)
  const handleUpdateProfile = useCallback(
    async (data: UpdateUserProfileRequest) => {
      try {
        toast.loading(t('settings:loading.profile.update'));
        const updatedUser = await userService.updateUserProfile(data);
        setUser(updatedUser);
        setIsEditing(false); // Auto-stop editing on success
        toast.dismiss();
        toast.success(t('settings:success.profile.update'));
        return updatedUser;
      } catch (error) {
        toast.dismiss();
        // Don't show generic error - specific validation errors are already shown by apiClient
        throw error;
      }
    },
    [t],
  );

  // Picture actions (with direct state update)
  const handlePictureUpload = useCallback(
    async (file: File) => {
      const updatedUser = await toast.promise(userService.uploadProfilePicture(file), {
        loading: t('settings:loading.picture.upload'),
        success: t('settings:success.picture.update'),
        error: t('settings:errors.picture.upload'),
      });
      setUser(updatedUser); // Direct state update, no refetch needed
      return updatedUser;
    },
    [t],
  );

  const handlePictureDelete = useCallback(async () => {
    const updatedUser = await toast.promise(userService.deleteProfilePicture(), {
      loading: t('settings:loading.picture.delete'),
      success: t('settings:success.picture.delete'),
      error: t('settings:errors.picture.delete'),
    });
    setUser(updatedUser); // Direct state update, no refetch needed
    return updatedUser;
  }, [t]);

  // Editing actions
  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const startEditing = useCallback(() => setIsEditing(true), []);

  const cancelEditing = useCallback(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName ?? '',
        gender: user.gender,
        phoneNumber: user.phoneNumber ?? '',
      });
    }
    setIsEditing(false);
  }, [user]);

  const stopEditing = useCallback(() => setIsEditing(false), []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    // Data state
    user,
    isLoading,

    // Editing state
    isEditing,
    formData,

    // Data actions
    handleUpdateProfile,
    refetchUser: fetchUser,

    // Picture actions
    handlePictureUpload,
    handlePictureDelete,

    // Editing actions
    onInputChange,
    startEditing,
    cancelEditing,
    stopEditing,
  };
};
