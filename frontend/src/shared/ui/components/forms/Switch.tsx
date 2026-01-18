import React, { useCallback, useId } from 'react';

/**
 * Props for the custom Switch component.
 */
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}

/**
 * Lightweight accessible switch component replacing @headlessui/react Switch.
 * Provides keyboard navigation (Space/Enter) and proper ARIA attributes.
 * Renders as a button for better accessibility.
 */
const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  style,
  className,
  children,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
}) => {
  const id = useId();

  const handleClick = useCallback(() => {
    onChange(!checked);
  }, [checked, onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onChange(!checked);
      }
    },
    [checked, onChange]
  );

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={style}
      className={className}
    >
      {children}
    </button>
  );
};

export default Switch;
