import React from 'react';

import { motion } from 'framer-motion';
import logger from 'shared/utils/logger';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Diagnostic logging for page transitions
  React.useEffect(() => {
    logger.debug('Page transition mounted:', {
      timestamp: new Date().toISOString(),
      childrenType: Array.isArray(children) ? 'array' : typeof children,
    });
  }, [children]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.2,
        ease: 'easeOut',
      }}
      onAnimationStart={() => {
        logger.debug('Animation start:', { 
          timestamp: new Date().toISOString(),
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        });
      }}
      onAnimationComplete={() => {
        logger.debug('Animation complete:', { 
          timestamp: new Date().toISOString(),
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        });
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;