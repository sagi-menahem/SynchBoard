import React from 'react';

import type { ButtonVariant } from 'shared/types/CommonTypes';

import styles from './Button.module.scss';

/**
 * Props for the Button component.
 * Extends standard HTML button attributes for full compatibility.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant; // Visual styling variant for the button
}

/**
 * Versatile button component with multiple visual variants and full accessibility support.
 * Provides consistent styling across the application while supporting all standard HTML button features.
 * Uses forwardRef for proper ref handling in complex component hierarchies.
 * 
 * @param {ButtonVariant} variant - Visual styling variant (primary, secondary, destructive, icon, cta, warning, link)
 * @param {React.ReactNode} children - Button content (text, icons, or other elements)
 * @param {string} className - Optional CSS class to extend button styling
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, className, ...props }, ref) => {
    const buttonClasses = `${styles.base} ${styles[variant]} ${className ?? ''}`.trim();

    return (
      <button ref={ref} className={buttonClasses} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
