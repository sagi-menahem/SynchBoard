
import React, { useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import { useOAuthCallback } from 'features/auth/hooks/useOAuthCallback';
import { GuestLanguageSwitcher } from 'features/settings/ui';
import { LogIn, UserPlus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { Button, PageLoader, PageTransition } from 'shared/ui';

import {
  EmailVerificationModal,
  ForgotPasswordModal,
  LoginForm,
  RegistrationForm,
} from '../components';


import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common']);
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
    void navigate(APP_ROUTES.BOARD_LIST);
  };

  const toggleAuthMode = () => {
    setIsLoginView((prev) => !prev);
  };

  return (
    <PageTransition>
      <div className={styles.pageContent}>
        
        <div className={styles.languageSwitcherCorner}>
          <GuestLanguageSwitcher />
        </div>
        
        {isProcessing && <PageLoader message={t('auth:signingInMessage')} />}
        
        {!isProcessing && (
          <section className={styles.authSection}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.pageTitle}>
              <Users size={20} />
              {t('auth:authPage.pageTitle')}
            </h1>
          </div>
          
          <div className={styles.authContainer}>
            {isLoginView ? (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>
                    <LogIn size={18} />
                    {t('auth:loginForm.heading')}
                  </h2>
                </div>
                <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
                <div className={styles.authActions}>
                  <span className={styles.toggleText}>{t('auth:authPage.promptToRegister')}</span>
                  <Button variant="secondary" onClick={toggleAuthMode}>
                    <UserPlus size={16} />
                    {t('auth:authPage.switchToRegisterButton')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>
                    <UserPlus size={18} />
                    {t('auth:registerForm.heading')}
                  </h2>
                </div>
                <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
                <div className={styles.authActions}>
                  <span className={styles.toggleText}>{t('auth:authPage.promptToLogin')}</span>
                  <Button variant="secondary" onClick={toggleAuthMode}>
                    <LogIn size={16} />
                    {t('auth:authPage.switchToLoginButton')}
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
    </PageTransition>
  );
};

export default AuthPage;
