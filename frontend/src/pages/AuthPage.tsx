// Located at: frontend/src/pages/AuthPage.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../components/auth/RegisterForm';
import LoginForm from '../components/auth/LoginForm';

const AuthPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div>
            <h1>{t('authPage.pageTitle')}</h1>

            {isLoginView ? (
                <section>
                    <LoginForm />
                    <p>
                        {t('authPage.promptToRegister')}{' '}
                        <button onClick={() => setIsLoginView(false)}>
                            {t('authPage.switchToRegisterButton')}
                        </button>
                    </p>
                </section>
            ) : (
                <section>
                    <RegisterForm />
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