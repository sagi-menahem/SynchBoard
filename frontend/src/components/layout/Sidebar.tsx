import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <aside style={{ background: '#282828', padding: '1rem', color: 'white', width: '200px' }}>
            <p>Sidebar</p>
            <p>Online Users:</p>
            {/* This would be populated with data later */}
        </aside>
    );
};
export default Sidebar;