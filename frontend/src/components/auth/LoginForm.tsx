// File: frontend/src/components/auth/LoginForm.tsx
import Button from 'components/common/Button';
import styles from 'components/common/Form.module.css';
import Input from 'components/common/Input';
import { useLoginForm } from 'hooks/auth/useLoginForm';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LoginForm: React.FC = () => {
    const { t } = useTranslation();
    const { email, password, isSubmitting, setEmail, setPassword, handleSubmit } = useLoginForm();

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{t('loginForm.heading')}</h2>

            <div className={styles.field}>
                <label htmlFor="login-email">{t('common.form.label.email')}</label>
                <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                />
            </div>

            <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? t('common.button.loggingIn') : t('loginForm.button')}
            </Button>
        </form>
    );
};

export default LoginForm;
