import React from 'react';

import { BaseAuthModal } from 'features/auth/ui';
import styles from 'features/auth/ui/CommonForm.module.scss';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from 'shared/ui';

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
  const { t } = useTranslation(['auth', 'common']);
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
      title={t('auth:forgotPassword.heading')}
      description={t('auth:forgotPassword.description')}
      onSubmit={handleSubmit}
      isPending={isPending}
      error={state.error}
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