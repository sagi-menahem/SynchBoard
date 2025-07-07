// Located at: frontend/src/components/auth/LoginForm.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as authService from '../../services/authService';
import type { LoginRequest } from '../../types/user.types';
import { useAuth } from '../../hooks/useAuth';

const LoginForm: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const credentials: LoginRequest = { email, password };
        try {
            const response = await authService.login(credentials);
            login(response.token);
            alert('Login successful! You will be redirected soon.');
        } catch (err) {
            console.error('Login failed:', err);
            setError(t('loginForm.failedError'));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t('loginForm.heading')}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="login-email">{t('common.form.label.email')}</label>
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="login-password">{t('common.form.label.password')}</label>
                <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">{t('loginForm.button')}</button>
        </form>
    );
};

export default LoginForm;