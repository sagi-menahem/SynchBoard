import React from 'react';

import styles from './Textarea.module.scss';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaClasses = `${styles.textarea} ${className ?? ''}`.trim();

    return <textarea ref={ref} className={textareaClasses} {...props} />;
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
