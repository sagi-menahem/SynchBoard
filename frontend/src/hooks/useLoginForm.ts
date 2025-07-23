// File: frontend/src/hooks/useLoginForm.ts
import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from 'services/authService';
import type { LoginRequest } from 'types/user.types';

export const useLoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const credentials: LoginRequest = { email, password };

        authService.login(credentials)
            .then(response => {
                login(response.token);
                navigate(APP_ROUTES.BOARD_LIST);
            })
            .catch(err => {
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