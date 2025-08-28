import React from 'react';

import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BaseAuthModal, Input } from 'shared/ui';
import styles from 'shared/ui/CommonForm.module.css';

import { useForgotPasswordForm } from '../hooks/forms';

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    submitAction(formData);
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('forgotPassword.heading', 'Reset Your Password')}
      description={t('forgotPassword.description', 'Enter your email to receive a reset code')}
      onSubmit={handleSubmit}
      isPending={isPending}
      error={state.error}
      submitButtonText={isPending ? t('common.button.sending', 'Sending...') : t('forgotPassword.button', 'Send Reset Code')}
      cancelButtonText={t('common.button.cancel', 'Cancel')}
    >
      <div className={styles.field}>
        <label htmlFor="forgot-email">
          <Mail size={14} />
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