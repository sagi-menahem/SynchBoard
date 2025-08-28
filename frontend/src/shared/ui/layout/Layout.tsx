import React from 'react';

import { Outlet } from 'react-router-dom';

import styles from './Layout.module.css';

const Layout: React.FC = () => {
  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
