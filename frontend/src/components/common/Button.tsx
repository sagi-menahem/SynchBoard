// File: frontend/src/components/common/Button.tsx

import React from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, style, ...props }) => {
    const baseStyle: React.CSSProperties = {
        borderRadius: '8px',
        border: '1px solid transparent',
        padding: '0.6em 1.2em',
        fontSize: '1em',
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'border-color 0.25s',
    };

    const variantStyle: Record<ButtonVariant, React.CSSProperties> = {
        primary: {
            backgroundColor: '#646cff',
            color: 'white',
        },
        secondary: {
            backgroundColor: '#555',
            color: 'white',
        },
    };

    return (
        <button 
            style={{ ...baseStyle, ...variantStyle[variant], ...style }} 
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;