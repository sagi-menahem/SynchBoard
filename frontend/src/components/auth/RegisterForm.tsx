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
            alert(t('registerForm.registrationSuccess'));

            //TODO move to login Form after success register.
            console.log(response);
        } catch (err) {
            console.error('Registration failed', err);
            let errorMessage = t('registerForm.failedError');
            if (axios.isAxiosError(err) && err.response?.data) {
                errorMessage = err.response.data;
            }
            setError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('registerForm.heading')}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="register-email">{t('common.form.label.email')}</label>
                <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-password">{t('common.form.label.password')}</label>
                <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-firstName">{t('common.form.label.firstName')}</label>
                <input
                    id="register-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-lastName">{t('common.form.label.lastName')}</label>
                <input
                    id="register-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="register-phoneNumber">{t('common.form.label.phoneNumber')}</label>
                <input
                    id="register-phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                />
            </div>
            <button type="submit">{t('registerForm.button')}</button>
        </form>
    );
};

export default RegisterForm;