import React from 'react';

import { Calendar, Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input, PasswordInput } from 'shared/ui';

import { useRegisterForm } from '../hooks/forms';

import styles from './RegistrationForm.module.css';

interface RegistrationFormProps {
    onRegistrationSuccess: (email: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistrationSuccess }) => {
  const { t } = useTranslation(['auth', 'common']);
  const { state, submitAction, isPending } = useRegisterForm(onRegistrationSuccess);


  return (
    <form action={submitAction} className={styles.form}>
      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="register-email">
          <Mail size={14} />
          {t('common:form.label.email')}
          <span className={styles.required}> *</span>
        </label>
        <Input
          id="register-email"
          name="email"
          type="email"
          required={true}
          disabled={isPending}
        />
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
          required={true}
          disabled={isPending}
          autoComplete="new-password"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-firstName">
          <User size={14} />
          {t('common:form.label.firstName')}
          <span className={styles.required}> *</span>
        </label>
        <Input
          id="register-firstName"
          name="firstName"
          type="text"
          required={true}
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-lastName">
          <User size={14} />
          {t('common:form.label.lastName')}
        </label>
        <Input
          id="register-lastName"
          name="lastName"
          type="text"
          required={false}
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-gender">
          <User size={14} />
          {t('common:form.label.gender')}
          <span className={styles.required}> *</span>
        </label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="gender"
              value="male"
              required
              disabled={isPending}
            />
            {t('common:form.option.male')}
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="gender"
              value="female"
              required
              disabled={isPending}
            />
            {t('common:form.option.female')}
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="register-dateOfBirth">
          <Calendar size={14} />
          {t('common:form.label.dateOfBirth')}
        </label>
        <Input
          id="register-dateOfBirth"
          name="dateOfBirth"
          type="date"
          required={false}
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-phoneNumber">
          <Phone size={14} />
          {t('common:form.label.phoneNumber')}
        </label>
        <Input
          id="register-phoneNumber"
          name="phoneNumber"
          type="tel"
          required={false}
          disabled={isPending}
        />
      </div>

      <Button type="submit" variant="primary" disabled={isPending} className={styles.submitButton}>
        <UserPlus size={16} />
        {isPending ? t('common:button.registering') : t('auth:registerForm.button')}
      </Button>
    </form>
  );
};

export default RegistrationForm;
