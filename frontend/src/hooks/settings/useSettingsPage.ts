// File: frontend/src/hooks/useSettingsPage.ts
import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/useAuth';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as userService from 'services/userService';
import type { ChangePasswordRequest, UpdateUserProfileRequest, UserProfile } from 'types/user.types';

export const useSettingsPage = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPicDeleteConfirmOpen, setPicDeleteConfirmOpen] = useState(false);
    const [isAccountDeleteConfirmOpen, setAccountDeleteConfirmOpen] = useState(false);

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

    const handleUpdateProfile = async (data: UpdateUserProfileRequest) => {
        try {
            const updatedUser = await userService.updateUserProfile(data);
            setUser(updatedUser);
            toast.success(t('success.profile.update'));
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    };

    const handleChangePassword = async (data: ChangePasswordRequest) => {
        try {
            await userService.changePassword(data);
            toast.success(t('success.password.update'));
        } catch (error) {
            console.error('Failed to change password:', error);
            throw error;
        }
    };

    const handlePictureUpload = (file: File) => {
        userService
            .uploadProfilePicture(file)
            .then((updatedUser) => {
                setUser(updatedUser);
                toast.success(t('success.picture.update'));
            })
            .catch((error) => console.error('Failed to upload picture:', error));
    };

    const handlePictureDelete = () => {
        userService
            .deleteProfilePicture()
            .then((updatedUser) => {
                setUser(updatedUser);
                toast.success(t('success.picture.delete'));
            })
            .catch((error) => console.error('Failed to delete picture:', error))
            .finally(() => setPicDeleteConfirmOpen(false));
    };

    const handleDeleteAccount = () => {
        userService
            .deleteAccount()
            .then(() => {
                toast.success(t('settingsPage.accountDeleteSuccess'));
                logout();
                navigate(APP_ROUTES.AUTH);
            })
            .catch((error) => console.error('Failed to delete account:', error))
            .finally(() => setAccountDeleteConfirmOpen(false));
    };

    return {
        user,
        isLoading,
        isPicDeleteConfirmOpen,
        setPicDeleteConfirmOpen,
        isAccountDeleteConfirmOpen,
        setAccountDeleteConfirmOpen,
        handleUpdateProfile,
        handleChangePassword,
        handlePictureUpload,
        handlePictureDelete,
        handleDeleteAccount,
    };
};
