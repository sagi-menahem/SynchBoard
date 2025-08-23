import React from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Input } from 'components/common';
import styles from 'components/common/CommonForm.module.css';
import { useLoginForm } from 'hooks/auth/forms';

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { state, submitAction, isPending } = useLoginForm();

  return (
    <form action={submitAction} className={styles.form}>
      <h2>{t('loginForm.heading')}</h2>

      {state.error && (
        <div className={styles.error} role="alert">
          {state.error}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="login-email">{t('common.form.label.email')}</label>
        <Input
          id="login-email"
          name="email"
          type="email"
          required
          disabled={isPending}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">{t('common.form.label.password')}</label>
        <Input
          id="login-password"
          name="password"
          type="password"
          required
          disabled={isPending}
        />
      </div>

      <Button type="submit" className={styles.submitButton} disabled={isPending}>
        {isPending ? t('common.button.loggingIn') : t('loginForm.button')}
      </Button>
    </form>
  );
};

export default LoginForm;
