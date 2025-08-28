import React, { useEffect } from 'react';

import { Navigate } from 'react-router-dom';
import { Logger } from 'utils';

import { useAuth } from 'hooks/auth';

const logger = Logger;

const RootRedirect: React.FC = () => {
  const { token, isInitializing } = useAuth();
  
  useEffect(() => {
    if (!isInitializing) {
    }
  }, [token, isInitializing]);
  
  if (isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666',
      }}>
        Loading...
      </div>
    );
  }
  
  if (token) {
    return <Navigate to="/boards" replace />;
  }
  return <Navigate to="/auth" replace />;
};

export default RootRedirect;