// File: frontend/src/hooks/useSettingsPage.ts
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as userService from '../services/userService';
import type { UserProfile, UpdateUserProfileRequest, ChangePasswordRequest } from '../types/user.types';
import { AxiosError } from 'axios';
import { useAuth } from './useAuth';
import { APP_ROUTES } from '../constants/routes.constants';

export const useSettingsPage = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPicDeleteConfirmOpen, setPicDeleteConfirmOpen] = useState(false);
    const [isAccountDeleteConfirmOpen, setAccountDeleteConfirmOpen] = useState(false);


    const fetchUser = useCallback(async () => {
        try {
            setIsLoading(true);
            const userData = await userService.getUserProfile();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            toast.error(t('settingsPage.loadError'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleUpdateProfile = async (data: UpdateUserProfileRequest) => {
        try {
            const updatedUser = await userService.updateUserProfile(data);
            setUser(updatedUser);
            toast.success(t('settingsPage.updateSuccess'));
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error(t('settingsPage.updateError'));
            throw error;
        }
    };

    const handleChangePassword = async (data: ChangePasswordRequest) => {
        try {
            await userService.changePassword(data);
            toast.success(t('settingsPage.passwordUpdateSuccess'));
        } catch (error) {
            console.error("Failed to change password:", error);
            const errorMessage = error instanceof AxiosError && error.response?.data?.message
                ? error.response.data.message
                : t('settingsPage.passwordUpdateError');
            toast.error(errorMessage);
            throw error;
        }
    };

    const handlePictureUpload = async (file: File) => {
        try {
            const updatedUser = await userService.uploadProfilePicture(file);
            setUser(updatedUser);
            toast.success(t('settingsPage.pictureUpdateSuccess'));
        } catch (error) {
            console.error('Failed to upload picture:', error);
            toast.error(t('settingsPage.pictureUploadError'));
        }
    };

    const handlePictureDelete = async () => {
        try {
            const updatedUser = await userService.deleteProfilePicture();
            setUser(updatedUser);
            toast.success(t('settingsPage.pictureDeleteSuccess'));
        } catch (error) {
            console.error('Failed to delete picture:', error);
            toast.error('Failed to delete picture.');
        } finally {
            setPicDeleteConfirmOpen(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await userService.deleteAccount();
            toast.success(t('settingsPage.accountDeleteSuccess'));
            logout();
            navigate(APP_ROUTES.AUTH);
        } catch (error) {
            console.error('Failed to delete account:', error);
            toast.error(t('settingsPage.accountDeleteError'));
        } finally {
            setAccountDeleteConfirmOpen(false);
        }
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