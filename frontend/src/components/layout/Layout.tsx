import React from 'react';

import { Outlet } from 'react-router-dom';

import { ConnectionStatusBanner } from 'components/common';

import styles from './Layout.module.css';
import Navbar from './Navbar';

const Layout: React.FC = () => {
    return (
        <div className={styles.container}>
            <ConnectionStatusBanner />
            <Navbar />
            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default React.memo(Layout);
