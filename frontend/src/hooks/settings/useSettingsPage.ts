import { useState } from 'react';

import logger from 'utils/Logger';

import { useAccountManager } from 'hooks/settings/useAccountManager';
import { usePasswordManager } from 'hooks/settings/usePasswordManager';
import { useProfilePictureManager } from 'hooks/settings/useProfilePictureManager';
import { useUserProfileManager } from 'hooks/settings/useUserProfileManager';


export const useSettingsPage = () => {
    const [isPicDeleteConfirmOpen, setPicDeleteConfirmOpen] = useState(false);
    const [isAccountDeleteConfirmOpen, setAccountDeleteConfirmOpen] = useState(false);

    const { user, isLoading, handleUpdateProfile, refetchUser } = useUserProfileManager();
    const { handleChangePassword } = usePasswordManager();
    const { handleDeleteAccount } = useAccountManager();

    const { handlePictureUpload, handlePictureDelete } = useProfilePictureManager(() => {
        refetchUser();
    });

    const handlePictureUploadWithCleanup = async (file: File) => {
        try {
            await handlePictureUpload(file);
        } catch (error) {
            logger.error('Picture upload failed:', error);
            throw error;
        }
    };

    const handlePictureDeleteWithCleanup = async () => {
        try {
            await handlePictureDelete();
        } finally {
            setPicDeleteConfirmOpen(false);
        }
    };

    const handleDeleteAccountWithCleanup = async () => {
        try {
            await handleDeleteAccount();
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
        handlePictureUpload: handlePictureUploadWithCleanup,
        handlePictureDelete: handlePictureDeleteWithCleanup,
        handleDeleteAccount: handleDeleteAccountWithCleanup,
    };
};
