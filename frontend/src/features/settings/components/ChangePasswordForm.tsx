import type { ChangePasswordRequest } from 'features/settings/types/UserTypes';
import { Save } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from 'shared/constants/AppConstants';
import { Button, PasswordInput } from 'shared/ui';
import logger from 'shared/utils/logger';

import styles from './ChangePasswordForm.module.scss';

/**
 * Properties for the ChangePasswordForm component defining form submission handler.
 */
interface ChangePasswordFormProps {
  /** Async function to handle password change submission with validation data */
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
}

/**
 * Secure password change form component with comprehensive validation and user feedback.
 * Implements client-side password validation, confirmation matching, and secure submission handling.
 * Provides synchronized password visibility toggle across all fields for enhanced user experience.
 * Includes proper form validation, error handling, and loading states for security operations.
 *
 * @param onSubmit - Async function to handle validated password change data submission
 */
const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation(['settings', 'common']);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handlePasswordFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate password length against application security requirements
    if (newPassword.length < APP_CONFIG.MIN_PASSWORD_LENGTH) {
      logger.warn('[ChangePasswordForm] Password validation failed - too short');
      toast.error(t('settings:page.passwordTooShort'));
      return;
    }

    // Ensure password confirmation matches to prevent user input errors
    if (newPassword !== confirmPassword) {
      logger.warn('[ChangePasswordForm] Password validation failed - passwords do not match');
      toast.error(t('settings:page.passwordsDoNotMatch'));
      return;
    }

    setIsSubmitting(true);
    void onSubmit({ currentPassword, newPassword })
      .then(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <form onSubmit={handlePasswordFormSubmit}>
      <div className={styles.field}>
        <label htmlFor="currentPassword">{t('settings:page.currentPasswordLabel')}</label>
        <PasswordInput
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          showPassword={showPasswords}
          onToggleVisibility={setShowPasswords}
          className={styles.settingsPasswordInput}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="newPassword">{t('settings:page.newPasswordLabel')}</label>
        <PasswordInput
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
          showPassword={showPasswords}
          onToggleVisibility={setShowPasswords}
          className={styles.settingsPasswordInput}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="confirmPassword">{t('settings:page.confirmPasswordLabel')}</label>
        <PasswordInput
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          showPassword={showPasswords}
          onToggleVisibility={setShowPasswords}
          className={styles.settingsPasswordInput}
        />
      </div>
      <div className={styles.buttonGroup}>
        <Button type="submit" disabled={isSubmitting} variant="primary-glass">
          <Save size={16} />
          {isSubmitting ? t('common:button.saving') : t('settings:page.buttons.save')}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
