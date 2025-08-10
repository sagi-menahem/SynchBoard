import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as userService from 'services/userService';
import type { ChangePasswordRequest } from 'types/user.types';


export const usePasswordManager = () => {
    const { t } = useTranslation();

    const handleChangePassword = useCallback(
        async (data: ChangePasswordRequest) => {
            try {
                await userService.changePassword(data);
                toast.success(t('success.password.update'));
            } catch (error) {
                logger.error('Failed to change password:', error);
                throw error;
            }
        },
        [t]
    );

    return {
        handleChangePassword,
    };
};
