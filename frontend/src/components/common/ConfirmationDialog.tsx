// File: frontend/src/components/common/ConfirmationDialog.tsx
import React from 'react';
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
    const { t } = useTranslation();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h3>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttonGroup}>
                    <Button variant="secondary" onClick={onClose}>
                        {t('common.button.cancel')}
                    </Button>
                    <Button onClick={handleConfirm} className={styles.confirmButton}>
                        {t('common.button.confirm')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationDialog;
