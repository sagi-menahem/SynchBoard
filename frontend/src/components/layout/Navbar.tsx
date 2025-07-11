// File: frontend/src/components/layout/Navbar.tsx

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const Navbar: React.FC = () => {
    const { logout } = useAuth();

    return (
        <nav style={navStyle}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>SynchBoard</span>
            <Button onClick={logout} variant="secondary">
                Logout
            </Button>
        </nav>
    );
};

const navStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
};

export default Navbar;