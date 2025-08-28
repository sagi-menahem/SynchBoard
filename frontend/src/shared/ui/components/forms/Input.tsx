import React from 'react';

import styles from './Input.module.css';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => {
    const inputClasses = `${styles.input} ${className ?? ''}`.trim();
    return <input ref={ref} className={inputClasses} style={style} {...props} />;
  },
);

Input.displayName = 'Input';

export default Input;
