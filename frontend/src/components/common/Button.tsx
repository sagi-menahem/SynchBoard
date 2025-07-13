// File: frontend/src/components/common/Button.tsx

import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
    const buttonClasses = `${styles.base} ${styles[variant]} ${className || ''}`.trim();

    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
};

export default Button;