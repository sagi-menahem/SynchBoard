// File: frontend/src/hooks/useRegisterForm.ts
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as authService from 'services/authService';
import type { RegisterRequest } from 'types/user.types';

export const useRegisterForm = (onRegistrationSuccess: () => void) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData: RegisterRequest = { email, password, firstName, lastName, phoneNumber };

        authService.register(formData)
            .then(() => {
                toast.success(t('registerForm.registrationSuccess'));
                onRegistrationSuccess();
            })
            .catch(err => {
                console.error('Registration failed', err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return {
        email, password, firstName, lastName, phoneNumber, isSubmitting,
        setEmail, setPassword, setFirstName, setLastName, setPhoneNumber,
        handleSubmit,
    };
};