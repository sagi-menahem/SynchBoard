// File: frontend/src/components/common/Modal.tsx

import React from 'react';
import './Modal.css';
import Button from './Button';

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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={handleContentClick}>
                <Button 
                    onClick={onClose} 
                    className="modal-close-button"
                    variant="secondary"
                    style={{ 
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        padding: '0.2em 0.5em',
                        lineHeight: '1',
                     }}
                >
                    &times;
                </Button>
                {children}
            </div>
        </div>
    );
};

export default Modal;