import React from 'react';

import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Diagnostic logging for page transitions
  React.useEffect(() => {
    console.log('📄 PAGE TRANSITION MOUNTED:', {
      timestamp: new Date().toISOString(),
      childrenType: Array.isArray(children) ? 'array' : typeof children
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
        console.log('🎬 ANIMATION START:', { 
          timestamp: new Date().toISOString(),
          viewport: `${window.innerWidth}x${window.innerHeight}`
        });
      }}
      onAnimationComplete={() => {
        console.log('✅ ANIMATION COMPLETE:', { 
          timestamp: new Date().toISOString(),
          viewport: `${window.innerWidth}x${window.innerHeight}`
        });
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;