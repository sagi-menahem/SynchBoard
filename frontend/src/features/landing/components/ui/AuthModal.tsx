import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';
import {
  EmailVerificationModal,
  ForgotPasswordModal,
  GoogleOneTap,
  LoginForm,
  RegistrationForm,
} from 'features/auth/components';
import { useAuth } from 'features/auth/hooks';
import type { AuthResponse } from 'features/settings/types/UserTypes';
import { LogIn, UserPlus, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { useIsMobile } from 'shared/hooks';
import { Button } from 'shared/ui';
import { Drawer } from 'vaul';

import styles from './AuthModal.module.scss';

const ANIMATION_DURATION = 200; // ms - matches CSS animation duration

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Auth modal component that shows login/registration forms.
 * Desktop: Modal overlay with glass morphism styling (CSS animations).
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

  // Track visibility for exit animation
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle open/close with animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      setIsLoginView(true);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, ANIMATION_DURATION);
  }, [onClose]);

  const handleRegistrationSuccess = useCallback(
    (emailOrToken: string | AuthResponse) => {
      if (typeof emailOrToken === 'string') {
        setPendingEmail(emailOrToken);
        setShowEmailVerification(true);
      } else {
        authLogin(emailOrToken.token);
        handleClose();
        void navigate(APP_ROUTES.BOARD_LIST);
      }
    },
    [authLogin, navigate, handleClose]
  );

  const handleForgotPasswordSuccess = useCallback(
    (token: string) => {
      authLogin(token);
      setShowForgotPassword(false);
      handleClose();
      void navigate(APP_ROUTES.BOARD_LIST);
    },
    [authLogin, navigate, handleClose]
  );

  const handleEmailVerificationSuccess = useCallback(
    (token: string) => {
      authLogin(token);
      setShowEmailVerification(false);
      handleClose();
      void navigate(APP_ROUTES.BOARD_LIST);
    },
    [authLogin, navigate, handleClose]
  );

  const toggleAuthMode = useCallback(() => {
    setIsLoginView((prev) => !prev);
  }, []);

  // Handle escape key to close modal (desktop only)
  useEffect(() => {
    if (isMobile || !isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isVisible, handleClose]);

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

  // Desktop: Use CSS animated modal
  if (!isVisible) return null;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={clsx(styles.modalOverlay, isClosing && styles.closing)}
      onClick={handleClose}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('landing:auth.modalTitle')}</h2>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        {content}
      </div>
    </div>
  );
};

export default AuthModal;
