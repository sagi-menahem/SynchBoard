import React from 'react';

import { useTranslation } from 'react-i18next';

import styles from './Sidebar.module.scss';

const Sidebar: React.FC = () => {
  const { t } = useTranslation(['board']);

  return (
    <aside className={styles.aside}>
      <p>{t('board:sidebar.title')}</p>
      <p>{t('board:sidebar.onlineUsers')}</p>
    </aside>
  );
};
export default Sidebar;
