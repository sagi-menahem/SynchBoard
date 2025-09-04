import { X } from 'lucide-react';
import React from 'react';

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
}

/**
 * Reusable modal dialog component with backdrop and responsive behavior.
 * Provides a centered overlay with close functionality via backdrop click, close button, or Escape key.
 * Automatically adapts to mobile screens with full-screen layout for better usability.
 * 
 * @param {boolean} isOpen - Controls whether the modal is visible
 * @param {function} onClose - Callback function called when modal should be closed
 * @param {React.ReactNode} children - Content to display inside the modal
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const { t } = useTranslation(['common']);
  if (!isOpen) {
    return null;
  }

  // Handle keyboard shortcuts, especially Escape key to close modal
  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onKeyDown={handleOverlayKeyDown} role="presentation">
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
};

export default Modal;
