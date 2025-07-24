// File: frontend/src/components/layout/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './Layout.module.css';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;