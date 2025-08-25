import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from './HeaderToolbar.module.css';

interface TextInputOverlayProps {
  x: number;
  y: number;
  color: string;
  fontSize: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const TextInputOverlay: React.FC<TextInputOverlayProps> = ({
  x,
  y,
  color,
  fontSize,
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (text.trim() && text.trim().length <= 80) {
      onSubmit(text.trim());
    } else if (text.trim().length > 80) {
      // Truncate to 80 characters if too long
      onSubmit(text.trim().substring(0, 80));
    } else {
      onCancel();
    }
  }, [text, onSubmit, onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }, [handleSubmit, onCancel]);

  return (
    <div
      className={styles.textInputOverlay}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        color,
        fontSize: `${fontSize}px`,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        className={styles.textInput}
        placeholder="Type text..."
        maxLength={80}
        style={{
          color,
          fontSize: `${fontSize}px`,
        }}
      />
    </div>
  );
};

export default TextInputOverlay;