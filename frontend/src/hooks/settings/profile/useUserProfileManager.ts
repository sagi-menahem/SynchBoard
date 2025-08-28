import { useCallback, useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as userService from 'services/userService';
import type { UpdateUserProfileRequest, UserProfile } from 'types/UserTypes';


export const useUserProfileManager = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(() => {
    setIsLoading(true);
    
    const startTime = Date.now();
    const minDelay = 200;
    
    userService
      .getUserProfile()
      .then((userData) => setUser(userData))
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

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdateProfile = useCallback(
    async (data: UpdateUserProfileRequest) => {
      const promise = userService.updateUserProfile(data).then((updatedUser) => {
        setUser(updatedUser);
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

  return {
    user,
    isLoading,
    handleUpdateProfile,
    refetchUser: fetchUser,
  };
};
