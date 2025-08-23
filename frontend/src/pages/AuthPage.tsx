import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LoginForm, RegistrationForm } from 'components/auth';
import { Button } from 'components/common';
import { APP_ROUTES } from 'constants';

import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);

  const handleRegistrationSuccess = (email: string) => {
    navigate(`${APP_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`);
  };

  const toggleAuthMode = () => {
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
            <Button variant="secondary" onClick={toggleAuthMode} className={styles.toggleButton}>
              {t('authPage.switchToRegisterButton')}
            </Button>
          </p>
        </section>
      ) : (
        <section>
          <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
          <p className={styles.toggleText}>
            {t('authPage.promptToLogin')}{' '}
            <Button variant="secondary" onClick={toggleAuthMode} className={styles.toggleButton}>
              {t('authPage.switchToLoginButton')}
            </Button>
          </p>
        </section>
      )}
    </div>
  );
};

export default AuthPage;
