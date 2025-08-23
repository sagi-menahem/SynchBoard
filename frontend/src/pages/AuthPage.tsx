import { APP_ROUTES } from 'constants';

import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  EmailVerificationModal,
  ForgotPasswordModal,
  LoginForm,
  RegistrationForm,
} from 'components/auth';
import { Button } from 'components/common';
import { useAuth } from 'hooks/auth';

import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleRegistrationSuccess = (email: string) => {
    setPendingEmail(email);
    setShowEmailVerification(true);
  };

  const handleForgotPasswordSuccess = () => {
    setShowForgotPassword(false);
    setIsLoginView(true);
  };

  const handleEmailVerificationSuccess = (token: string) => {
    authLogin(token);
    setShowEmailVerification(false);
    navigate(APP_ROUTES.BOARD_LIST);
  };

  const toggleAuthMode = () => {
    setIsLoginView((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <h1>{t('authPage.pageTitle')}</h1>
      {isLoginView ? (
        <section>
          <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
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
          <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{ 
                background: 'transparent', 
                backgroundColor: 'transparent',
                border: 'none', 
                padding: '0.2em',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#8186ff',
                textDecoration: 'underline',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#6d72e8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8186ff';
              }}
            >
              {t('authPage.forgotPassword', 'Forgot Password?')}
            </button>
          </p>
        </section>
      )}

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={handleForgotPasswordSuccess}
      />

      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => {
          setShowEmailVerification(false);
          setPendingEmail('');
        }}
        email={pendingEmail}
        onSuccess={handleEmailVerificationSuccess}
      />

    </div>
  );
};

export default AuthPage;
