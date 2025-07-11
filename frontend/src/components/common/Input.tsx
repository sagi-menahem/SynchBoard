// File: frontend/src/components/common/Input.tsx

import React from 'react';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ style, ...props }) => {
    const baseStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px',
        marginTop: '4px',
        boxSizing: 'border-box',
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '4px',
        color: '#fff',
    };

    return (
        <input
            style={{ ...baseStyle, ...style }}
            {...props}
        />
    );
};

export default Input;