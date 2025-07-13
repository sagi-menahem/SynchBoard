// File: frontend/src/pages/AuthPage.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../components/auth/RegisterForm';
import LoginForm from '../components/auth/LoginForm';
import Button from '../components/common/Button';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLoginView, setIsLoginView] = useState(true);
    // const [showSuccessMessage, setShowSuccessMessage] = useState(false); // No longer needed

    const handleRegistrationSuccess = () => {
        setIsLoginView(true);
        // setShowSuccessMessage(true); // No longer needed
    };
    
    const toggleView = () => {
        setIsLoginView(prev => !prev);
    };

    return (
        <div className={styles.container}>
            <h1>{t('authPage.pageTitle')}</h1>
            {/* Success message is removed from here */}

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