import { motion } from 'framer-motion';
import React from 'react';

/**
 * Props for the PageTransition component.
 */
interface PageTransitionProps {
  children: React.ReactNode; // Content to animate during page transitions
}

/**
 * Page transition wrapper component that provides smooth enter/exit animations.
 * Uses Framer Motion to create subtle fade and slide transitions between page changes.
 * Enhances user experience by providing visual continuity during navigation.
 * 
 * @param {React.ReactNode} children - Content to animate during page transitions
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
