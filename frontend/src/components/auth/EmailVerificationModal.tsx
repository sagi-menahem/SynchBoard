import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { BaseAuthModal, Button, Input } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
import { useResendVerificationCode, useVerifyEmailForm } from 'hooks/auth/forms';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: (token: string) => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [resendCooldown, setResendCooldown] = useState(0);

  const { state, submitAction, isPending } = useVerifyEmailForm(email, onSuccess);
  const { resendVerificationCode } = useResendVerificationCode(email);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    const result = await resendVerificationCode();
    if (result.success) {
      setResendCooldown(60);
    }
  };

  const resendActions = (
    <div style={{ paddingTop: '1rem', borderTop: '1px solid #444', textAlign: 'center' }}>
      <p style={{ color: '#ccc', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        {t('verifyEmail.didNotReceive', 'Didn\'t receive the code?')}
      </p>
      <Button 
        variant="secondary" 
        onClick={handleResendCode}
        disabled={resendCooldown > 0}
        style={{ fontSize: '0.875rem' }}
      >
        {resendCooldown > 0 
          ? t('verifyEmail.resend.cooldown', 'Resend in {{seconds}}s', { seconds: resendCooldown })
          : t('verifyEmail.resend.button', 'Resend Code')
        }
      </Button>
    </div>
  );

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('verifyEmail.heading', 'Check Your Email')}
      description={
        <>
          {t('verifyEmail.description', 'Enter the 6-digit code sent to')} <strong style={{ color: '#fff' }}>{email}</strong>
        </>
      }
      onSubmit={submitAction}
      isPending={isPending}
      error={state.error}
      submitButtonText={isPending ? t('common.button.verifying', 'Verifying...') : t('verifyEmail.button', 'Verify Email')}
      cancelButtonText={t('common.button.cancel', 'Cancel')}
      additionalActions={resendActions}
    >
      <div className={styles.field}>
        <label htmlFor="verification-code">
          {t('verifyEmail.label.code', 'Verification Code')}
          <span className={styles.required}> *</span>
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
        <small style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          {t('verifyEmail.hint.code', 'Enter the 6-digit code from your email')}
        </small>
      </div>
    </BaseAuthModal>
  );
};

export default EmailVerificationModal;