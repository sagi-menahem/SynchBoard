import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { useTranslation } from 'react-i18next';
import styles from 'shared/ui/styles/CommonForm.module.scss';

import Button from '../forms/Button';

import Modal from './Modal';

// Animation variants for warning icon - subtle shake/pulse effect
const iconVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
      delay: 0.1,
    },
  },
};

// Animation variants for button group - stagger effect
const buttonGroupVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15,
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

/**
 * Props for the ConfirmationDialog component.
 */
interface ConfirmationDialogProps {
  isOpen: boolean; // Controls dialog visibility
  onClose: () => void; // Callback when dialog is closed without confirmation
  onConfirm: () => void; // Callback when user confirms the action
  title: string; // Dialog title text
  message: string; // Confirmation message to display
}

/**
 * Modal dialog component for confirming destructive or important actions.
 * Displays a warning icon, custom title and message, with cancel and confirm buttons.
 * Ensures user intent before proceeding with potentially irreversible operations.
 *
 * @param {boolean} isOpen - Controls whether the dialog is visible
 * @param {function} onClose - Callback function called when dialog is closed without confirmation
 * @param {function} onConfirm - Callback function called when user confirms the action
 * @param {string} title - The title text displayed in the dialog header
 * @param {string} message - The confirmation message explaining the action consequences
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const { t } = useTranslation(['common']);

  // Execute confirmation callback and close dialog
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="animate"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <AlertTriangle size={20} className={styles.warningIcon} />
          </motion.div>
          <h3 className={styles.modalTitle}>{title}</h3>
        </div>
        <p className={styles.modalMessage}>{message}</p>
        <motion.div
          className={styles.buttonGroup}
          variants={buttonGroupVariants}
          initial="initial"
          animate="animate"
        >
          <Button variant="secondary-glass" onClick={onClose}>
            {t('common:button.cancel')}
          </Button>
          <Button variant="primary-glass" onClick={handleConfirm}>
            {t('common:button.confirm')}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
