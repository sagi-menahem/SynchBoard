import { BaseAuthModal } from 'features/auth/ui';
import { KeyRound, Lock, Mail } from 'lucide-react';
import React, { startTransition, useActionState, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Input } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';

import { useForgotPasswordForm } from '../hooks/forms';
import * as authService from '../services/authService';

type ModalStep = 'STEP_EMAIL' | 'STEP_VERIFY';

interface ForgotPasswordModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback fired when modal should be closed */
  onClose: () => void;
  /** Callback fired when password has been successfully reset */
  onSuccess: () => void;
}

/**
 * Modal component for password reset flow with two steps:
 * 1. Enter email to receive reset code
 * 2. Enter reset code and new password to complete reset
 *
 * @param isOpen - Whether the modal is currently visible
 * @param onClose - Callback fired when modal should be closed
 * @param onSuccess - Callback fired when password has been successfully reset
 */
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation(['auth', 'common']);
  const [step, setStep] = useState<ModalStep>('STEP_EMAIL');
  const [email, setEmail] = useState('');

  // Step 1: Send reset code
  const handleEmailSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep('STEP_VERIFY');
  };

  const { submitAction: submitEmailAction, isPending: isEmailPending } =
    useForgotPasswordForm(handleEmailSuccess);

  // Step 2: Reset password with code
  const [resetError, submitResetAction, isResetPending] = useActionState(
    async (_prevState: string | null, formData: FormData) => {
      const resetCode = formData.get('resetCode') as string;
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (!resetCode || resetCode.length !== 6) {
        toast.error(t('auth:resetPassword.validation.codeRequired'));
        return t('auth:resetPassword.validation.codeRequired');
      }

      if (!newPassword || newPassword.length < 6) {
        toast.error(t('auth:validation.passwordMinLength'));
        return t('auth:validation.passwordMinLength');
      }

      if (newPassword !== confirmPassword) {
        toast.error(t('auth:validation.passwordMismatch'));
        return t('auth:validation.passwordMismatch');
      }

      try {
        await authService.resetPassword({ email, resetCode, newPassword });
        toast.success(t('auth:success.resetPassword'));
        onSuccess();
        handleClose();
        return null;
      } catch {
        toast.error(t('auth:errors.resetPassword'));
        return t('auth:errors.resetPassword');
      }
    },
    null,
  );

  const handleClose = () => {
    setStep('STEP_EMAIL');
    setEmail('');
    onClose();
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      submitEmailAction(formData);
    });
  };

  const handleResetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      submitResetAction(formData);
    });
  };

  if (step === 'STEP_EMAIL') {
    return (
      <BaseAuthModal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('auth:forgotPassword.heading')}
        description={t('auth:forgotPassword.description')}
        onSubmit={handleEmailSubmit}
        isPending={isEmailPending}
        submitButtonText={
          isEmailPending ? t('common:button.sending') : t('auth:forgotPassword.button')
        }
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
            disabled={isEmailPending}
            placeholder={t('auth:forgotPassword.placeholder.email')}
            autoComplete="email"
          />
        </div>
      </BaseAuthModal>
    );
  }

  // Step 2: Enter reset code and new password
  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('auth:resetPassword.heading')}
      description={t('auth:resetPassword.description', { email })}
      onSubmit={handleResetSubmit}
      isPending={isResetPending}
      submitButtonText={
        isResetPending ? t('common:button.submitting') : t('auth:resetPassword.button')
      }
      cancelButtonText={t('common:button.cancel')}
    >
      {resetError && <p className={styles.error}>{resetError}</p>}

      <div className={styles.field}>
        <label htmlFor="reset-code">
          <KeyRound size={14} />
          {t('auth:resetPassword.label.code')}
          <span className={styles.required}> *</span>
        </label>
        <Input
          id="reset-code"
          name="resetCode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          disabled={isResetPending}
          placeholder={t('auth:resetPassword.placeholder.code')}
          autoComplete="one-time-code"
        />
        <span className={styles.hint}>{t('auth:resetPassword.hint.code')}</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="new-password">
          <Lock size={14} />
          {t('auth:resetPassword.label.password')}
          <span className={styles.required}> *</span>
        </label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          minLength={6}
          required
          disabled={isResetPending}
          placeholder={t('auth:resetPassword.placeholder.password')}
          autoComplete="new-password"
        />
        <span className={styles.hint}>{t('auth:validation.passwordHint')}</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="confirm-password">
          <Lock size={14} />
          {t('auth:resetPassword.label.confirmPassword')}
          <span className={styles.required}> *</span>
        </label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          minLength={6}
          required
          disabled={isResetPending}
          placeholder={t('auth:resetPassword.placeholder.confirmPassword')}
          autoComplete="new-password"
        />
      </div>
    </BaseAuthModal>
  );
};

export default ForgotPasswordModal;
