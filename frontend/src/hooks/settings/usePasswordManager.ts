import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { UserService } from 'services';
import logger from 'utils/Logger';

import type { ChangePasswordRequest } from 'types/UserTypes';


export const usePasswordManager = () => {
    const { t } = useTranslation();

    const handleChangePassword = useCallback(
        async (data: ChangePasswordRequest) => {
            try {
                await UserService.changePassword(data);
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
