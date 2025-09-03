import React from 'react';

import type { ButtonVariant } from 'shared/types/CommonTypes';

import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

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
