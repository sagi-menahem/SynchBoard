import React, { useEffect } from 'react';

import { Navigate } from 'react-router-dom';
import { Logger } from 'utils';

import { useAuth } from 'hooks/auth';

const logger = Logger;

const RootRedirect: React.FC = () => {
  const { token, isInitializing } = useAuth();
  
  useEffect(() => {
    if (!isInitializing) {
      logger.info('[RootRedirect] Checking auth status for root route', {
        hasToken: !!token,
        tokenLength: token?.length,
        redirectingTo: token ? '/boards' : '/auth',
      });
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
    logger.debug('[RootRedirect] User authenticated, redirecting to boards');
    return <Navigate to="/boards" replace />;
  }
  
  logger.debug('[RootRedirect] User not authenticated, redirecting to auth');
  return <Navigate to="/auth" replace />;
};

export default RootRedirect;