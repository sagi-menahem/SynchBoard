import React from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input, PasswordInput } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
import { useRegisterForm } from 'hooks/auth/forms';

interface RegistrationFormProps {
    onRegistrationSuccess: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistrationSuccess }) => {
  const { t } = useTranslation();
  const { state, submitAction, isPending } = useRegisterForm(onRegistrationSuccess);

  const inputs = [
    { id: 'register-email', name: 'email', label: 'email', type: 'email', required: true },
    { id: 'register-firstName', name: 'firstName', label: 'firstName', type: 'text', required: true },
    { id: 'register-lastName', name: 'lastName', label: 'lastName', type: 'text', required: false },
  ];

  return (
    <form action={submitAction} className={styles.form}>
      <h2>{t('registerForm.heading')}</h2>

      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      {inputs.map((input) => {
        if (input.name === 'email') {
          return (
            <React.Fragment key={input.id}>
              <div className={styles.field}>
                <label htmlFor={input.id}>
                  {t(`common.form.label.${input.label}`)}
                  {input.required && <span className={styles.required}> *</span>}
                </label>
                <Input
                  id={input.id}
                  name={input.name}
                  type={input.type}
                  required={input.required}
                  disabled={isPending}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="register-password">
                  {t('common.form.label.password')}
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
            </React.Fragment>
          );
        }
        return (
          <div key={input.id} className={styles.field}>
            <label htmlFor={input.id}>
              {t(`common.form.label.${input.label}`)}
              {input.required && <span className={styles.required}> *</span>}
            </label>
            <Input
              id={input.id}
              name={input.name}
              type={input.type}
              required={input.required}
              disabled={isPending}
            />
          </div>
        );
      })}

      <div className={styles.field}>
        <label htmlFor="register-gender">
          {t('common.form.label.gender')}
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
            {t('common.form.option.male')}
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="gender"
              value="female"
              required
              disabled={isPending}
            />
            {t('common.form.option.female')}
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="register-dateOfBirth">
          {t('common.form.label.dateOfBirth')}
        </label>
        <Input
          id="register-dateOfBirth"
          name="dateOfBirth"
          type="date"
          required={false}
          disabled={isPending}
          className={styles.dateInput}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="register-phoneNumber">
          {t('common.form.label.phoneNumber')}
        </label>
        <Input
          id="register-phoneNumber"
          name="phoneNumber"
          type="tel"
          required={false}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className={styles.submitButton} disabled={isPending}>
        {isPending ? t('common.button.registering') : t('registerForm.button')}
      </Button>
    </form>
  );
};

export default RegistrationForm;
