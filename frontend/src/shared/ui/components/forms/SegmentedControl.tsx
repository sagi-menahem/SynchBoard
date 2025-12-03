import React from 'react';

import styles from './SegmentedControl.module.scss';

export interface SegmentOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

interface SegmentedControlProps {
  value?: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
  options: SegmentOption[];
  disabled?: boolean;
  name?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  required?: boolean;
  id?: string;
  'aria-labelledby'?: string;
}

/**
 * Accessible segmented control component for single-option selection.
 * Provides a modern, mobile-friendly alternative to radio buttons with
 * clear visual feedback using the user's chosen theme color.
 *
 * @param value - Currently selected option value
 * @param defaultValue - Initial selected option value for uncontrolled usage
 * @param onValueChange - Callback when selection changes
 * @param options - Array of selectable options with value, label, and optional disabled state
 * @param disabled - Disables entire control when true
 * @param name - Name attribute for form submission
 * @param className - Additional CSS classes for customization
 * @param orientation - Layout direction: 'horizontal' (default) or 'vertical'
 * @param required - Marks the field as required for form validation
 * @param id - Unique identifier for the control element
 */
const SegmentedControl: React.FC<SegmentedControlProps> = ({
  value,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  name,
  className = '',
  orientation = 'horizontal',
  required = false,
  id,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const currentValue = value ?? internalValue;

  const handleSelect = (optionValue: string, optionDisabled?: boolean) => {
    if (disabled || optionDisabled) return;

    if (value === undefined) {
      setInternalValue(optionValue);
    }
    onValueChange(optionValue);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    optionValue: string,
    optionDisabled?: boolean,
  ) => {
    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    if (e.key === prevKey || e.key === nextKey) {
      e.preventDefault();
      const direction = e.key === nextKey ? 1 : -1;
      let newIndex = index + direction;

      // Find next non-disabled option
      while (newIndex >= 0 && newIndex < options.length) {
        if (!options[newIndex].disabled) {
          const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
          (buttons?.[newIndex] as HTMLButtonElement)?.focus();
          break;
        }
        newIndex += direction;
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(optionValue, optionDisabled);
    }
  };

  return (
    <div
      id={id}
      className={`${styles.segmentedControl} ${styles[orientation]} ${className}`}
      role="radiogroup"
      aria-required={required}
      aria-labelledby={ariaLabelledBy}
    >
      {options.map((option, index) => {
        const isSelected = currentValue === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.ariaLabel}
            className={`${styles.segment} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
            onClick={() => handleSelect(option.value, option.disabled)}
            onKeyDown={(e) => handleKeyDown(e, index, option.value, option.disabled)}
            disabled={isDisabled}
            tabIndex={isSelected ? 0 : -1}
          >
            {option.label}
          </button>
        );
      })}
      {name && <input type="hidden" name={name} value={currentValue} />}
    </div>
  );
};

export default SegmentedControl;
