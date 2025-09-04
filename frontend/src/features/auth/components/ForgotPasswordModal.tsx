import { BaseAuthModal } from 'features/auth/ui';
import { Mail } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';

import { useForgotPasswordForm } from '../hooks/forms';

interface ForgotPasswordModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback fired when modal should be closed */
  onClose: () => void;
  /** Callback fired when password reset email is successfully sent */
  onSuccess: (email: string) => void;
}

/**
 * Modal component for requesting a password reset via email.
 * Provides a simple form to enter email address and sends reset instructions
 * to the user's email inbox.
 *
 * @param isOpen - Whether the modal is currently visible
 * @param onClose - Callback fired when modal should be closed
 * @param onSuccess - Callback fired when password reset email is successfully sent
 */
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation(['auth', 'common']);
  const { submitAction, isPending } = useForgotPasswordForm(onSuccess);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Extract form data and submit via form action
    const formData = new FormData(event.currentTarget);
    submitAction(formData);
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('auth:forgotPassword.heading')}
      description={t('auth:forgotPassword.description')}
      onSubmit={handleSubmit}
      isPending={isPending}
      submitButtonText={isPending ? t('common:button.sending') : t('auth:forgotPassword.button')}
      cancelButtonText={t('common:button.cancel')}
    >
      <div className={styles.field}>
        <label htmlFor="forgot-email">
          <Mail size={14} />
          {t('common:form.label.email')}
          <span className={styles.required}> *</span>
        </label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder={t('auth:forgotPassword.placeholder.email')}
          autoComplete="email"
        />
      </div>
    </BaseAuthModal>
  );
};

export default ForgotPasswordModal;
