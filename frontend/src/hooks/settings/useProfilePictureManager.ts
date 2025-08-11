import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as userService from 'services/userService';
import type { UserProfile } from 'types/UserTypes';


export const useProfilePictureManager = (onSuccess?: (updatedUser: UserProfile) => void) => {
    const { t } = useTranslation();

    const handlePictureUpload = useCallback(
        async (file: File) => {
            try {
                const updatedUser = await userService.uploadProfilePicture(file);
                toast.success(t('success.picture.update'));
                onSuccess?.(updatedUser);
                return updatedUser;
            } catch (error) {
                logger.error('Failed to upload picture:', error);
                throw error;
            }
        },
        [t, onSuccess]
    );

    const handlePictureDelete = useCallback(async () => {
        try {
            const updatedUser = await userService.deleteProfilePicture();
            toast.success(t('success.picture.delete'));
            onSuccess?.(updatedUser);
            return updatedUser;
        } catch (error) {
            logger.error('Failed to delete picture:', error);
            throw error;
        }
    }, [t, onSuccess]);

    return {
        handlePictureUpload,
        handlePictureDelete,
    };
};
