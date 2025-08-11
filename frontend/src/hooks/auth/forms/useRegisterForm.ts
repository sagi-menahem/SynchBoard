import { useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import logger from 'utils/logger';

import * as authService from 'services/authService';
import type { RegisterRequest } from 'types/UserTypes';


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

        logger.debug('Registration form submission for user:', email);

        authService
            .register(formData)
            .then(() => {
                logger.info('Registration successful for user:', email);
                toast.success(t('registerForm.registrationSuccess'));
                onRegistrationSuccess();
            })
            .catch((err) => {
                logger.error('Registration failed for user:', err, { email });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        isSubmitting,
        setEmail,
        setPassword,
        setFirstName,
        setLastName,
        setPhoneNumber,
        handleSubmit,
    };
};
