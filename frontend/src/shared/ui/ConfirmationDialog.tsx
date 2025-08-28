import React from 'react';

import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from './Button';
import styles from './ConfirmationDialog.module.css';
import Modal from './Modal';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useTranslation(['common']);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <AlertTriangle size={20} className={styles.warningIcon} />
          <h3 className={styles.title}>{title}</h3>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <Button variant="secondary" onClick={onClose}>
            {t('common:button.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {t('common:button.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
