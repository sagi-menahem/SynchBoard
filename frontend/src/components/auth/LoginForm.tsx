// File: frontend/src/components/auth/LoginForm.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Input from '../common/Input';
import { useLoginForm } from '../../hooks/useLoginForm';
import styles from './AuthForm.module.css';

const LoginForm: React.FC = () => {
    const { t } = useTranslation();
    const { email, password, error, setEmail, setPassword, handleSubmit } = useLoginForm();

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{t('loginForm.heading')}</h2>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.field}>
                <label htmlFor="login-email">{t('common.form.label.email')}</label>
                <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="login-password">{t('common.form.label.password')}</label>
                <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" className={styles.submitButton}>
                {t('loginForm.button')}
            </Button>
        </form>
    );
};

export default LoginForm;