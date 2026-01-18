import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  EmailVerificationModal,
  ForgotPasswordModal,
  GoogleOneTap,
  LoginForm,
  RegistrationForm,
} from 'features/auth/components';
import { useAuth } from 'features/auth/hooks';
import type { AuthResponse } from 'features/settings/types/UserTypes';
import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, UserPlus, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { useIsMobile } from 'shared/hooks';
import { Button } from 'shared/ui';
import { Drawer } from 'vaul';

import styles from './AuthModal.module.scss';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Auth modal component that shows login/registration forms.
 * Desktop: Modal overlay with glass morphism styling.
 * Mobile: Bottom sheet drawer using Vaul for smooth interactions.
 */
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['landing', 'auth']);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const isMobile = useIsMobile();
  const [isLoginView, setIsLoginView] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Reset to login view when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoginView(true);
    }
  }, [isOpen]);

  const handleRegistrationSuccess = useCallback(
    (emailOrToken: string | AuthResponse) => {
      if (typeof emailOrToken === 'string') {
        setPendingEmail(emailOrToken);
        setShowEmailVerification(true);
      } else {
        authLogin(emailOrToken.token);
        onClose();
        void navigate(APP_ROUTES.BOARD_LIST);
      }
    },
    [authLogin, navigate, onClose],
  );

  const handleForgotPasswordSuccess = useCallback(
    (token: string) => {
      authLogin(token);
      setShowForgotPassword(false);
      onClose();
      void navigate(APP_ROUTES.BOARD_LIST);
    },
    [authLogin, navigate, onClose],
  );

  const handleEmailVerificationSuccess = useCallback(
    (token: string) => {
      authLogin(token);
      setShowEmailVerification(false);
      onClose();
      void navigate(APP_ROUTES.BOARD_LIST);
    },
    [authLogin, navigate, onClose],
  );

  const toggleAuthMode = useCallback(() => {
    setIsLoginView((prev) => !prev);
  }, []);

  const content = (
    <div className={styles.authContent}>
      <GoogleOneTap />
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${isLoginView ? styles.active : ''}`}
          onClick={() => setIsLoginView(true)}
          type="button"
        >
          <LogIn size={16} />
          {t('landing:auth.loginTab')}
        </button>
        <button
          className={`${styles.tab} ${!isLoginView ? styles.active : ''}`}
          onClick={() => setIsLoginView(false)}
          type="button"
        >
          <UserPlus size={16} />
          {t('landing:auth.registerTab')}
        </button>
      </div>

      <div className={styles.formContainer}>
        {isLoginView ? (
          <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
        ) : (
          <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
        )}
      </div>

      <div className={styles.switchPrompt}>
        <span className={styles.switchText}>
          {isLoginView ? t('auth:authPage.promptToRegister') : t('auth:authPage.promptToLogin')}
        </span>
        <Button variant="secondary-glass" onClick={toggleAuthMode} className={styles.switchButton}>
          {isLoginView ? (
            <>
              <UserPlus size={16} />
              {t('auth:authPage.switchToRegisterButton')}
            </>
          ) : (
            <>
              <LogIn size={16} />
              {t('auth:authPage.switchToLoginButton')}
            </>
          )}
        </Button>
      </div>

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

  // Mobile: Use Vaul drawer
  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()} shouldScaleBackground={false} dismissible>
        <Drawer.Portal>
          <Drawer.Overlay className={styles.drawerOverlay} />
          <Drawer.Content className={styles.drawerContent}>
            <Drawer.Handle className={styles.drawerHandle} />
            <Drawer.Title className={styles.drawerTitle}>{t('landing:auth.modalTitle')}</Drawer.Title>
            <VisuallyHidden.Root asChild>
              <Drawer.Description>Sign in or create an account</Drawer.Description>
            </VisuallyHidden.Root>
            <div className={styles.drawerBody}>{content}</div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // Desktop: Use animated modal
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t('landing:auth.modalTitle')}</h2>
              <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
