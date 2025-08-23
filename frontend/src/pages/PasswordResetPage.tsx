import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from 'components/common';
import styles from './AuthPage.module.css';
import commonFormStyles from 'components/common/CommonForm.module.css';
import { useResetPasswordForm } from 'hooks/auth/forms';
import { APP_ROUTES } from 'constants';

const PasswordResetPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email');
  
  useEffect(() => {
    if (!email) {
      navigate(APP_ROUTES.FORGOT_PASSWORD);
      return;
    }
  }, [email, navigate]);

  const onResetPasswordSuccess = () => {
    navigate(APP_ROUTES.AUTH);
  };

  const { state, submitAction, isPending } = useResetPasswordForm(email || '', onResetPasswordSuccess);

  if (!email) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1>{t('resetPassword.pageTitle', 'Reset Password')}</h1>
      
      <section>
        <form action={submitAction} className={commonFormStyles.form}>
          <h2>{t('resetPassword.heading', 'Create New Password')}</h2>
          
          <p className={commonFormStyles.description}>
            {t('resetPassword.description', 'Enter the 6-digit reset code sent to {{email}} and create a new password.', { email })}
          </p>

          {state.error && (
            <div className={commonFormStyles.error} role="alert">
              {state.error}
            </div>
          )}

          <div className={commonFormStyles.field}>
            <label htmlFor="reset-code">
              {t('resetPassword.label.code', 'Reset Code')}
              <span className={commonFormStyles.required}> *</span>
            </label>
            <Input
              id="reset-code"
              name="resetCode"
              type="text"
              required
              disabled={isPending}
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder={t('resetPassword.placeholder.code', '123456')}
              autoComplete="one-time-code"
              style={{ textAlign: 'center', fontSize: '1.2em', letterSpacing: '0.2em' }}
            />
            <small className={commonFormStyles.fieldHint}>
              {t('resetPassword.hint.code', 'Enter the 6-digit code from your email')}
            </small>
          </div>

          <div className={commonFormStyles.field}>
            <label htmlFor="new-password">
              {t('resetPassword.label.newPassword', 'New Password')}
              <span className={commonFormStyles.required}> *</span>
            </label>
            <PasswordInput
              id="new-password"
              name="newPassword"
              required
              disabled={isPending}
              autoComplete="new-password"
              placeholder={t('resetPassword.placeholder.newPassword', 'Enter your new password')}
            />
            <small className={commonFormStyles.fieldHint}>
              {t('resetPassword.hint.password', 'Enter your new password')}
            </small>
          </div>

          <div className={commonFormStyles.field}>
            <label htmlFor="confirm-password">
              {t('resetPassword.label.confirmPassword', 'Confirm New Password')}
              <span className={commonFormStyles.required}> *</span>
            </label>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              required
              disabled={isPending}
              autoComplete="new-password"
              placeholder={t('resetPassword.placeholder.confirmPassword', 'Confirm your new password')}
            />
          </div>

          <Button type="submit" className={commonFormStyles.submitButton} disabled={isPending}>
            {isPending ? t('common.button.resetting', 'Resetting...') : t('resetPassword.button', 'Reset Password')}
          </Button>
        </form>

        <div className={commonFormStyles.additionalActions}>
          <p>
            {t('resetPassword.didNotReceiveCode', 'Didn\'t receive the code?')}
          </p>
          
          <Button 
            variant="secondary" 
            onClick={() => navigate(APP_ROUTES.FORGOT_PASSWORD)}
            className={styles.toggleButton}
          >
            {t('resetPassword.requestNewCode', 'Request New Code')}
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => navigate(APP_ROUTES.AUTH)}
            className={styles.toggleButton}
            style={{ marginTop: '0.5rem' }}
          >
            {t('resetPassword.backToLogin', 'Back to Login')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PasswordResetPage;