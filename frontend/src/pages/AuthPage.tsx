// Located at: frontend/src/pages/AuthPage.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../components/auth/RegisterForm';
import LoginForm from '../components/auth/LoginForm';

const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLoginView, setIsLoginView] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Optional: for a success message

    const handleRegistrationSuccess = () => {
        setIsLoginView(true); // Switch to the login view
        setShowSuccessMessage(true); // Show a success message to the user
    };

    return (
        <div>
            <h1>{t('authPage.pageTitle')}</h1>

            {/* Optional: Display a success message after registration */}
            {showSuccessMessage && (
                <p style={{ color: 'green' }}>
                    {t('registerForm.registrationSuccess')}
                </p>
            )}

            {isLoginView ? (
                <section>
                    <LoginForm />
                    <p>
                        {t('authPage.promptToRegister')}{' '}
                        <button onClick={() => {
                            setIsLoginView(false);
                            setShowSuccessMessage(false); // Hide message when switching back to register
                        }}>
                            {t('authPage.switchToRegisterButton')}
                        </button>
                    </p>
                </section>
            ) : (
                <section>
                    {/* Pass the function as a prop */}
                    <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
                    <p>
                        {t('authPage.promptToLogin')}{' '}
                        <button onClick={() => setIsLoginView(true)}>
                            {t('authPage.switchToLoginButton')}
                        </button>
                    </p>
                </section>
            )}
        </div>
    );
};

export default AuthPage;