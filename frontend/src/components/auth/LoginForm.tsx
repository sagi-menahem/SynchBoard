import React, { useState } from 'react';

import { Lock, LogIn, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from 'components/common';
import { useLoginForm } from 'hooks/auth/forms';
import { oauthService } from 'services/oauthService';

import GoogleLoginButton from './GoogleLoginButton';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const { t } = useTranslation();
  const { state, submitAction, isPending } = useLoginForm();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    oauthService.redirectToGoogle();
  };

  return (
    <form action={submitAction} className={styles.form}>
      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="login-email">
          <Mail size={14} />
          {t('common.form.label.email')}
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          required
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">
          <Lock size={14} />
          {t('common.form.label.password')}
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
        {isPending ? t('common.button.loggingIn') : t('loginForm.button')}
      </Button>

      <div className={styles.divider}>
        <span className={styles.dividerText}>
          {t('loginForm.orContinueWith', 'or continue with')}
        </span>
      </div>

      <GoogleLoginButton 
        onClick={handleGoogleLogin} 
        disabled={isPending || isGoogleLoading} 
      />

      <div className={styles.forgotPasswordSection}>
        <Button
          type="button"
          variant="secondary"
          onClick={onForgotPassword}
          className={styles.forgotPasswordButton}
        >
          {t('loginForm.forgotPassword', 'Forgot Password?')}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
