// File: frontend/src/components/common/Modal.tsx
import React from 'react';
import Button from './Button';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) {
        return null;
    }

    const handleContentClick = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={handleContentClick}>
                <Button onClick={onClose} className={styles.closeButton} variant="secondary">
                    &times;
                </Button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
