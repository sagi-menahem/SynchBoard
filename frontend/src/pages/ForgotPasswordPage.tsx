import { APP_ROUTES } from 'constants';

import React from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button, Input } from 'components/common';
import commonFormStyles from 'components/common/CommonForm.module.css';
import { useForgotPasswordForm } from 'hooks/auth/forms';

import styles from './AuthPage.module.css';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onForgotPasswordSuccess = (email: string) => {
    navigate(`${APP_ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}`);
  };

  const { state, submitAction, isPending } = useForgotPasswordForm(onForgotPasswordSuccess);

  return (
    <div className={styles.container}>
      <h1>{t('forgotPassword.pageTitle', 'Forgot Password')}</h1>
      
      <section>
        <form action={submitAction} className={commonFormStyles.form}>
          <h2>{t('forgotPassword.heading', 'Reset Your Password')}</h2>
          
          <p className={commonFormStyles.description}>
            {t('forgotPassword.description', 'Enter your email address and we\'ll send you a 6-digit reset code to create a new password.')}
          </p>

          {state.error && (
            <div className={commonFormStyles.error} role="alert">
              {state.error}
            </div>
          )}

          <div className={commonFormStyles.field}>
            <label htmlFor="forgot-email">
              {t('common.form.label.email', 'Email Address')}
              <span className={commonFormStyles.required}> *</span>
            </label>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              required
              disabled={isPending}
              placeholder={t('forgotPassword.placeholder.email', 'Enter your email address')}
              autoComplete="email"
            />
          </div>

          <Button type="submit" className={commonFormStyles.submitButton} disabled={isPending}>
            {isPending ? t('common.button.sending', 'Sending...') : t('forgotPassword.button', 'Send Reset Code')}
          </Button>
        </form>

        <div className={commonFormStyles.additionalActions}>
          <p>
            {t('forgotPassword.rememberPassword', 'Remember your password?')}
          </p>
          
          <Button 
            variant="secondary" 
            onClick={() => navigate(APP_ROUTES.AUTH)}
            className={styles.toggleButton}
          >
            {t('forgotPassword.backToLogin', 'Back to Login')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;