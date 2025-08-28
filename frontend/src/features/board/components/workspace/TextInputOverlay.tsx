import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';


import styles from './CanvasToolSection.module.css';

interface TextInputOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const TextInputOverlay: React.FC<TextInputOverlayProps> = ({
  x,
  y,
  width,
  height,
  color,
  fontSize,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSubmit(text.trim());
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
        width: `${width}px`,
        height: `${height}px`,
        color,
        fontSize: `${fontSize}px`,
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        className={styles.textInput}
        placeholder={t('textInput.placeholder')}
        dir="auto"
        style={{
          color,
          fontSize: `${fontSize}px`,
          width: '100%',
          height: '100%',
          resize: 'none',
        }}
      />
    </div>
  );
};

export default TextInputOverlay;