import { useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { APP_ROUTES } from 'constants/RoutesConstants';
import { useAuth } from 'hooks/auth/useAuth';
import * as authService from 'services/AuthService';
import type { LoginRequest } from 'types/user.types';


export const useLoginForm = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const credentials: LoginRequest = { email, password };

        logger.debug('Login form submission for user:', email);

        authService
            .login(credentials)
            .then((response) => {
                logger.info('Login successful for user:', email);
                toast.success(t('loginForm.loginSuccess'));
                login(response.token);
                navigate(APP_ROUTES.BOARD_LIST);
            })
            .catch((err) => {
                logger.error('Login failed for user:', err, { email });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return {
        email,
        password,
        isSubmitting,
        setEmail,
        setPassword,
        handleSubmit,
    };
};
