import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from 'react-i18next';

import Button from '../forms/Button';

import styles from './Modal.module.scss';

// Animation variants for backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Animation variants for modal content
const contentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeIn' as const },
  },
};

/**
 * Props for the Modal component.
 */
interface ModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Callback when modal should be closed
  children: React.ReactNode; // Modal content to display
  className?: string; // Optional CSS class to apply to the modal overlay
}

/**
 * Reusable modal dialog component with backdrop and responsive behavior.
 * Provides a centered overlay with close functionality via backdrop click, close button, or Escape key.
 * Automatically adapts to mobile screens with full-screen layout for better usability.
 *
 * @param {boolean} isOpen - Controls whether the modal is visible
 * @param {function} onClose - Callback function called when modal should be closed
 * @param {React.ReactNode} children - Content to display inside the modal
 * @param {string} className - Optional CSS class to apply to the modal overlay
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  const { t } = useTranslation(['common']);

  // Lock body scroll when modal is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Simple approach: just prevent scrolling without position manipulation
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Handle keyboard shortcuts, especially Escape key to close modal
  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Render modal as a portal to document.body to escape any parent container constraints
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${styles.overlay} ${className || ''}`}
          onKeyDown={handleOverlayKeyDown}
          role="presentation"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.button
            className={styles.backdrop}
            onClick={onClose}
            aria-label={t('common:accessibility.closeModal')}
            tabIndex={-1}
            variants={backdropVariants}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            className={styles.content}
            role="dialog"
            aria-modal="true"
            variants={contentVariants}
          >
            <Button onClick={onClose} className={styles.closeButton} variant="icon">
              <X size={20} />
            </Button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
