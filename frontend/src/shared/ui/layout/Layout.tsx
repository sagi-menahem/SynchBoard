import React from 'react';

import { Outlet } from 'react-router-dom';

import styles from './Layout.module.scss';

/**
 * Root application layout component providing consistent page structure.
 * Serves as a container for all application routes with flexible content area
 * that adapts padding and overflow behavior based on page requirements.
 */
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
