import React from 'react';

import styles from './Input.module.scss';

/**
 * Standard input field component with consistent styling and full HTML input compatibility.
 * Provides a foundation for all text-based form inputs with proper ref forwarding.
 * Supports all standard HTML input attributes including type, placeholder, validation, etc.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => {
    const inputClasses = `${styles.input} ${className ?? ''}`.trim();
    return <input ref={ref} className={inputClasses} style={style} {...props} />;
  },
);

Input.displayName = 'Input';

export default Input;
