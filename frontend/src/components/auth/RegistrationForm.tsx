import React from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from 'components/common';
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
    { id: 'register-password', name: 'password', label: 'password', type: 'password', required: true },
    { id: 'register-firstName', name: 'firstName', label: 'firstName', type: 'text', required: true },
    { id: 'register-lastName', name: 'lastName', label: 'lastName', type: 'text', required: true },
    { id: 'register-phoneNumber', name: 'phoneNumber', label: 'phoneNumber', type: 'tel', required: false },
  ];

  return (
    <form action={submitAction} className={styles.form}>
      <h2>{t('registerForm.heading')}</h2>

      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      {inputs.map((input) => (
        <div key={input.id} className={styles.field}>
          <label htmlFor={input.id}>{t(`common.form.label.${input.label}`)}</label>
          <Input
            id={input.id}
            name={input.name}
            type={input.type}
            required={input.required}
            disabled={isPending}
          />
        </div>
      ))}

      <Button type="submit" className={styles.submitButton} disabled={isPending}>
        {isPending ? t('common.button.registering') : t('registerForm.button')}
      </Button>
    </form>
  );
};

export default RegistrationForm;
