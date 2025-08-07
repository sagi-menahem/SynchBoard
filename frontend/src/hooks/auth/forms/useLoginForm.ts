import { useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/auth/useAuth';
import * as authService from 'services/authService';
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

        authService
            .login(credentials)
            .then((response) => {
                toast.success(t('loginForm.loginSuccess'));
                login(response.token);
                navigate(APP_ROUTES.BOARD_LIST);
            })
            .catch((err) => {
                console.error('Login failed:', err);
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
