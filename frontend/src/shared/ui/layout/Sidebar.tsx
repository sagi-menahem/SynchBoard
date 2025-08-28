import React from 'react';

import { useTranslation } from 'react-i18next';

import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const { t } = useTranslation(['common']);

  return (
    <aside className={styles.aside}>
      <p>{t('common:sidebar.title')}</p>
      <p>{t('common:sidebar.onlineUsers')}</p>
    </aside>
  );
};
export default Sidebar;
