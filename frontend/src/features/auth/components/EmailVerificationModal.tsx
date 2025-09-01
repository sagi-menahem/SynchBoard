import React, { useEffect, useState } from 'react';

import { Hash, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';

import { useResendVerificationCode, useVerifyEmailForm } from '../hooks/forms';

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
  const { t } = useTranslation(['auth', 'common']);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { submitAction, isPending } = useVerifyEmailForm(email, onSuccess);
  const { resendVerificationCode } = useResendVerificationCode(email);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }
    
    const result = await resendVerificationCode();
    if (result.success) {
      setResendCooldown(60);
    }
  };

  const resendActions = (
    <div className={styles.additionalActions} style={{ paddingTop: '1rem', borderTop: '1px solid #444' }}>
      <p style={{ color: '#ccc', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        {t('auth:verifyEmail.didNotReceive')}
      </p>
      <Button 
        variant="secondary" 
        onClick={handleResendCode}
        disabled={resendCooldown > 0}
        style={{ fontSize: '0.875rem' }}
      >
        {resendCooldown > 0 
          ? t('auth:verifyEmail.resend.cooldown', { seconds: resendCooldown })
          : t('auth:verifyEmail.resend.button')
        }
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer} style={{ maxWidth: '400px' }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Mail size={20} />
            {t('auth:verifyEmail.heading')}
          </h2>
        </div>
        
        <p className={styles.modalDescription}>
          {t('auth:verifyEmail.description')} <strong style={{ color: '#fff' }}>{email}</strong>
        </p>

        <form action={submitAction} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="verification-code">
              <Hash size={14} />
              {t('auth:verifyEmail.label.code')}
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
              placeholder={t('auth:verifyEmail.placeholder.code')}
              autoComplete="one-time-code"
              style={{ textAlign: 'center', fontSize: '1.2em', letterSpacing: '0.2em' }}
            />
            <small style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              {t('auth:verifyEmail.hint.code')}
            </small>
          </div>

          <div className={styles.buttonGroup}>
            <Button 
              type="button" 
              onClick={onClose} 
              disabled={isPending} 
              variant="secondary"
            >
              {t('common:button.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              variant="primary"
            >
              {isPending ? t('common:button.verifying') : t('auth:verifyEmail.button')}
            </Button>
          </div>
        </form>

        {resendActions}
      </div>
    </Modal>
  );
};

export default EmailVerificationModal;