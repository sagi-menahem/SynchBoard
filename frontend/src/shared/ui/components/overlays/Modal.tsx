import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from 'react-i18next';

import Button from '../forms/Button';

import styles from './Modal.module.scss';

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

  if (!isOpen) {
    return null;
  }

  // Handle keyboard shortcuts, especially Escape key to close modal
  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={`${styles.overlay} ${className || ''}`}
      onKeyDown={handleOverlayKeyDown}
      role="presentation"
    >
      <button
        className={styles.backdrop}
        onClick={onClose}
        aria-label={t('common:accessibility.closeModal')}
        tabIndex={-1}
      />
      <div className={styles.content} role="dialog" aria-modal="true">
        <Button onClick={onClose} className={styles.closeButton} variant="icon">
          <X size={20} />
        </Button>
        {children}
      </div>
    </div>
  );

  // Render modal as a portal to document.body to escape any parent container constraints
  return createPortal(modalContent, document.body);
};

export default Modal;
