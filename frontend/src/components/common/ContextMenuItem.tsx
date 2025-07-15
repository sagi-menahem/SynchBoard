// File: frontend/src/components/common/ContextMenuItem.tsx
import React from 'react';
import styles from './ContextMenu.module.css';

interface ContextMenuItemProps {
    onClick: () => void;
    children: React.ReactNode;
    destructive?: boolean;
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ onClick, children, destructive = false }) => {
    const itemClasses = `${styles.item} ${destructive ? styles.destructive : ''}`;
    
    return (
        <div className={itemClasses} onClick={onClick}>
            {children}
        </div>
    );
};