import React from 'react';

import styles from './Input.module.css';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, style, ...props }) => {
    const inputClasses = `${styles.input} ${className || ''}`.trim();
    return <input className={inputClasses} style={style} {...props} />;
};

export default Input;
