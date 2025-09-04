import { X } from 'lucide-react';
import React from 'react';

import { useTranslation } from 'react-i18next';

import Button from '../forms/Button';

import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const { t } = useTranslation(['common']);
  if (!isOpen) {
    return null;
  }

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
