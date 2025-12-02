import { motion } from 'framer-motion';
import React from 'react';

import styles from './PageTransition.module.scss';

/**
 * Props for the PageTransition component.
 */
interface PageTransitionProps {
  children: React.ReactNode; // Content to animate during page transitions
  className?: string; // Optional className for styling
  style?: React.CSSProperties; // Optional inline styles
}

/**
 * Page transition wrapper component that provides smooth enter/exit animations.
 * Uses Framer Motion to create subtle fade and slide transitions between page changes.
 * Enhances user experience by providing visual continuity during navigation.
 *
 * @param {React.ReactNode} children - Content to animate during page transitions
 * @param {string} className - Optional className for styling
 * @param {React.CSSProperties} style - Optional inline styles
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, className, style }) => {
  const combinedClassName = [styles.pageWrapper, className].filter(Boolean).join(' ');

  return (
    <motion.div
      className={combinedClassName}
      style={style}
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
