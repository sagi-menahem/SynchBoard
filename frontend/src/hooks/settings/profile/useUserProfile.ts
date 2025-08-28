import { useCallback, useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as userService from 'services/userService';
import type { UpdateUserProfileRequest, UserProfile } from 'types/UserTypes';

export const useUserProfile = () => {
  const { t } = useTranslation();
  
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
      .then((userData) => {
        setUser(userData);
        // Auto-sync editing form data
        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          gender: userData.gender,
          phoneNumber: userData.phoneNumber || '',
        });
      })
      .catch((error) => {
        logger.error('Failed to fetch user profile:', error);
        toast.error(t('errors.profile.fetch'));
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
      const promise = userService.updateUserProfile(data).then((updatedUser) => {
        setUser(updatedUser);
        setIsEditing(false); // Auto-stop editing on success
        return updatedUser;
      });

      await toast.promise(promise, {
        loading: t('loading.profile.update'),
        success: t('success.profile.update'),
        error: t('errors.profile.update'),
      });
    },
    [t],
  );

  // Picture actions (with direct state update)
  const handlePictureUpload = useCallback(async (file: File) => {
    const updatedUser = await toast.promise(
      userService.uploadProfilePicture(file),
      {
        loading: t('loading.picture.upload'),
        success: t('success.picture.update'),
        error: t('errors.picture.upload'),
      },
    );
    setUser(updatedUser); // Direct state update, no refetch needed
    return updatedUser;
  }, [t]);

  const handlePictureDelete = useCallback(async () => {
    const updatedUser = await toast.promise(
      userService.deleteProfilePicture(),
      {
        loading: t('loading.picture.delete'),
        success: t('success.picture.delete'),
        error: t('errors.picture.delete'),
      },
    );
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
        lastName: user.lastName || '',
        gender: user.gender,
        phoneNumber: user.phoneNumber || '',
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