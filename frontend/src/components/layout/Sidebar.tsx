// File: frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
    const { t } = useTranslation();

    return (
        <aside className={styles.aside}>
            <p>{t('sidebar.title')}</p>
            <p>{t('sidebar.onlineUsers')}</p>
        </aside>
    );
};
export default Sidebar;
