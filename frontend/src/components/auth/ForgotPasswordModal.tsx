import React from 'react';

import { useTranslation } from 'react-i18next';

import { BaseAuthModal, Input } from 'components/common';
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
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('forgotPassword.heading', 'Reset Your Password')}
      description={t('forgotPassword.description', 'Enter your email to receive a reset code')}
      onSubmit={submitAction}
      isPending={isPending}
      error={state.error}
      submitButtonText={isPending ? t('common.button.sending', 'Sending...') : t('forgotPassword.button', 'Send Reset Code')}
      cancelButtonText={t('common.button.cancel', 'Cancel')}
    >
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
    </BaseAuthModal>
  );
};

export default ForgotPasswordModal;