import React, { useMemo } from 'react';

import type { ButtonVariant } from 'types/CommonTypes';

import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
    // Memoize className calculation to prevent unnecessary re-renders
    const buttonClasses = useMemo(() => {
        return `${styles.base} ${styles[variant]} ${className || ''}`.trim();
    }, [variant, className]);

    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
};

export default React.memo(Button);
