// File: frontend/src/components/auth/LoginForm.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import type { LoginRequest } from '../../types/user.types';
import { useAuth } from '../../hooks/useAuth';

import Button from '../common/Button';
import Input from '../common/Input';
import { APP_ROUTES } from '../../constants/routes.constants';
import { COLORS } from '../../constants/style.constants';

const LoginForm: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const credentials: LoginRequest = { email, password };
        try {
            const response = await authService.login(credentials);
            login(response.token);
            navigate(APP_ROUTES.BOARD_LIST);
        } catch (err) {
            console.error('Login failed:', err);
            setError(t('loginForm.failedError'));
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '300px' }}>
            <h2>{t('loginForm.heading')}</h2>
            {error && <p style={{ color: COLORS.ERROR }}>{error}</p>}

            <div>
                <label htmlFor="login-email">{t('common.form.label.email')}</label>
                <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div style={{ marginTop: '1rem' }}>
                <label htmlFor="login-password">{t('common.form.label.password')}</label>
                <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" style={{ marginTop: '1.5rem', width: '100%' }}>
                {t('loginForm.button')}
            </Button>
        </form>
    );
};

export default LoginForm;