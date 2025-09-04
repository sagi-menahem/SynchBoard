import React, { useState } from 'react';

import { Lock, LogIn, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input, PasswordInput } from 'shared/ui';

import { useLoginForm } from '../hooks/forms';
import { useAuth } from '../hooks/useAuth';

import GoogleLoginButton from './GoogleLoginButton';
import styles from './LoginForm.module.scss';

interface LoginFormProps {
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const { t } = useTranslation(['auth', 'common']);
  const { redirectToGoogle } = useAuth();
  const { submitAction, isPending } = useLoginForm();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    redirectToGoogle();
  };

  return (
    <form action={submitAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="login-email">
          <Mail size={14} />
          {t('common:form.label.email')}
        </label>
        <Input id="login-email" name="email" type="email" required disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">
          <Lock size={14} />
          {t('common:form.label.password')}
        </label>
        <PasswordInput
          id="login-password"
          name="password"
          required
          disabled={isPending}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" variant="primary" disabled={isPending} className={styles.submitButton}>
        <LogIn size={16} />
        {isPending ? t('common:button.loggingIn') : t('auth:loginForm.button')}
      </Button>

      <div className={styles.divider}>
        <span className={styles.dividerText}>{t('auth:loginForm.orContinueWith')}</span>
      </div>

      <GoogleLoginButton onClick={handleGoogleLogin} disabled={isPending ?? isGoogleLoading} />

      <div className={styles.secondaryActionsContainer}>
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className={styles.forgotPasswordButton}
        >
          {t('auth:loginForm.forgotPassword')}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
