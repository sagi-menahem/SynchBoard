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
            <h1>{t('page_title')}</h1>

            {isLoginView ? (
                <section>
                    <LoginForm />
                    <p>
                        {t('login_prompt_to_register')}{' '}
                        <button onClick={() => setIsLoginView(false)}>
                            {t('login_switch_to_register_button')}
                        </button>
                    </p>
                </section>
            ) : (
                <section>
                    <RegisterForm />
                    <p>
                        {t('register_prompt_to_login')}{' '}
                        <button onClick={() => setIsLoginView(true)}>
                            {t('register_switch_to_login_button')}
                        </button>
                    </p>
                </section>
            )}
        </div>
    );
};

export default AuthPage;