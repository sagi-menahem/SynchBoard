// File: frontend/src/pages/AuthPage.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../components/auth/RegisterForm';
import LoginForm from '../components/auth/LoginForm';
import Button from '../components/common/Button';
import { COLORS } from '../constants/style.constants';

const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLoginView, setIsLoginView] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleRegistrationSuccess = () => {
        setIsLoginView(true);
        setShowSuccessMessage(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>{t('authPage.pageTitle')}</h1>
            {showSuccessMessage && (
                <p style={{ color: COLORS.SUCCESS }}>
                    {t('registerForm.registrationSuccess')}
                </p>
            )}

            {isLoginView ? (
                <section>
                    <LoginForm />
                    <p>
                        {t('authPage.promptToRegister')}{' '}
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setIsLoginView(false);
                                setShowSuccessMessage(false);
                            }}
                            style={{ background: 'none', border: 'none', color: COLORS.PRIMARY_LINK, padding: '0.2em', textDecoration: 'underline' }}
                        >
                            {t('authPage.switchToRegisterButton')}
                        </Button>
                    </p>
                </section>
            ) : (
                <section>
                    <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
                    <p>
                        {t('authPage.promptToLogin')}{' '}
                        <Button 
                            variant="secondary" 
                            onClick={() => setIsLoginView(true)}
                            style={{ background: 'none', border: 'none', color: COLORS.PRIMARY_LINK, padding: '0.2em', textDecoration: 'underline' }}
                        >
                            {t('authPage.switchToLoginButton')}
                        </Button>
                    </p>
                </section>
            )}
        </div>
    );
};

export default AuthPage;