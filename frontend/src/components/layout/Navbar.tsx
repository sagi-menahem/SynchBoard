import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
    const { logout } = useAuth();
    return (
        <nav style={{ background: '#333', padding: '1rem', color: 'white' }}>
            SynchBoard - Navbar
            <button onClick={logout} style={{ float: 'right' }}>Logout</button>
        </nav>
    );
};
export default Navbar;