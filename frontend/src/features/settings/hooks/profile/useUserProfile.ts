import * as userService from 'features/settings/services/userService';
import type { UpdateUserProfileRequest, UserProfile } from 'features/settings/types/UserTypes';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'shared/utils/logger';

/**
 * Custom hook for comprehensive user profile management with editing capabilities and media handling.
 * Provides complete profile lifecycle management including fetching, editing, updating, and media operations.
 * Implements inline editing state management with form validation, optimistic updates, and proper error handling.
 * Handles profile picture upload and deletion with proper loading states and user feedback through toast notifications.
 * Includes minimum loading delays for better perceived performance and smooth user experience transitions.
 * 
 * @returns Object containing user profile data, editing state, form handlers, and media management functions
 */
export const useUserProfile = () => {
  const { t } = useTranslation(['settings', 'common']);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    firstName: '',
    lastName: '',
    gender: 'male',
    phoneNumber: '',
  });

  const fetchUser = useCallback(() => {
    setIsLoading(true);
    // Track timing for minimum loading delay to prevent flashing
    const startTime = Date.now();
    const minDelay = 200;

    userService
      .getUserProfile()
      .then((userData: UserProfile) => {
        setUser(userData);
        // Initialize form data with current user profile values
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
        // Ensure minimum loading time for smooth UX
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingDelay);
      });
  }, [t]);

  const handleUpdateProfile = useCallback(
    async (data: UpdateUserProfileRequest) => {
      try {
        toast.loading(t('settings:loading.profile.update'));
        const updatedUser = await userService.updateUserProfile(data);
        setUser(updatedUser);
        setIsEditing(false);
        toast.dismiss();
        toast.success(t('settings:success.profile.update'));
        return updatedUser;
      } catch (error) {
        toast.dismiss();
        throw error;
      }
    },
    [t],
  );

  const handlePictureUpload = useCallback(
    async (file: File) => {
      const updatedUser = await toast.promise(userService.uploadProfilePicture(file), {
        loading: t('settings:loading.picture.upload'),
        success: t('settings:success.picture.update'),
        error: t('settings:errors.picture.upload'),
      });
      setUser(updatedUser);
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
    setUser(updatedUser);
    return updatedUser;
  }, [t]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const startEditing = useCallback(() => setIsEditing(true), []);

  const cancelEditing = useCallback(() => {
    // Reset form data to current user values when canceling edit
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
    user,
    isLoading,

    isEditing,
    formData,

    handleUpdateProfile,
    refetchUser: fetchUser,

    handlePictureUpload,
    handlePictureDelete,

    onInputChange,
    startEditing,
    cancelEditing,
    stopEditing,
  };
};
