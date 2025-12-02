import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Button from './Button';
import styles from './PasswordInput.module.scss';

// Animation variants for the eye icon
const iconVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.1, ease: 'easeIn' as const },
  },
};

/**
 * Props for the PasswordInput component.
 */
interface PasswordInputProps {
  id: string; // HTML id attribute for the input
  name?: string; // HTML name attribute for form submission
  value?: string; // Current input value
  placeholder?: string; // Placeholder text to display
  required?: boolean; // Whether the field is required
  disabled?: boolean; // Whether the input is disabled
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Change event handler
  className?: string;
  autoComplete?: string; // Browser autocomplete attribute
  showPassword?: boolean; // External control for password visibility
  onToggleVisibility?: (show: boolean) => void; // Callback when visibility toggles
}

/**
 * Eye icon component for showing password visibility state.
 */
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

/**
 * Eye-off icon component for hiding password visibility state.
 */
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

/**
 * Password input field with toggle visibility functionality.
 * Provides a secure way to enter passwords while allowing users to verify their input.
 * Supports both controlled and uncontrolled visibility state management.
 *
 * @param {string} id - HTML id attribute for the input element
 * @param {string} name - HTML name attribute for form submission
 * @param {string} value - Current input value for controlled components
 * @param {string} placeholder - Placeholder text to display when empty
 * @param {boolean} required - Whether the field is required for form validation
 * @param {boolean} disabled - Whether the input is disabled and non-interactive
 * @param {function} onChange - Change event handler for input updates
 * @param {string} className - Optional CSS class to apply to the container
 * @param {string} autoComplete - Browser autocomplete behavior
 * @param {boolean} showPassword - External control for password visibility state
 * @param {function} onToggleVisibility - Callback when visibility state changes
 */
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

  // Use external state if provided, otherwise use internal state
  const showPassword = externalShowPassword ?? internalShowPassword;

  // Toggle visibility using external callback or internal state
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
        tabIndex={-1}
      >
        <AnimatePresence mode="wait" initial={false}>
          {showPassword ? (
            <motion.span
              key="eye-off"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex' }}
            >
              <EyeOffIcon className={styles.eyeIcon} />
            </motion.span>
          ) : (
            <motion.span
              key="eye"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ display: 'flex' }}
            >
              <EyeIcon className={styles.eyeIcon} />
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};

export default PasswordInput;
