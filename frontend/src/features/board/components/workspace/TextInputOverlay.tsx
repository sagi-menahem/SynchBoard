import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Textarea } from 'shared/ui';

import styles from './TextInputOverlay.module.scss';

// Animation variants for the text input overlay
const overlayVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * Props interface for TextInputOverlay component.
 * Defines the positioning, styling, and interaction handlers for the text input overlay.
 */
interface TextInputOverlayProps {
  /** Horizontal position of the overlay in pixels relative to the canvas */
  x: number;
  /** Vertical position of the overlay in pixels relative to the canvas */
  y: number;
  /** Width of the text input area in pixels */
  width: number;
  /** Height of the text input area in pixels */
  height: number;
  /** Text color for the input and submitted text */
  color: string;
  /** Font size for the text input and display */
  fontSize: number;
  /** Handler called when text is submitted (Enter key or blur) */
  onSubmit: (text: string) => void;
  /** Handler called when text input is cancelled (Escape key or empty submission) */
  onCancel: () => void;
}

/**
 * Positioned text input overlay for adding text elements to the canvas.
 * This component provides an inline text editing experience that appears at specific
 * canvas coordinates with customizable styling and keyboard shortcuts for submission/cancellation.
 *
 * @param x - Horizontal position of the overlay in pixels relative to the canvas
 * @param y - Vertical position of the overlay in pixels relative to the canvas
 * @param width - Width of the text input area in pixels
 * @param height - Height of the text input area in pixels
 * @param color - Text color for the input and submitted text
 * @param fontSize - Font size for the text input and display
 * @param onSubmit - Handler called when text is submitted (Enter key or blur)
 * @param onCancel - Handler called when text input is cancelled (Escape key or empty submission)
 */
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
  const { t } = useTranslation(['board', 'common']);
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [handleSubmit, onCancel],
  );

  return (
    <motion.div
      className={styles.textInputOverlay}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        color,
        fontSize: `${fontSize}px`,
      }}
      variants={overlayVariants}
      initial="initial"
      animate="animate"
    >
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        className={styles.textInput}
        placeholder={t('board:textInput.placeholder')}
        dir="ltr"
        style={{
          color,
          fontSize: `${fontSize}px`,
          width: '100%',
          height: '100%',
          resize: 'none',
        }}
      />
    </motion.div>
  );
};

export default TextInputOverlay;
