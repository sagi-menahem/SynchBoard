// File: frontend/src/components/common/ContextMenu.tsx
import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, children }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const style = {
        top: `${y}px`,
        left: `${x}px`,
    };

    return (
        <div ref={menuRef} className={styles.menu} style={style}>
            {children}
        </div>
    );
};
