// File: frontend/src/hooks/useRegisterForm.ts

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import * as authService from '../services/authService';
import type { RegisterRequest } from '../types/user.types';

export const useRegisterForm = (onRegistrationSuccess: () => void) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const formData: RegisterRequest = { email, password, firstName, lastName, phoneNumber };
        try {
            await authService.register(formData);
            onRegistrationSuccess();
        } catch (err) {
            console.error('Registration failed', err);
            let errorMessage = t('registerForm.failedError');
            if (axios.isAxiosError(err) && err.response?.data) {
                errorMessage = err.response.data.message || err.response.data;
            }
            setError(errorMessage);
        }
    };

    return {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        error,
        setEmail,
        setPassword,
        setFirstName,
        setLastName,
        setPhoneNumber,
        handleSubmit,
    };
};