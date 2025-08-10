import { useCallback } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/auth/useAuth';
import * as userService from 'services/userService';


export const useAccountManager = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleDeleteAccount = useCallback(async () => {
        try {
            await userService.deleteAccount();
            toast.success(t('success.account.delete'));
            logout();
            navigate(APP_ROUTES.AUTH);
        } catch (error) {
            logger.error('Failed to delete account:', error);
            throw error;
        }
    }, [t, logout, navigate]);

    return {
        handleDeleteAccount,
    };
};
