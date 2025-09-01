import React, { type ReactNode } from 'react';

import { Button, Modal } from 'shared/ui';
import styles from 'shared/ui/styles/CommonForm.module.scss';

interface BaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  submitButtonText: string;
  cancelButtonText: string;
  children: ReactNode;
  additionalActions?: ReactNode;
  maxWidth?: string;
}

const BaseAuthModal: React.FC<BaseAuthModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onSubmit,
  isPending,
  submitButtonText,
  cancelButtonText,
  children,
  additionalActions,
  maxWidth = '400px',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContainer} style={{ maxWidth }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {title}
          </h2>
        </div>
        
        {description && (
          <p className={styles.modalDescription}>
            {description}
          </p>
        )}

        <form onSubmit={onSubmit} className={styles.form}>
          {children}

          <div className={styles.buttonGroup}>
            <Button 
              type="button" 
              onClick={onClose} 
              disabled={isPending} 
              variant="secondary"
            >
              {cancelButtonText}
            </Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              variant="primary"
            >
              {submitButtonText}
            </Button>
          </div>
        </form>

        {additionalActions && (
          <div className={styles.additionalActions}>
            {additionalActions}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BaseAuthModal;