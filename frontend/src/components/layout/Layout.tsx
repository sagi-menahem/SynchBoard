// File: frontend/src/components/layout/Layout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', boxSizing: 'border-box' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', overflowY: 'auto', padding: '2rem', boxSizing: 'border-box' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
