import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import React from 'react';

import styles from './RadioGroup.module.scss';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  name?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  required?: boolean;
  id?: string;
}

/**
 * Accessible radio button group component with Radix UI integration.
 * Provides keyboard navigation, screen reader support, and consistent styling.
 * 
 * @param {string} value - Currently selected option value
 * @param {string} defaultValue - Initial selected option value for uncontrolled usage
 * @param {function} onValueChange - Callback when selection changes. Parent should update state and handle business logic based on selected value.
 * @param {RadioOption[]} options - Array of selectable options with value, label, and optional disabled state
 * @param {boolean} disabled - Disables entire group when true, individual options can be disabled via options array
 * @param {string} name - Name attribute for form submission grouping
 * @param {string} className - Additional CSS classes for customization
 * @param {'horizontal' | 'vertical'} orientation - Layout direction: 'horizontal' for compact forms, 'vertical' for better readability with many options
 * @param {boolean} required - Marks the field as required for form validation
 * @param {string} id - Unique identifier for the radio group element
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  name,
  className = '',
  orientation = 'vertical',
  required = false,
  id,
}) => {
  return (
    <RadixRadioGroup.Root
      id={id}
      className={`${styles.radioGroup} ${styles[orientation]} ${className}`}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      orientation={orientation}
      required={required}
    >
      {options.map((option) => (
        <div key={option.value} className={styles.radioItem}>
          <RadixRadioGroup.Item
            className={styles.radioButton}
            value={option.value}
            disabled={option.disabled ?? disabled}
            id={`radio-${option.value}`}
            aria-label={option.ariaLabel}
          >
            <RadixRadioGroup.Indicator className={styles.radioIndicator} />
          </RadixRadioGroup.Item>
          <label className={styles.radioLabel} htmlFor={`radio-${option.value}`}>
            {option.label}
          </label>
        </div>
      ))}
    </RadixRadioGroup.Root>
  );
};

export default RadioGroup;
