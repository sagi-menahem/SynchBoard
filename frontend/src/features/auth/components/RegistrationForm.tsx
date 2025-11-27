import type { AuthResponse } from 'features/settings/types/UserTypes';
import { Calendar, Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useFeatureConfig } from 'shared/context/FeatureConfigContext';
import { Button, Input, PasswordInput, RadioGroup } from 'shared/ui';

import { useRegisterForm } from '../hooks/forms';

import styles from './RegistrationForm.module.scss';

interface RegistrationFormProps {
  /** Callback fired when user registration is successful, receives either email for verification or auth token for immediate login */
  onRegistrationSuccess: (emailOrToken: string | AuthResponse) => void;
}

const MIN_PASSWORD_LENGTH = 6;

/**
 * User registration form with comprehensive profile fields.
 * Collects user information in a two-column responsive grid layout and handles
 * form submission with validation and loading states.
 *
 * @param onRegistrationSuccess - Callback fired when user registration is successful, receives the registered email
 */
const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistrationSuccess }) => {
  const { t } = useTranslation(['auth', 'common']);
  const { submitAction, isPending, state, formRef } = useRegisterForm(onRegistrationSuccess);
  const [gender, setGender] = useState<string>('');
  const featureConfig = useFeatureConfig();

  // Real-time validation state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Compute validation errors for real-time feedback
  const passwordTooShort = passwordTouched && password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const passwordsDoNotMatch = confirmPasswordTouched && confirmPassword.length > 0 && password !== confirmPassword;

  // Restore form values on error to prevent data loss
  useEffect(() => {
    if (!state.success && state.formValues && formRef.current) {
      const form = formRef.current;
      Object.entries(state.formValues).forEach(([key, value]) => {
        const element = form.elements.namedItem(key) as HTMLInputElement | null;
        if (element && key !== 'password' && key !== 'confirmPassword') {
          element.value = value;
        }
        if (key === 'gender' && value) {
          setGender(value);
        }
      });
    }
  }, [state, formRef]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordTouched(true);
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordTouched(true);
  }, []);

  // Use onSubmit to prevent form reset on error
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      submitAction(formData);
    },
    [submitAction],
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      <div className={`${styles.field} ${styles.fullWidth}`}>
        <label htmlFor="register-email">
          <Mail size={14} />
          {t('common:form.label.email')}
          <span className={styles.required}> *</span>
        </label>
        <Input id="register-email" name="email" type="email" required disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-password">
          <Lock size={14} />
          {t('common:form.label.password')}
          <span className={styles.required}> *</span>
        </label>
        <PasswordInput
          id="register-password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          required
          disabled={isPending}
          autoComplete="new-password"
        />
        {passwordTooShort ? (
          <span className={styles.error}>{t('auth:validation.passwordMinLength')}</span>
        ) : (
          <span className={styles.hint}>{t('auth:validation.passwordHint')}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="register-confirmPassword">
          <Lock size={14} />
          {t('common:form.label.confirmPassword')}
          <span className={styles.required}> *</span>
        </label>
        <PasswordInput
          id="register-confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          disabled={isPending}
          autoComplete="new-password"
        />
        {passwordsDoNotMatch && (
          <span className={styles.error}>{t('auth:validation.passwordMismatch')}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="register-firstName">
          <User size={14} />
          {t('common:form.label.firstName')}
          <span className={styles.required}> *</span>
        </label>
        <Input id="register-firstName" name="firstName" type="text" required disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-lastName">
          <User size={14} />
          {t('common:form.label.lastName')}
        </label>
        <Input id="register-lastName" name="lastName" type="text" disabled={isPending} />
      </div>

      <div className={`${styles.field} ${styles.fullWidth}`}>
        <label htmlFor="register-gender">
          <User size={14} />
          {t('common:form.label.gender')}
        </label>
        <RadioGroup
          id="register-gender"
          value={gender}
          onValueChange={setGender}
          name="gender"
          disabled={isPending}
          orientation="horizontal"
          options={[
            { value: 'male', label: t('common:form.option.male') },
            { value: 'female', label: t('common:form.option.female') },
          ]}
        />
        {/* Hidden input to ensure gender value is submitted with form */}
        <input type="hidden" name="gender" value={gender} />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-dateOfBirth">
          <Calendar size={14} />
          {t('common:form.label.dateOfBirth')}
        </label>
        <Input id="register-dateOfBirth" name="dateOfBirth" type="date" disabled={isPending} />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-phoneNumber">
          <Phone size={14} />
          {t('common:form.label.phoneNumber')}
        </label>
        <Input id="register-phoneNumber" name="phoneNumber" type="tel" disabled={isPending} />
      </div>

      {/* Show notice if email verification is disabled - config is guaranteed by FeatureConfigProvider */}
      {!featureConfig.emailVerificationEnabled && (
        <div className={styles.notice}>
          <p>
            {t(
              'auth:registerForm.noEmailVerificationNotice',
              'Quick registration enabled! You will be automatically logged in after creating your account.',
            )}
          </p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isPending}
        className={`${styles.submitButton} ${styles.fullWidth}`}
      >
        <UserPlus size={16} />
        {isPending ? t('common:button.registering') : t('auth:registerForm.button')}
      </Button>
    </form>
  );
};

export default RegistrationForm;
