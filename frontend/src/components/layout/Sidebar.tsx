// File: frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    return (
        <aside className={styles.aside}>
            <p>Sidebar</p>
            <p>Online Users:</p>

        </aside>
    );
};
export default Sidebar;