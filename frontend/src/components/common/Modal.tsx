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

    const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className={styles.overlay}
            onKeyDown={handleOverlayKeyDown}
            role="presentation"
        >
            <button
                className={styles.backdrop}
                onClick={onClose}
                aria-label="Close modal"
                tabIndex={-1}
            />
            <div
                className={styles.content}
                role="dialog"
                aria-modal="true"
            >
                <Button onClick={onClose} className={styles.closeButton} variant="secondary">
                    &times;
                </Button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
