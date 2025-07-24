// File: frontend/src/pages/AuthPage.tsx
import LoginForm from 'components/auth/LoginForm';
import RegisterForm from 'components/auth/RegisterForm';
import Button from 'components/common/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLoginView, setIsLoginView] = useState(true);

    const handleRegistrationSuccess = () => {
        setIsLoginView(true);
    };

    const toggleView = () => {
        setIsLoginView((prev) => !prev);
    };

    return (
        <div className={styles.container}>
            <h1>{t('authPage.pageTitle')}</h1>
            {isLoginView ? (
                <section>
                    <LoginForm />
                    <p className={styles.toggleText}>
                        {t('authPage.promptToRegister')}{' '}
                        <Button variant="secondary" onClick={toggleView} className={styles.toggleButton}>
                            {t('authPage.switchToRegisterButton')}
                        </Button>
                    </p>
                </section>
            ) : (
                <section>
                    <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
                    <p className={styles.toggleText}>
                        {t('authPage.promptToLogin')}{' '}
                        <Button variant="secondary" onClick={toggleView} className={styles.toggleButton}>
                            {t('authPage.switchToLoginButton')}
                        </Button>
                    </p>
                </section>
            )}
        </div>
    );
};

export default AuthPage;
