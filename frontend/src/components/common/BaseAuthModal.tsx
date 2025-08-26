import React, { type ReactNode } from 'react';

import { Button, Modal } from 'components/common';

import styles from './CommonForm.module.css';

interface BaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  error?: string | null;
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
  error,
  submitButtonText,
  cancelButtonText,
  children,
  additionalActions,
  maxWidth = '400px',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ maxWidth }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#fff' }}>
          {title}
        </h2>
        
        {description && (
          <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
            {description}
          </p>
        )}

        <form onSubmit={onSubmit} className={styles.form}>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

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
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            {additionalActions}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BaseAuthModal;