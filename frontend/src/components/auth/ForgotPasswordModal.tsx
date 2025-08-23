import React from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input, Modal } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
import { useForgotPasswordForm } from 'hooks/auth/forms';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { state, submitAction, isPending } = useForgotPasswordForm(onSuccess);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ maxWidth: '400px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#fff' }}>
          {t('forgotPassword.heading', 'Reset Your Password')}
        </h2>
        <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
          {t('forgotPassword.description', 'Enter your email to receive a reset code')}
        </p>

        <form action={submitAction}>
          {state.error && (
            <div className={styles.error} role="alert" style={{ marginBottom: '1rem' }}>
              {state.error}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="forgot-email">
              {t('common.form.label.email', 'Email Address')}
              <span className={styles.required}> *</span>
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

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              {t('common.button.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common.button.sending', 'Sending...') : t('forgotPassword.button', 'Send Reset Code')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;