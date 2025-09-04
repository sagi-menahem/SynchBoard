import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Button from './Button';
import styles from './PasswordInput.module.scss';

interface PasswordInputProps {
  id: string;
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  autoComplete?: string;
  showPassword?: boolean;
  onToggleVisibility?: (show: boolean) => void;
}

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L6 6l15 15-3.06-3.06Z" />
    <path d="M1 1l22 22" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-1.65-1.65" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  className,
  autoComplete = 'current-password',
  showPassword: externalShowPassword,
  onToggleVisibility,
}) => {
  const { t } = useTranslation(['common']);
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const showPassword = externalShowPassword ?? internalShowPassword;

  const togglePasswordVisibility = () => {
    const newShowPassword = !showPassword;

    if (onToggleVisibility) {
      onToggleVisibility(newShowPassword);
    } else {
      setInternalShowPassword(newShowPassword);
    }
  };

  const combinedClassName = `${styles.passwordContainer} ${className ?? ''}`.trim();

  return (
    <div className={combinedClassName}>
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={onChange}
        autoComplete={autoComplete}
        className={styles.passwordInput}
        aria-describedby={`${id}-toggle`}
      />
      <Button
        id={`${id}-toggle`}
        type="button"
        variant="icon"
        className={styles.toggleButton}
        onClick={togglePasswordVisibility}
        disabled={disabled}
        aria-label={showPassword ? t('common:form.hidePassword') : t('common:form.showPassword')}
        tabIndex={0}
      >
        {showPassword ? (
          <EyeOffIcon className={styles.eyeIcon} />
        ) : (
          <EyeIcon className={styles.eyeIcon} />
        )}
      </Button>
    </div>
  );
};

export default PasswordInput;
