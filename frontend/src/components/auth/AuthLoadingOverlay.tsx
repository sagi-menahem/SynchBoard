import React from 'react';

import { motion } from 'framer-motion';

import { PageLoader } from '../common';

interface AuthLoadingOverlayProps {
  isVisible: boolean;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({ isVisible }) => {
  // Also check sessionStorage for global loading state
  const globalLoading = sessionStorage.getItem('oauth_loading') === 'true';
  const shouldShow = isVisible || globalLoading;
  
  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(47, 47, 47, 0.95)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <PageLoader message="Signing you in..." />
    </motion.div>
  );
};