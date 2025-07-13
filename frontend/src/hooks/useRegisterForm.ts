// File: frontend/src/hooks/useRegisterForm.ts
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import type { RegisterRequest } from '../types/user.types';

export const useRegisterForm = (onRegistrationSuccess: () => void) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true); // Set submitting to true
        const formData: RegisterRequest = { email, password, firstName, lastName, phoneNumber };
        try {
            await authService.register(formData);
            toast.success(t('registerForm.registrationSuccess'));
            onRegistrationSuccess();
        } catch (err) {
            console.error('Registration failed', err);
            let errorMessage = t('registerForm.failedError');
            if (axios.isAxiosError(err) && err.response?.data) {
                errorMessage = err.response.data.message || err.response.data;
            }
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false); // Reset on success or error
        }
    };

    return {
        email, password, firstName, lastName, phoneNumber, isSubmitting,
        setEmail, setPassword, setFirstName, setLastName, setPhoneNumber,
        handleSubmit,
    };
};