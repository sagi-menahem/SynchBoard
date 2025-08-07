import { useCallback, useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import * as userService from 'services/userService';
import type { UpdateUserProfileRequest, UserProfile } from 'types/user.types';

export const useUserProfileManager = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(() => {
        setIsLoading(true);
        userService
            .getUserProfile()
            .then((userData) => setUser(userData))
            .catch((error) => console.error('Failed to fetch user profile:', error))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleUpdateProfile = useCallback(
        async (data: UpdateUserProfileRequest) => {
            try {
                const updatedUser = await userService.updateUserProfile(data);
                setUser(updatedUser);
                toast.success(t('success.profile.update'));
            } catch (error) {
                console.error('Failed to update profile:', error);
                throw error;
            }
        },
        [t]
    );

    return {
        user,
        isLoading,
        handleUpdateProfile,
        refetchUser: fetchUser,
    };
};
