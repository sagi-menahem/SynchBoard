import React from 'react';

import styles from './Textarea.module.scss';

/**
 * Props for the Textarea component.
 * Extends standard HTML textarea attributes for full compatibility.
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

/**
 * Multi-line text input component with consistent styling and resizable height.
 * Provides a foundation for all multi-line text inputs with proper ref forwarding.
 * Supports all standard HTML textarea attributes including rows, cols, placeholder, etc.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaClasses = `${styles.textarea} ${className ?? ''}`.trim();

    return <textarea ref={ref} className={textareaClasses} {...props} />;
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
