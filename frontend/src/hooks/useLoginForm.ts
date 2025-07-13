// File: frontend/src/hooks/useLoginForm.ts

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import { useAuth } from './useAuth';
import { APP_ROUTES } from '../constants/routes.constants';
import type { LoginRequest } from '../types/user.types';

export const useLoginForm = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true); // Set submitting to true
        const credentials: LoginRequest = { email, password };
        try {
            const response = await authService.login(credentials);
            login(response.token);
            navigate(APP_ROUTES.BOARD_LIST);
        } catch (err) {
            console.error('Login failed:', err);
            toast.error(t('loginForm.failedError'));
        } finally {
            setIsSubmitting(false); // Reset on success or error
        }
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