import React from 'react';

import * as RadixRadioGroup from '@radix-ui/react-radio-group';

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
}

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
}) => {
  return (
    <RadixRadioGroup.Root
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
          <label 
            className={styles.radioLabel}
            htmlFor={`radio-${option.value}`}
          >
            {option.label}
          </label>
        </div>
      ))}
    </RadixRadioGroup.Root>
  );
};

export default RadioGroup;