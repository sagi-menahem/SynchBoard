// Located at: frontend/src/components/auth/RegisterForm.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as authService from '../../services/authService';
import type { RegisterRequest } from '../../types/user.types';
import axios from 'axios';

const RegisterForm: React.FC = () => {
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
            const response = await authService.register(formData);
            alert('Registration Successful! You can now log in.');
            console.log(response);
        } catch (err) {
            console.error('Registration failed', err);
            let errorMessage = t('registration_failed_error');
            if (axios.isAxiosError(err) && err.response?.data) {
                // If the backend sends a specific error message, use it
                errorMessage = err.response.data;
            }
            setError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('register_heading')}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="register-email">{t('form_label_email')}</label>
                <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-password">{t('form_label_password')}</label>
                <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-firstName">{t('form_label_firstName')}</label>
                <input
                    id="register-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-lastName">{t('form_label_lastName')}</label>
                <input
                    id="register-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-phoneNumber">{t('form_label_phoneNumber')}</label>
                <input
                    id="register-phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                />
            </div>
            <button type="submit">{t('register_button')}</button>
        </form>
    );
};

export default RegisterForm;