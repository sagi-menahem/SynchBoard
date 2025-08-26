import { APP_ROUTES } from 'constants';

import React, { useState } from 'react';

import { Lock, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  EmailVerificationModal,
  ForgotPasswordModal,
  LoginForm,
  RegistrationForm,
} from 'components/auth';
import { Button, GuestLanguageSwitcher, LoadingOverlay } from 'components/common';
import { useAuth } from 'hooks/auth';
import { useOAuthCallback } from 'hooks/auth/useOAuthCallback';

import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const { isProcessing } = useOAuthCallback();

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
    <div className={styles.pageContent}>
      <div className={styles.languageSwitcherWrapper}>
        <GuestLanguageSwitcher />
      </div>
      
      {isProcessing && <LoadingOverlay message="Signing you in..." />}
      
      {!isProcessing && (
        <section className={styles.authSection}>
          <h1 className={styles.pageTitle}>
            <Lock size={20} />
            {t('authPage.pageTitle')}
          </h1>
          
          <div className={styles.authContainer}>
            {isLoginView ? (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>
                    <LogIn size={18} />
                    {t('loginForm.heading')}
                  </h2>
                </div>
                <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
                <div className={styles.authActions}>
                  <span className={styles.toggleText}>{t('authPage.promptToRegister')}</span>
                  <Button variant="secondary" onClick={toggleAuthMode}>
                    <UserPlus size={16} />
                    {t('authPage.switchToRegisterButton')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>
                    <UserPlus size={18} />
                    {t('registrationForm.heading')}
                  </h2>
                </div>
                <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
                <div className={styles.authActions}>
                  <span className={styles.toggleText}>{t('authPage.promptToLogin')}</span>
                  <Button variant="secondary" onClick={toggleAuthMode}>
                    <LogIn size={16} />
                    {t('authPage.switchToLoginButton')}
                  </Button>
                </div>
                <div className={styles.forgotPasswordSection}>
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowForgotPassword(true)}
                    className={styles.forgotPasswordButton}
                  >
                    {t('authPage.forgotPassword', 'Forgot Password?')}
                  </Button>
                </div>
              </>
            )}
          </div>
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
