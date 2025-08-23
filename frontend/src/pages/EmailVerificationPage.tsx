import { APP_ROUTES } from 'constants';

import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button, Input } from 'components/common';
import commonFormStyles from 'components/common/CommonForm.module.css';
import { useAuth } from 'hooks/auth';
import { useResendVerificationCode, useVerifyEmailForm } from 'hooks/auth/forms';

import styles from './AuthPage.module.css';

const EmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();
  
  const email = searchParams.get('email');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  useEffect(() => {
    if (!email) {
      navigate(APP_ROUTES.AUTH);
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onVerificationSuccess = (token: string) => {
    authLogin(token);
    navigate(APP_ROUTES.BOARD_LIST);
  };

  const { state, submitAction, isPending } = useVerifyEmailForm(email || '', onVerificationSuccess);
  const { resendVerificationCode } = useResendVerificationCode(email || '');

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    const result = await resendVerificationCode();
    if (result.success) {
      setResendCooldown(60);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1>{t('verifyEmail.pageTitle', 'Verify Your Email')}</h1>
      
      <section>
        <form action={submitAction} className={commonFormStyles.form}>
          <h2>{t('verifyEmail.heading', 'Enter Verification Code')}</h2>
          
          <p className={commonFormStyles.description}>
            {t('verifyEmail.description', 'We\'ve sent a 6-digit verification code to {{email}}. Please enter it below to complete your registration.', { email })}
          </p>

          {state.error && (
            <div className={commonFormStyles.error} role="alert">
              {state.error}
            </div>
          )}

          <div className={commonFormStyles.field}>
            <label htmlFor="verification-code">
              {t('verifyEmail.label.code', 'Verification Code')}
              <span className={commonFormStyles.required}> *</span>
            </label>
            <Input
              id="verification-code"
              name="verificationCode"
              type="text"
              required
              disabled={isPending}
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder={t('verifyEmail.placeholder.code', '123456')}
              autoComplete="one-time-code"
              style={{ textAlign: 'center', fontSize: '1.2em', letterSpacing: '0.2em' }}
            />
            <small className={commonFormStyles.fieldHint}>
              {t('verifyEmail.hint.code', 'Enter the 6-digit code from your email')}
            </small>
          </div>

          <Button type="submit" className={commonFormStyles.submitButton} disabled={isPending}>
            {isPending ? t('common.button.verifying', 'Verifying...') : t('verifyEmail.button', 'Verify Email')}
          </Button>
        </form>

        <div className={commonFormStyles.additionalActions}>
          <p>
            {t('verifyEmail.didNotReceive', 'Didn\'t receive the code?')}
          </p>
          
          <Button 
            variant="secondary" 
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
            className={styles.toggleButton}
          >
            {resendCooldown > 0 
              ? t('verifyEmail.resend.cooldown', 'Resend in {{seconds}}s', { seconds: resendCooldown })
              : t('verifyEmail.resend.button', 'Resend Code')
            }
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => navigate(APP_ROUTES.AUTH)}
            className={styles.toggleButton}
            style={{ marginTop: '0.5rem' }}
          >
            {t('verifyEmail.backToAuth', 'Back to Login')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EmailVerificationPage;