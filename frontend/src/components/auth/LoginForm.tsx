import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
import { useLoginForm } from 'hooks/auth/forms';
import { oauthService } from 'services/oauthService';

import GoogleLoginButton from './GoogleLoginButton';

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
      <h2>{t('loginForm.heading')}</h2>

      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="login-email">{t('common.form.label.email')}</label>
        <Input
          id="login-email"
          name="email"
          type="email"
          required
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">{t('common.form.label.password')}</label>
        <PasswordInput
          id="login-password"
          name="password"
          required
          disabled={isPending}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className={styles.submitButton} disabled={isPending}>
        {isPending ? t('common.button.loggingIn') : t('loginForm.button')}
      </Button>

      <div style={{ margin: '1.5rem 0', textAlign: 'center', color: '#666' }}>
        <span style={{ padding: '0 1rem', backgroundColor: '#fff', fontSize: '0.875rem' }}>
          {t('loginForm.orContinueWith', 'or continue with')}
        </span>
        <div style={{ 
          height: '1px', 
          backgroundColor: '#e1e5e9', 
          margin: '-0.6rem 0 0 0',
          zIndex: -1,
          position: 'relative',
        }} />
      </div>

      <GoogleLoginButton 
        onClick={handleGoogleLogin} 
        disabled={isPending || isGoogleLoading} 
      />

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onForgotPassword}
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
          {t('loginForm.forgotPassword', 'Forgot Password?')}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
